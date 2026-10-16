'use client';
import {useEffect,useRef,useState} from 'react';
import type {Map as LeafletMap} from 'leaflet';
import {money} from '@/lib/data';
import type {GeoPoint} from '@/lib/stp-visuals';
export default function StpHeatMap({points}:{points:GeoPoint[]}){
 const host=useRef<HTMLDivElement>(null),map=useRef<LeafletMap|null>(null);const [error,setError]=useState('');
 useEffect(()=>{let alive=true;async function setup(){try{const L=(await import('leaflet')).default;await import('leaflet.heat');if(!alive||!host.current)return;const instance=L.map(host.current,{scrollWheelZoom:false}).setView([4.65,-74.1],11);map.current=instance;L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(instance);
 const positive=points.filter(p=>p.total>0);const max=Math.max(1,...positive.map(p=>p.total));L.heatLayer(positive.map(p=>[p.lat,p.lng,p.total/max]),{radius:28,blur:22,maxZoom:14,minOpacity:.25,gradient:{.25:'#5fa9ce',.5:'#2f6fac',.75:'#e4ab36',1:'#bb4933'}}).addTo(instance);
 for(const p of points){const content=document.createElement('div');const title=document.createElement('strong');title.textContent=p.client;content.append(title,document.createElement('br'),document.createTextNode(money(p.total)),document.createElement('br'),document.createTextNode(p.zone||'Zona sin dato'));L.circleMarker([p.lat,p.lng],{radius:4,color:'#191b58',weight:1,fillColor:'#fff',fillOpacity:.8}).bindPopup(content).addTo(instance);}
 if(points.length)instance.fitBounds(L.latLngBounds(points.map(p=>[p.lat,p.lng])),{padding:[35,35],maxZoom:14});}catch{if(alive)setError('No se pudo cargar el mapa. Las cifras y tablas siguen disponibles.');}}void setup();return()=>{alive=false;map.current?.remove();map.current=null;};},[points]);
 return <div className="stp-map-frame"><div ref={host} className="stp-map" aria-label="Mapa de concentración del subtotal de ventas por cliente"/>{error&&<p role="alert" className="stp-map-message">{error}</p>}{!points.length&&<p className="stp-map-message">No hay clientes con coordenadas utilizables en esta selección.</p>}<button className="button secondary stp-map-center" onClick={()=>{const m=map.current;if(!m)return;if(points.length)m.fitBounds(points.map(p=>[p.lat,p.lng] as [number,number]),{padding:[35,35],maxZoom:14});else m.setView([4.65,-74.1],11);}}>Centrar mapa</button></div>;
}
