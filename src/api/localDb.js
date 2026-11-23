// Local data layer — replaces the old hosted database.
// The starting content lives in src/data/content.json.
// Edits made in the game (dev log notes) or the /admin editor are saved in this
// browser's localStorage, layered on top of content.json. "Reset" clears them.
import seed from "@/data/content.json";

const STORAGE_KEY = "to-disrupt-content-v1";

const clone = (value) => JSON.parse(JSON.stringify(value));

function loadAll() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...clone(seed), ...JSON.parse(saved) };
  } catch {
    // Storage unavailable (private mode, etc.) — fall back to the seed content.
  }
  return clone(seed);
}

let store = loadAll();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore — changes still apply for this session.
  }
}

function sortBy(items, sort) {
  if (!sort) return items;
  const desc = sort.startsWith("-");
  const key = desc ? sort.slice(1) : sort;
  return [...items].sort((a, b) => {
    const av = a[key] ?? "";
    const bv = b[key] ?? "";
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
}

function makeEntity(name) {
  const rows = () => (store[name] ||= []);
  return {
    async list({ sort } = {}) {
      return { items: clone(sortBy(rows(), sort)) };
    },
    async create(values) {
      const record = {
        id: `${name.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        created_date: new Date().toISOString(),
        ...values,
      };
      rows().push(record);
      persist();
      return clone(record);
    },
    async update(id, values) {
      const record = rows().find((row) => row.id === id);
      if (!record) throw new Error(`${name} ${id} not found`);
      Object.assign(record, values);
      persist();
      return clone(record);
    },
    async bulkUpdate(updates) {
      for (const { id, ...values } of updates) {
        const record = rows().find((row) => row.id === id);
        if (record) Object.assign(record, values);
      }
      persist();
      return clone(rows());
    },
  };
}

export const db = {
  entities: {
    Gift: makeEntity("Gift"),
    Job: makeEntity("Job"),
    Action: makeEntity("Action"),
    Branch: makeEntity("Branch"),
    DevLog: makeEntity("DevLog"),
  },
  /** Throw away local edits and go back to src/data/content.json. */
  reset() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    store = clone(seed);
  },
  /** Current content (including local edits) as JSON — paste into content.json to keep it. */
  exportJson() {
    return JSON.stringify(store, null, 2);
  },
};
