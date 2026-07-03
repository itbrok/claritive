import { create } from 'zustand';
import type { ChatMessage } from '../ai/types';
import { type ChatSession, saveChat, getChats } from './db';
import { AVAILABLE_MODELS } from '../background/model-manager';

interface AppState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  selectedModelId: string;
  isModelLoading: boolean;
  loadProgress: number;
  theme: 'light' | 'dark';

  setCurrentSession: (session: ChatSession | null) => void;
  addMessage: (message: ChatMessage) => void;
  loadSessions: () => Promise<void>;
  createNewSession: (title: string, url: string) => void;
  setSelectedModel: (modelId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setProgress: (progress: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentSession: null,
  sessions: [],
  selectedModelId: AVAILABLE_MODELS[0].id,
  isModelLoading: false,
  loadProgress: 0,
  theme: 'light',

  setCurrentSession: (session) => set({ currentSession: session }),

  addMessage: (message) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, message]
    };
    set({ currentSession: updatedSession });
    saveChat(updatedSession);
  },

  loadSessions: async () => {
    const sessions = await getChats();
    set({ sessions: sessions.sort((a, b) => b.timestamp - a.timestamp) });
  },

  createNewSession: (title, url) => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title,
      url,
      messages: [],
      timestamp: Date.now()
    };
    set({ currentSession: newSession });
    saveChat(newSession);
    get().loadSessions();
  },

  setSelectedModel: (modelId) => set({ selectedModelId: modelId }),
  setLoading: (isLoading) => set({ isModelLoading: isLoading }),
  setProgress: (progress) => set({ loadProgress: progress }),
  setTheme: (theme) => set({ theme }),
}));
