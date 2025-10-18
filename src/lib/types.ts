export enum DreamStatus {
  UPLOADING = "uploading",
  TRANSCRIBING = "transcribing",
  GENERATING_STORY = "generating_story",
  GENERATING_VIDEO = "generating_video",
  READY = "ready",
  ERROR = "error",
}

export interface Dream {
  id: string;
  status: DreamStatus;
  audioUrl?: string;
  transcript?: string;
  story?: string;
  videoUrl?: string;
  shareToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

