export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
}

export interface FileContent {
  path: string;
  content: string;
}

export interface FileWatchEvent {
  event: string;
  path: string;
}
