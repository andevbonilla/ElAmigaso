'use client';
import Link from 'next/link';
import {useStp} from './stp-store';
import {monthlyEvaluation} from '@/lib/stp-period';
export default function MonthlyGate(){const {source,rules}=useStp();if(!source||monthlyEvaluation(source,rules)!=='blocked')return null;return <section className="stp-panel stp-monthly-gate" role="status"><h2>Falta un mes completo para evaluar</h2><p className="stp-muted">Carga todas las compras del primer al último día del mes y confirma la cobertura. Así se comparan compras y potencial sobre la misma base mensual.</p><Link className="button primary" href="/datos#monthly-period">Cargar y confirmar el mes →</Link></section>;}
