import Link from 'next/link';
import {StpHeading} from '@/components/stp-shared';
import {DetailGuideSteps} from '@/components/detail-tutorial';
export default function Page(){return <><StpHeading letter="?" title="Cómo obtener los datos en ABAKO">Obtén datos actualizados o elige un periodo diferente al del ejemplo.</StpHeading><section className="stp-panel stp-guide"><DetailGuideSteps/><div className="stp-actions"><Link className="button primary" href="/datos">Ya tengo el Excel: cargar datos →</Link></div></section></>;}
