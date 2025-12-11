export interface VisualizationResult {
  summary: string;
  code: string;
  hardwareBOM?: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: number;
  result: VisualizationResult;
}

export interface ImageAttachment {
  file: File;
  preview: string;
  base64: string; // Pure base64 without data prefix
  mimeType: string;
}