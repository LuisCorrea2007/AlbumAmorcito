import { create } from 'zustand';

interface ThinkingEvent {
  from: string;
  message: string;
  timestamp: string;
}

interface MoodState {
  // Current user's mood
  currentMood: {
    value: number;
    color: string;
    note?: string;
    lastUpdated?: string;
  };
  
  // Partner's mood (received via socket)
  partnerMood: {
    value: number;
    color: string;
    note?: string;
    lastUpdated?: string;
  } | null;
  
  // Received "thinking in you" events
  receivedThinking: ThinkingEvent[];
  
  // Online status
  isPartnerOnline: boolean;
  
  // Actions
  setCurrentMood: (mood: { value: number; color: string; note?: string }) => void;
  setPartnerMood: (mood: { userId: string; value: number; color: string; note?: string; timestamp: string }) => void;
  addThinking: (thinking: ThinkingEvent) => void;
  clearThinking: () => void;
  setPartnerOnline: (online: boolean) => void;
}

export const useMoodStore = create<MoodState>((set) => ({
  // Initial state
  currentMood: {
    value: 3,
    color: '#FF6B6B',
    note: '',
  },
  partnerMood: null,
  receivedThinking: [],
  isPartnerOnline: false,
  
  // Actions
  setCurrentMood: (mood) =>
    set((state) => ({
      currentMood: {
        ...mood,
        lastUpdated: new Date().toISOString(),
      },
    })),
    
  setPartnerMood: (moodData) =>
    set(() => ({
      partnerMood: {
        value: moodData.value,
        color: moodData.color,
        note: moodData.note,
        lastUpdated: moodData.timestamp,
      },
    })),
    
  addThinking: (thinking) =>
    set((state) => ({
      receivedThinking: [thinking, ...state.receivedThinking].slice(0, 10), // Keep last 10
    })),
    
  clearThinking: () => set({ receivedThinking: [] }),
  
  setPartnerOnline: (online) => set({ isPartnerOnline: online }),
}));

export default useMoodStore;
