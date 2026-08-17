export const allPermissions = [
  "dashboard",
  "properties",
  "enquiries",
  "news",
  "users",
  "settings",
  "activity",
];

export const rolePermissions = {
  user: [],
  editor: ["dashboard", "properties", "news"],
  manager: ["dashboard", "properties", "news", "enquiries", "users"],
  admin: allPermissions,
};

export function permissionsFor(user) {
  if (!user) return [];
  if (user.role === "admin") return allPermissions;
  return user.permissions?.length ? user.permissions : rolePermissions[user.role] || [];
}
