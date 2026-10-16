'use client';
import {createContext,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {analyze,initialRules,defaultPositioning,type Source,type Rules,type Profile,type Segment,type Positioning} from '@/lib/stp';
function useStore(){
 const [source,setSource]=useState<Source|null>(null),[rules,setRules]=useState<Rules>(initialRules),[selected,setSelected]=useState<string[]>([]),[plans,setPlans]=useState<Record<Segment,Positioning>>(defaultPositioning),[promise,setPromise]=useState('Para negocios que buscan abastecerse y crecer, El Amigaso ofrece orientación de surtido y acompañamiento en la reposición según las necesidades de cada negocio.'),[horizon,setHorizon]=useState(30);
 const customers=useMemo(()=>source?analyze(source,rules):[],[source,rules]);
 const changed=useRef(false),requestVersion=useRef(0);const [loadingExample,setLoadingExample]=useState(false),[exampleError,setExampleError]=useState('');
 function replace(next:Source,nextRules:Rules){changed.current=true;requestVersion.current++;setSource(next);setRules(nextRules);setSelected([]);setPlans(defaultPositioning);setExampleError('');setLoadingExample(false);}
 async function loadExample(automatic=false){const version=++requestVersion.current;setLoadingExample(true);setExampleError('');try{const response=await fetch('/api/ejemplo',{cache:'no-store'});const next=await response.json() as Source&{error?:string};if(!response.ok||!next.example)throw new Error(next.error||'No se pudo cargar el ejemplo.');if(requestVersion.current!==version||(automatic&&changed.current))return;replace(next,{...initialRules,start:next.example.start,end:next.example.end});}catch(error){if(requestVersion.current===version)setExampleError(error instanceof Error?error.message:'No se pudo cargar el ejemplo.');}finally{if(requestVersion.current===version)setLoadingExample(false);}}
 useEffect(()=>{void loadExample(true);return()=>{requestVersion.current++;};},[]);
 function updateProfile(profile:Profile){if(!source)return;setSource({...source,profiles:[...source.profiles.filter(p=>p.client!==profile.client),profile]});setSelected(s=>s.filter(n=>n!==profile.client));}
 return {source,setSource,rules,setRules,selected,setSelected,plans,setPlans,promise,setPromise,horizon,setHorizon,customers,replace,updateProfile,loadExample,loadingExample,exampleError};
}
const Context=createContext<ReturnType<typeof useStore>|null>(null);
export function StpProvider({children}:{children:ReactNode}){const value=useStore();return <Context.Provider value={value}>{children}</Context.Provider>;}
export function useStp(){const store=useContext(Context);if(!store)throw new Error('Falta el contexto STP');return store;}
