import { createContext, useContext, useState, type ReactNode } from 'react';

export const TERMINALS = [
  { id: 'zct', name: 'Zeebrugge Container Terminal', short: 'ZCT', factor: 1.00 },
  { id: 'ico', name: 'ICO Terminal Zeebrugge',        short: 'ICO', factor: 1.14 },
  { id: 'csp', name: 'CSP Zeebrugge Terminal',        short: 'CSP', factor: 0.91 },
  { id: 'dpw', name: 'DP World Zeebrugge',            short: 'DPW', factor: 1.08 },
] as const;

export type TerminalId = typeof TERMINALS[number]['id'];
export type Terminal   = typeof TERMINALS[number];

interface Ctx {
  terminal: Terminal;
  setTerminalId: (id: TerminalId) => void;
}

const TerminalContext = createContext<Ctx | null>(null);

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [terminalId, setTerminalId] = useState<TerminalId>('zct');
  const terminal = TERMINALS.find(t => t.id === terminalId)!;
  return (
    <TerminalContext.Provider value={{ terminal, setTerminalId }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal(): Ctx {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error('useTerminal must be inside TerminalProvider');
  return ctx;
}
