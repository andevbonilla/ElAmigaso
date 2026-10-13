'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { BarChart3, Map, ShieldCheck } from 'lucide-react';
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return <div className="app-shell reference-shell">
    <header className="company-header"><div className="company-header-inner">
      <Link href="/" className="company-brand" aria-label="El Amiga$o · Inicio"><Image src="/brand/el-amigaso-logo.png" width={525} height={183} alt="El Amiga$o · Plan de recaudo diario" priority /></Link>
      <div className="company-location"><strong>Distribución de ventas</strong><span>Bogotá, D.C.</span></div>
    </div></header>
    <div className="section-navigation"><nav aria-label="Navegación principal">
      <Link href="/" aria-current={path === '/' ? 'page' : undefined} className={path === '/' ? 'active' : ''}><BarChart3 size={18}/>Análisis de ventas</Link>
      <Link href="/mapa" aria-current={path === '/mapa' ? 'page' : undefined} className={path === '/mapa' ? 'active' : ''}><Map size={18}/>Ventas por zona</Link>
    </nav><span className="local-processing"><ShieldCheck size={15}/>Datos procesados en tu navegador</span></div>
    <div className="main-shell"><main>{children}</main><footer className="company-footer"><Image src="/brand/el-amigaso-logo.png" width={160} height={56} alt="El Amiga$o · Plan de recaudo diario"/><span>Inteligencia comercial · Bogotá, D.C.</span></footer></div>
  </div>;
}
