import chokidar from 'chokidar';

export interface WatchEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  timestamp: number;
}

export interface Watcher {
  stop: () => Promise<void>;
}

export function createWatcher(
  dirPath: string,
  onEvent: (event: WatchEvent) => void
): Watcher {
  const watcher = chokidar.watch(dirPath, {
    ignoreInitial: true,
    persistent: true,
  });

  const emit = (type: WatchEvent['type']) => (path: string) => {
    onEvent({ type, path, timestamp: Date.now() });
  };

  watcher.on('add', emit('add'));
  watcher.on('change', emit('change'));
  watcher.on('unlink', emit('unlink'));

  return {
    stop: () => watcher.close(),
  };
}
