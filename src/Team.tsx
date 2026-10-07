import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cotation, Validation, Objectifs, DEFAULT_OBJECTIFS, useCapability } from './lib/team';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Profiles = Record<string, { name: string; avatarUrl: string; color: string }>;

interface TeamContext {
  /** 'loading' tant que la plateforme n'a pas répondu ; 'off' hors de Claude ou sans accès */
  status: 'loading' | 'ready' | 'off';
  db: any;
  uid: string | null;
  isChef: boolean;
  canWrite: boolean | null;
  cotations: Cotation[];
  validations: Record<string, Validation>;
  objectifs: Objectifs;
  profiles: Profiles;
  error: string;
  setError: (e: string) => void;
  currentRef: string | null;
  setCurrentRef: (r: string | null) => void;
}

const Ctx = createContext<TeamContext | null>(null);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'off'>('loading');
  const [db, setDb] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [isChef, setIsChef] = useState(false);
  const [canWrite, setCanWrite] = useState<boolean | null>(null);
  const [cotations, setCotations] = useState<Cotation[]>([]);
  const [validations, setValidations] = useState<Record<string, Validation>>({});
  const [objectifs, setObjectifs] = useState<Objectifs>(DEFAULT_OBJECTIFS);
  const [profiles, setProfiles] = useState<Profiles>({});
  const [error, setError] = useState('');
  const [currentRef, setCurrentRef] = useState<string | null>(null);

  // Connexion aux capacités de la plateforme (absentes hors de Claude)
  useEffect(() => {
    let alive = true;
    (async () => {
      const [d, u] = await Promise.all([useCapability('db'), useCapability('user')]);
      if (!alive) return;
      if (!d) { setStatus('off'); return; }
      setDb(d);
      setUser(u);
      if (u) {
        const [id, edit, write] = await Promise.all([u.id(), u.canEdit(), u.can('data.write')]);
        if (!alive) return;
        setUid(id); setIsChef(!!edit); setCanWrite(write);
      }
      setStatus('ready');
    })();
    return () => { alive = false; };
  }, []);

  // Abonnements uniques aux données partagées
  useEffect(() => {
    if (!db) return;
    const fail = (e: any) => setError(e?.code === 'revoked' ? 'Accès aux données partagées retiré.' : 'Données partagées momentanément indisponibles.');
    const u1 = db.collection('cotations').onSnapshot((s: any) => {
      setCotations(s.docs.filter((d: any) => d.exists).map((d: any) => d.data() as Cotation)
        .sort((a: Cotation, b: Cotation) => b.createdAt.localeCompare(a.createdAt)));
    }, fail);
    const u2 = db.collection('validations').onSnapshot((s: any) => {
      const m: Record<string, Validation> = {};
      s.docs.forEach((d: any) => { if (d.exists) m[d.id] = d.data() as Validation; });
      setValidations(m);
    }, fail);
    const u3 = db.doc('config/objectifs').onSnapshot((d: any) => {
      setObjectifs(d.exists ? { ...DEFAULT_OBJECTIFS, ...(d.data() as Objectifs) } : DEFAULT_OBJECTIFS);
    }, fail);
    return () => { u1(); u2(); u3(); };
  }, [db]);

  // Noms des personnes citées (résolus à l'affichage, jamais stockés)
  const ids = Array.from(new Set([
    ...cotations.flatMap(c => [c.createdBy, ...c.history.map(h => h.by)]),
    ...Object.values(validations).map((v: Validation) => v.by),
  ].filter(Boolean) as string[])).sort().join(',');
  useEffect(() => {
    if (!user || !ids) return;
    let alive = true;
    user.profiles(ids.split(',')).then((p: Profiles) => { if (alive) setProfiles(p); });
    return () => { alive = false; };
  }, [user, ids]);

  return (
    <Ctx.Provider value={{ status, db, uid, isChef, canWrite, cotations, validations, objectifs, profiles, error, setError, currentRef, setCurrentRef }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTeam() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTeam must be used within TeamProvider');
  return c;
}

export function personName(p: Profiles, id: string | null | undefined) {
  return (id && p[id]?.name) || 'Un collègue';
}
