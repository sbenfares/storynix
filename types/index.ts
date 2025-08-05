export interface Universe {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface Story {
  title: string;
  content: string;
  chapters: string[];
}

export interface StoryRequest {
  childName: string;
  universe: string;
}

export interface AudioRequest {
  text: string;
  voiceId?: string;
}

export interface StoryMetadata {
  title: string;
  description: string;
  author: string;
  chapters: string[];
  created: string;
  version: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export type UniverseId = "pirates" | "animals" | "space" | "fairy" | "ninja";
