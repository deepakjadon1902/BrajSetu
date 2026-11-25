import { useEffect, useState } from "react";

type StoredDraft<T> = { scope: string; id: string; draft: T; updatedAt: number };
type DraftStatus = "saving" | "saved" | "unavailable";
type DraftEntry<T> = StoredDraft<T> & { status: DraftStatus };

const storeName = "drafts";
let connection: Promise<IDBDatabase> | undefined;

function openDatabase() {
  connection ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("braj-setu-listing-drafts", 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(storeName, { keyPath: ["scope", "id"] });
      store.createIndex("scope", "scope");
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      database.onclose = database.onversionchange = () => {
        database.close();
        connection = undefined;
      };
      resolve(database);
    };
  }).catch((error) => {
    connection = undefined;
    throw error;
  });
  return connection;
}

async function runDraftTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = operation(transaction.objectStore(storeName));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onabort = () => reject(transaction.error ?? request.error);
  });
}

export function useListingDrafts<T>(scope: string | null) {
  const [entries, setEntries] = useState<DraftEntry<T>[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    if (!scope) return;
    let active = true;
    void runDraftTransaction<StoredDraft<T>[]>("readonly", (store) =>
      store.index("scope").getAll(scope),
    ).then(
      (records) => {
        if (!active) return;
        setEntries(
          records
            .sort((first, second) => second.updatedAt - first.updatedAt)
            .map((record) => ({ ...record, status: "saved" })),
        );
        setLoadState("ready");
      },
      () => {
        if (active) setLoadState("unavailable");
      },
    );
    return () => {
      active = false;
    };
  }, [scope]);

  function save(id: string, draft: T) {
    if (!scope) return;
    const record = { scope, id, draft, updatedAt: Date.now() };
    setEntries((current) => [
      { ...record, status: "saving" },
      ...current.filter((entry) => entry.id !== id),
    ]);

    function updateStatus(status: DraftStatus) {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === id && entry.draft === draft ? { ...entry, status } : entry,
        ),
      );
    }

    void runDraftTransaction("readwrite", (store) => store.put(record)).then(
      () => updateStatus("saved"),
      () => updateStatus("unavailable"),
    );
  }

  async function clear(id: string) {
    if (!scope) return true;
    try {
      await runDraftTransaction("readwrite", (store) => store.delete([scope, id]));
      setEntries((current) => current.filter((entry) => entry.id !== id));
      return true;
    } catch {
      return false;
    }
  }

  return {
    entries,
    loading: Boolean(scope) && loadState === "loading",
    unavailable: loadState === "unavailable",
    save,
    clear,
  };
}

export function listingDraftMessage(status?: DraftStatus, unavailable = false) {
  if (status === "saving") return "Saving draft…";
  if (status === "saved") return "Draft saved on this browser.";
  if (status === "unavailable" || unavailable)
    return "Draft saving is unavailable on this browser.";
  return "Drafts save automatically on this browser as you edit.";
}
