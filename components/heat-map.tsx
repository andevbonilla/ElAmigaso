'use client';
import { useEffect, useRef, useState } from 'react';
import type { MapClient } from '@/lib/map-demo';
import type * as Leaflet from 'leaflet';
import { money } from '@/lib/data';
export default function HeatMap({ points, metric, markers, onSelect }: {points:MapClient[];metric:'total'|'invoices';markers:boolean;onSelect:(p:MapClient)=>void}) {
  const div = useRef<HTMLDivElement>(null), map = useRef<Leaflet.Map | null>(null), layer = useRef<Leaflet.LayerGroup | null>(null);
  const [ready,setReady] = useState(false), [tileError,setTileError]=useState(false);
  useEffect(()=> { let alive=true; let owned:Leaflet.Map|null=null;
    void (async()=>{ const L=(await import('leaflet')).default; await import('leaflet.heat'); if(!alive||!div.current)return;
      owned=L.map(div.current,{zoomControl:false,scrollWheelZoom:true}).setView([4.673,-74.097],12); map.current=owned;
      L.control.zoom({position:'bottomright'}).addTo(owned);
      const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(owned);
      tiles.on('tileerror',()=>setTileError(true)); layer.current=L.layerGroup().addTo(owned); setReady(true);
    })(); return ()=>{alive=false;owned?.remove();map.current=null;layer.current=null;};
  },[]);
  useEffect(()=>{if(!ready||!map.current||!layer.current)return; const current=layer.current;current.clearLayers();let active=true;
    void (async()=>{const L=(await import('leaflet')).default;if(!active)return;const max=Math.max(1,...points.map(p=>p[metric]));
      L.heatLayer(points.map(p=>[p.lat,p.lng,Math.max(0.08,p[metric]/max)] as [number,number,number]),{radius:35,blur:25,maxZoom:13,minOpacity:0.3,gradient:{0.15:'#a6d9bc',0.4:'#d5dd75',0.65:'#f7bd66',0.85:'#ed795b',1:'#c54043'}}).addTo(current);
      if(markers)points.forEach(p=>{const el=document.createElement('span');el.textContent=`${p.name} · ${money(p.total)}`;L.circleMarker([p.lat,p.lng],{radius:5,color:'#fff',weight:2,fillColor:'#304f43',fillOpacity:0.9}).bindTooltip(el).on('click',()=>onSelect(p)).addTo(current);});
    })();return()=>{active=false;};
  },[points,metric,markers,onSelect,ready]);
  return <><div ref={div} className="leaflet-map" role="img" aria-label={`Mapa de calor de Bogotá con ${points.length} clientes ficticios`}/>{tileError&&<div className="tile-warning">El mapa base no pudo cargarse. Comprueba la conexión a internet; los puntos siguen disponibles en la lista.</div>}</>;
}
