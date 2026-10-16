import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import Shell from '@/components/shell';
import { StpProvider } from '@/components/stp-store';
export const metadata: Metadata = { title: 'El Amigaso | Modelo STP', description: 'Segmenta clientes, elige objetivos y define propuestas comerciales con tus facturas de ABAKO.', icons: { icon: '/brand/el-amigaso-logo.png', apple: '/brand/el-amigaso-logo.png' } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="es"><body><StpProvider><Shell>{children}</Shell></StpProvider></body></html>; }
