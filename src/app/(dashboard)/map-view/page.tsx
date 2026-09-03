"use client";
import DashboardPageShell from "@/components/DashboardPageShell";
import MineMap from "@/components/MineMap";
import { useAllHelmetData } from "@/hooks/useHelmetData";
export default function MapView(){const{helmets,loading,error}=useAllHelmetData();return <DashboardPageShell title="Map View" description="Mine tunnel network and checkpoint monitoring">{error&&<div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}{loading?<div className="text-xs text-slate-500">Loading map data…</div>:<MineMap helmets={helmets} selectedId={null} onSelectHelmet={()=>{}}/>}</DashboardPageShell>}
