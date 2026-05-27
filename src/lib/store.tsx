"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { v4 as uuid } from "uuid";
import {
  Apartment,
  AppState,
  Comment,
  DEFAULT_WEIGHTS,
  ScoreWeights,
  Source,
  emptyApartment,
} from "./types";
import { SEED_APARTMENTS } from "./seed";

const STORAGE_KEY = "apartment-finder:v1";
const STATE_VERSION = 1;

interface StoreContextValue {
  state: AppState;
  ready: boolean;
  upsertApartment: (apt: Apartment) => void;
  addApartment: (init?: Partial<Apartment>) => Apartment;
  deleteApartment: (id: string) => void;
  setRank: (id: string, rank: number) => void;
  reorder: (orderedIds: string[]) => void;
  updateWeights: (weights: ScoreWeights) => void;
  addComment: (
    aptId: string,
    body: string,
    category: Comment["category"]
  ) => void;
  removeComment: (aptId: string, commentId: string) => void;
  addSource: (aptId: string, src: Omit<Source, "id">) => void;
  removeSource: (aptId: string, srcId: string) => void;
  resetToSeed: () => void;
  importJSON: (json: string) => { ok: boolean; error?: string };
  exportJSON: () => string;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadFromStorage(): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== STATE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(state: AppState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function initialState(): AppState {
  return {
    apartments: SEED_APARTMENTS,
    weights: DEFAULT_WEIGHTS,
    version: STATE_VERSION,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadFromStorage();
    if (loaded) {
      setState(loaded);
    } else {
      saveToStorage(initialState());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveToStorage(state);
  }, [state, ready]);

  const upsertApartment = useCallback((apt: Apartment) => {
    setState((s) => {
      const idx = s.apartments.findIndex((a) => a.id === apt.id);
      const next = [...s.apartments];
      const updated = { ...apt, updatedAt: new Date().toISOString() };
      if (idx === -1) next.push(updated);
      else next[idx] = updated;
      return { ...s, apartments: next };
    });
  }, []);

  const addApartment = useCallback((init?: Partial<Apartment>): Apartment => {
    const apt: Apartment = {
      ...emptyApartment(),
      id: uuid(),
      ...init,
    };
    setState((s) => ({
      ...s,
      apartments: [...s.apartments, { ...apt, rank: s.apartments.length + 1 }],
    }));
    return apt;
  }, []);

  const deleteApartment = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      apartments: s.apartments.filter((a) => a.id !== id),
    }));
  }, []);

  const setRank = useCallback((id: string, rank: number) => {
    setState((s) => ({
      ...s,
      apartments: s.apartments.map((a) => (a.id === id ? { ...a, rank } : a)),
    }));
  }, []);

  const reorder = useCallback((orderedIds: string[]) => {
    setState((s) => {
      const byId = new Map(s.apartments.map((a) => [a.id, a]));
      const next = orderedIds
        .map((id, i) => {
          const apt = byId.get(id);
          if (!apt) return null;
          return { ...apt, rank: i + 1 };
        })
        .filter(Boolean) as Apartment[];
      // append any apartments not in the ordering
      for (const a of s.apartments) {
        if (!orderedIds.includes(a.id)) next.push(a);
      }
      return { ...s, apartments: next };
    });
  }, []);

  const updateWeights = useCallback((weights: ScoreWeights) => {
    setState((s) => ({ ...s, weights }));
  }, []);

  const addComment = useCallback(
    (aptId: string, body: string, category: Comment["category"]) => {
      const comment: Comment = {
        id: uuid(),
        body,
        category,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        apartments: s.apartments.map((a) =>
          a.id === aptId ? { ...a, comments: [...a.comments, comment] } : a
        ),
      }));
    },
    []
  );

  const removeComment = useCallback((aptId: string, commentId: string) => {
    setState((s) => ({
      ...s,
      apartments: s.apartments.map((a) =>
        a.id === aptId
          ? { ...a, comments: a.comments.filter((c) => c.id !== commentId) }
          : a
      ),
    }));
  }, []);

  const addSource = useCallback((aptId: string, src: Omit<Source, "id">) => {
    const newSrc: Source = { ...src, id: uuid() };
    setState((s) => ({
      ...s,
      apartments: s.apartments.map((a) =>
        a.id === aptId ? { ...a, sources: [...a.sources, newSrc] } : a
      ),
    }));
  }, []);

  const removeSource = useCallback((aptId: string, srcId: string) => {
    setState((s) => ({
      ...s,
      apartments: s.apartments.map((a) =>
        a.id === aptId
          ? { ...a, sources: a.sources.filter((s2) => s2.id !== srcId) }
          : a
      ),
    }));
  }, []);

  const resetToSeed = useCallback(() => {
    setState(initialState());
  }, []);

  const exportJSON = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importJSON = useCallback(
    (json: string): { ok: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(json) as Partial<AppState>;
        if (!Array.isArray(parsed.apartments)) {
          return { ok: false, error: "Missing apartments array" };
        }
        const weights = parsed.weights ?? DEFAULT_WEIGHTS;
        setState({
          version: STATE_VERSION,
          apartments: parsed.apartments as Apartment[],
          weights,
        });
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "Parse error",
        };
      }
    },
    []
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      ready,
      upsertApartment,
      addApartment,
      deleteApartment,
      setRank,
      reorder,
      updateWeights,
      addComment,
      removeComment,
      addSource,
      removeSource,
      resetToSeed,
      exportJSON,
      importJSON,
    }),
    [
      state,
      ready,
      upsertApartment,
      addApartment,
      deleteApartment,
      setRank,
      reorder,
      updateWeights,
      addComment,
      removeComment,
      addSource,
      removeSource,
      resetToSeed,
      exportJSON,
      importJSON,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
