'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { BookOpen, Maximize2, X } from 'lucide-react';

type Section = 'sales';
const seenInSession = new Set<Section>();

const tutorialImages = {
  navigation: { src: '/tutorial/abako-facturacion.png', width: 1399, height: 588, alt: 'Menú de ABAKO: Administración, Ventas y Facturación, con la opción Facturación señalada en naranja.', caption: 'En Ventas, selecciona Facturación dentro de la columna Facturación.' },
  filters: { src: '/tutorial/abako-filtros.png', width: 1226, height: 667, alt: 'Botón Filtrar y ventana de filtros de ABAKO, con Fecha Inicial y Fecha Final señaladas en naranja.', caption: 'Elige tu periodo y pulsa Buscar. Las fechas y los números de factura de esta captura son solo un ejemplo; usa los que correspondan a tu consulta.' },
  download: { src: '/tutorial/abako-descargar.png', width: 988, height: 558, alt: 'Bandeja de facturación de ABAKO con el botón Descargar señalado en naranja sobre los resultados.', caption: 'Con los resultados visibles, pulsa Descargar en la barra superior de la bandeja.' },
};

function TutorialImage({ kind }: { kind: keyof typeof tutorialImages }) {
  const picture = tutorialImages[kind];
  return <figure className="tutorial-figure">
    <a className="tutorial-image-link" href={picture.src} target="_blank" rel="noopener noreferrer" aria-label={`Ampliar captura: ${picture.alt} Se abre en una pestaña nueva.`}>
      <Image src={picture.src} width={picture.width} height={picture.height} alt={picture.alt} sizes="(max-width: 700px) 85vw, 750px" unoptimized/>
      <span><Maximize2 size={14}/>Ampliar imagen</span>
    </a>
    <figcaption>{picture.caption}</figcaption>
  </figure>;
}

export default function AbakoTutorial({ section }: { section: Section }) {
  const dialog = useRef<HTMLDialogElement>(null);

  function openTutorial() {
    const element = dialog.current;
    if (!element || element.open) return;
    element.showModal();
    seenInSession.add(section);
    try { localStorage.setItem(`amigaso:abako-tutorial:${section}:stp-v1`, 'seen'); } catch { /* Keep the session fallback when browser storage is unavailable. */ }
  }

  useEffect(() => {
    let seen = seenInSession.has(section);
    try { seen ||= localStorage.getItem(`amigaso:abako-tutorial:${section}:stp-v1`) === 'seen'; } catch { /* The tutorial can still be opened manually. */ }
    if (!seen) openTutorial();
  }, [section]);

  return <>
    <div className="tutorial-toolbar"><button className="button secondary" onClick={openTutorial}><BookOpen size={17}/>Cómo obtener los datos en ABAKO</button></div>
    <dialog ref={dialog} className="tutorial-dialog" aria-labelledby={`tutorial-title-${section}`} aria-describedby={`tutorial-description-${section}`} onClick={event => {
      if (event.target === event.currentTarget) {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close();
      }
    }}>
      <div className="tutorial-content">
        <header className="tutorial-header"><div><span className="tutorial-kicker">GUÍA DE ABAKO · DATOS PARA STP</span><h2 id={`tutorial-title-${section}`}>De ABAKO a la segmentación STP</h2></div><button className="tutorial-close" aria-label="Cerrar tutorial" autoFocus onClick={() => dialog.current?.close()}><X size={21}/></button></header>
        <p className="tutorial-description" id={`tutorial-description-${section}`}>Descarga idealmente seis meses de facturas individuales y cárgalos juntos para analizar frecuencia, importe y última compra por cliente.</p>
        <ol className="tutorial-steps">
          <li><strong>Abre la bandeja de facturación.</strong><p>En el portal de ABAKO entra a Administración → Ventas → Facturación → Facturación.</p><TutorialImage kind="navigation"/></li>
          <li><strong>Selecciona el periodo.</strong><p>Pulsa Filtrar y elige Fecha Inicial y Fecha Final con el calendario. Verifica también el año. Los límites de factura son opcionales según el manual; si los usas, el archivo solo cubrirá los documentos incluidos en ese rango.</p><TutorialImage kind="filters"/></li>
          <li><strong>Busca y descarga.</strong><p>Pulsa Buscar, revisa que los resultados correspondan al periodo y después Descargar en la bandeja. Usa el archivo de la tabla, no el documento individual de una factura.</p><TutorialImage kind="download"/></li>
          <li><strong>Comprueba el archivo.</strong><p>Debe incluir Factura, Cliente, Pedido, Forma de Pago, Estado, Asesor y Total. En este formato, la celda de Factura también contiene su fecha y hora. Revisa que la descarga incluya todos los resultados esperados.</p></li>
          <li><strong>Carga el historial en Datos y criterios.</strong><p>Pulsa Cargar facturas Excel o CSV. Selecciona juntos los archivos del periodo (hasta 12 archivos, 15 MB por archivo). Se analizan las facturas aprobadas positivas y se omiten duplicados exactos. Revisa cobertura y completa las fichas de clientes antes de priorizar.</p></li>
        </ol>
        <div className="tutorial-note">Si ABAKO muestra un error de conversión de fecha, verifica las fechas seleccionadas y consulta al administrador si persiste. Acotar los números de factura puede dejar ventas por fuera del análisis. El potencial y la viabilidad se completan con el equipo comercial; no aparecen en esta bandeja.</div>
        <footer className="tutorial-footer"><small>Esta guía aparece una vez en este navegador. Puedes volver a abrirla con el botón de ayuda.</small><button className="button primary" onClick={() => dialog.current?.close()}>Entendido, continuar</button></footer>
      </div>
    </dialog>
  </>;
}
