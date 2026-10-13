import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import './brand-theme.css';
import Shell from '@/components/shell';
import { DataProvider } from '@/components/store';
export const metadata: Metadata = { title: 'El Amiga$o | Inteligencia comercial', description: 'Analiza tus exportaciones de ABAKO y explora oportunidades comerciales.', icons: { icon: '/brand/el-amigaso-logo.png', apple: '/brand/el-amigaso-logo.png' } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="es"><body><DataProvider><Shell>{children}</Shell></DataProvider></body></html>; }
