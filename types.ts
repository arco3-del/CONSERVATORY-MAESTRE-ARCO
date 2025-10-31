export enum AppStep {
  ENTRANCE,
  LOBBY,
  DIAGNOSIS,
  CREDENTIALING,
  LIBRARY,
  API_LAB,
  GRAND_HALL,
  CLASSROOM,
  LIVE_TUTOR,
  DIPLOMA,
  JUDGES_ENTRANCE,
}

export type LiveTutorVoice = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

export interface Teacher {
  id: string;
  name: string;
  title: string;
  personality: string;
  voice: {
    pitch: number;
    rate: number;
    volume: number;
  };
  liveVoice: LiveTutorVoice;
  color: string;
  image: string;
  salon: string;
  systemInstruction: string;
}

export interface StudentProfile {
  name: string;
  age: number;
  location: string;
  instrument: string;
  goals: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  path: 'kinder' | 'vocal' | 'instrumental';
}

export interface StudentCredential {
  profile: StudentProfile;
  qrCodeUrl: string;
  issuedAt: string;
}

export interface JudgeProfile {
  name: string;
  title: string;
  image: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface TranscriptionEntry {
    speaker: 'user' | 'tutor';
    text: string;
}