'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Sale, type ImportResult } from '@/lib/data';
type Dataset = { rows: Sale[]; name: string; demo: boolean; report?: Omit<ImportResult, 'rows'> };
const Context = createContext<{ data: Dataset | null; setData: (v: Dataset | null) => void }>({ data: null, setData: () => {} });
export function DataProvider({ children }: { children: ReactNode }) { const [data, setData] = useState<Dataset | null>(null); return <Context.Provider value={{ data, setData }}>{children}</Context.Provider>; }
export const useData = () => useContext(Context);
