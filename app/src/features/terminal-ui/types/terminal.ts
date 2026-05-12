export interface TerminalExecResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
}

export interface TerminalEntry extends TerminalExecResult {
  command: string;
}
