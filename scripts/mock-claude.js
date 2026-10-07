// Faux `window.claude` (base en mémoire) pour tester le travail en équipe hors de Claude.
// Utilisé uniquement par les tests ; jamais chargé par l'application publiée.
(function () {
  const store = new Map();
  const subs = new Set();
  const role = (window.__MOCK_ROLE || 'chef');
  const uid = role === 'chef' ? 'u_chef' : 'u_com';
  const notify = () => subs.forEach(f => f());
  const snap = (path) => {
    const v = store.get(path);
    return { id: path.split('/').pop(), exists: v !== undefined, data: () => v && JSON.parse(JSON.stringify(v)), metadata: { fromCache: false, hasPendingWrites: false } };
  };
  const merge = (a, b) => { const o = { ...a }; for (const k in b) o[k] = (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a && typeof a[k] === 'object') ? merge(a[k], b[k]) : b[k]; return o; };
  const guard = (path) => { if (role !== 'chef' && /^(validations|config)\//.test(path)) throw { code: 'invalid_argument', message: 'level' }; };
  const docRef = (path) => ({
    id: path.split('/').pop(), path,
    get: async () => snap(path),
    set: async (d) => { guard(path); store.set(path, JSON.parse(JSON.stringify(d))); notify(); },
    update: async (d) => { guard(path); if (!store.has(path)) throw { code: 'invalid_argument' }; store.set(path, merge(store.get(path), JSON.parse(JSON.stringify(d)))); notify(); },
    delete: async () => { store.delete(path); notify(); },
    acquire: async () => ({ acquired: true }),
    onSnapshot: (next) => { const f = () => next(snap(path)); subs.add(f); setTimeout(f, 0); return () => subs.delete(f); },
  });
  const colRef = (path) => ({
    path, doc: (id) => docRef(path + '/' + (id || Math.random().toString(36).slice(2))),
    onSnapshot: (next) => {
      const f = () => { const docs = [...store.keys()].filter(k => k.startsWith(path + '/') && k.split('/').length === path.split('/').length + 1).sort().map(snap); next({ docs, size: docs.length, empty: !docs.length, docChanges: () => [] }); };
      subs.add(f); setTimeout(f, 0); return () => subs.delete(f);
    },
  });
  const db = { doc: docRef, collection: colRef };
  const user = {
    id: async () => uid, canEdit: async () => role === 'chef', isOwner: async () => role === 'chef', can: async () => true,
    profiles: async (ids) => Object.fromEntries([].concat(ids).map(i => [i, { id: i, name: i === 'u_chef' ? 'Yazid (chef)' : 'Karim (commercial)', avatarUrl: '', color: '#888' }])),
  };
  window.__mockStore = store;
  window.claude = { use: async (n) => (n === 'db' ? db : n === 'user' ? user : null) };
})();
