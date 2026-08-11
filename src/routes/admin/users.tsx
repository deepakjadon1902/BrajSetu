import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Fragment, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import {
  allPermissions,
  permissionLabels,
  permissionsFor,
  roleLabels,
  rolePermissions,
  uid,
  useStore,
  type AdminPermission,
  type AppUser,
  type UserRole,
} from "@/lib/mock-store";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users | PropVista Admin" },
      {
        name: "description",
        content: "Manage PropVista accounts, roles and account status.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Users | PropVista Admin" },
      { property: "og:description", content: "Manage PropVista accounts and roles." },
    ],
  }),
  component: AdminUsers,
});

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-navy outline-none focus:border-navy";

function AdminUsers() {
  const { users, saveUser, deleteUser, adminUser } = useStore();
  const [creating, setCreating] = useState(false);
  const [accessFor, setAccessFor] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user" as AppUser["role"],
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) {
      toast.error("Name, email and an 8+ character password are required.");
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase())) {
      toast.error("That email is already registered.");
      return;
    }
    saveUser({
      id: uid("u"),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
      role: form.role,
      status: "Active",
      createdAt: new Date().toISOString(),
    });
    toast.success("User created.");
    setForm({ name: "", email: "", phone: "", password: "", role: "user" });
    setCreating(false);
  }

  return (
    <AdminShell
      permission="users"
      title="Users"
      description="Accounts registered on the public site plus admin staff."
      actions={
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-background"
        >
          <Plus className="h-4 w-4" /> Add user
        </button>
      }
    >
      {creating ? (
        <form
          onSubmit={onSubmit}
          className="mb-6 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          <input
            className={inputClass}
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className={inputClass}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className={inputClass}
            type="password"
            placeholder="Temporary password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            className={inputClass}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as AppUser["role"] })}
          >
            {(Object.keys(roleLabels) as UserRole[]).map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-background"
          >
            Create user
          </button>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <Fragment key={user.id}>
              <tr>
                <td className="px-4 py-3 font-semibold text-navy">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="block">{user.email}</span>
                  <span className="block text-xs">{user.phone}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Role for ${user.name}`}
                    value={user.role}
                    onChange={(e) =>
                      saveUser({
                        ...user,
                        role: e.target.value as UserRole,
                        permissions: undefined,
                      })
                    }
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-navy"
                  >
                    {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      saveUser({
                        ...user,
                        status: user.status === "Active" ? "Suspended" : "Active",
                      })
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      user.status === "Active"
                        ? "bg-ice text-navy"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {user.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={user.role === "user"}
                      onClick={() =>
                        setAccessFor((id) => (id === user.id ? null : user.id))
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:bg-ice disabled:opacity-30"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> Access
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${user.name}`}
                      disabled={user.id === adminUser?.id}
                      onClick={() => {
                        deleteUser(user.id);
                        toast.success("User deleted.");
                      }}
                      className="rounded-full border border-border p-2 text-destructive hover:bg-ice disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
              {accessFor === user.id ? (
                <tr className="bg-smoke/50">
                  <td colSpan={6} className="px-4 py-4">
                    <p className="text-xs font-semibold tracking-wide text-navy uppercase">
                      Admin areas for {user.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {user.role === "admin"
                        ? "Admins always have full access to every area."
                        : `Defaults come from the ${roleLabels[user.role]} role — tick to customise.`}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {allPermissions.map((permission) => {
                        const current = permissionsFor(user);
                        const checked = current.includes(permission);
                        return (
                          <button
                            key={permission}
                            type="button"
                            disabled={user.role === "admin"}
                            onClick={() => {
                              const next = checked
                                ? current.filter((p) => p !== permission)
                                : ([...current, permission] as AdminPermission[]);
                              saveUser({ ...user, permissions: next });
                              toast.success(`Access updated for ${user.name}.`);
                            }}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                              checked
                                ? "bg-navy text-background"
                                : "border border-border text-navy"
                            } disabled:opacity-60`}
                          >
                            {permissionLabels[permission]}
                          </button>
                        );
                      })}
                      {user.role !== "admin" ? (
                        <button
                          type="button"
                          onClick={() => {
                            saveUser({ ...user, permissions: undefined });
                            toast.success("Reset to role defaults.");
                          }}
                          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                        >
                          Reset to {roleLabels[user.role]} defaults (
                          {rolePermissions[user.role].length})
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
