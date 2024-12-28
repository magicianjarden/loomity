import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CodeBlockStore {
  history: Record<string, string[]>;
  currentIndex: Record<string, number>;
  preferences: Record<string, any>;
  addToHistory: (id: string, code: string) => void;
  undo: (id: string) => string | undefined;
  redo: (id: string) => string | undefined;
  updatePreferences: (preferences: Record<string, any>) => void;
  clearHistory: (id: string) => void;
}

export const useCodeBlockStore = create<CodeBlockStore>()(
  persist(
    (set, get) => ({
      history: {},
      currentIndex: {},
      preferences: {},
      addToHistory: (id, code) =>
        set((state) => {
          const currentHistory = state.history[id] || [];
          const currentIndex = state.currentIndex[id] || -1;
          const newHistory = [...currentHistory.slice(0, currentIndex + 1), code];
          return {
            history: {
              ...state.history,
              [id]: newHistory,
            },
            currentIndex: {
              ...state.currentIndex,
              [id]: newHistory.length - 1,
            },
          };
        }),
      undo: (id) =>
        set((state) => {
          const currentHistory = state.history[id] || [];
          const currentIndex = state.currentIndex[id] || -1;
          if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            return {
              currentIndex: {
                ...state.currentIndex,
                [id]: newIndex,
              },
            };
          }
          return state;
        }) || get().history[id]?.[get().currentIndex[id]],
      redo: (id) =>
        set((state) => {
          const currentHistory = state.history[id] || [];
          const currentIndex = state.currentIndex[id] || -1;
          if (currentIndex < currentHistory.length - 1) {
            const newIndex = currentIndex + 1;
            return {
              currentIndex: {
                ...state.currentIndex,
                [id]: newIndex,
              },
            };
          }
          return state;
        }) || get().history[id]?.[get().currentIndex[id]],
      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...preferences,
          },
        })),
      clearHistory: (id) =>
        set((state) => {
          const { [id]: _, ...restHistory } = state.history;
          const { [id]: __, ...restCurrentIndex } = state.currentIndex;
          return {
            history: restHistory,
            currentIndex: restCurrentIndex,
          };
        }),
    }),
    {
      name: 'code-block-store',
    }
  )
);
