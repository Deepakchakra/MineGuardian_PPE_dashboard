"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAllHelmetData } from "@/hooks/useHelmetData";
import { AlertTriangle, Camera, HardHat, Home, ShieldCheck, ShieldAlert } from "lucide-react";

const navigation = [
  { label: "Home", href: "/", icon: Home },
  { label: "AI PPE Detection", href: "/ai-ppe-detection", icon: Camera },
  { label: "Alerts", href: "/alerts", icon: AlertTriangle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { helmets } = useAllHelmetData();
  const first = helmets[0];
  const online = !!first && (first.wifi_rssi !== null || first.uptime !== null || first.temperature !== null);

  return (
    <aside className="sticky top-0 flex h-screen w-[190px] shrink-0 flex-col bg-[#050b10] text-white">
      <div className="relative flex h-[92px] shrink-0 items-center overflow-hidden px-3">
        <div className="absolute -left-8 -top-10 h-28 w-28 rounded-full bg-red-600/10 blur-2xl" />
        <div className="relative flex w-full items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/40 bg-gradient-to-br from-red-500/20 to-red-950/20 shadow-[0_0_24px_rgba(239,68,68,0.12)]">
            <ShieldAlert className="h-6 w-6 text-red-400" />
          </div>
          <div className="min-w-0">
            <h1 className="bg-gradient-to-r from-white via-slate-100 to-red-300 bg-clip-text text-[16px] font-extrabold tracking-tight text-transparent">MineGuardian</h1>
            <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.16em] text-slate-500">Safety Command Center</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 px-2 pt-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[12px] transition-all ${active ? "border border-red-500/30 bg-gradient-to-r from-red-500/12 to-transparent text-red-300 shadow-[inset_3px_0_0_rgba(239,68,68,0.9)]" : "text-slate-300 hover:bg-slate-900/70 hover:text-white"}`}>
              <Icon size={16} className={active ? "text-red-400" : "text-slate-400 group-hover:text-slate-200"} />
              <span className="flex-1">{item.label}</span>
              {item.label === "Alerts" && <AlertCount helmets={helmets} />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto m-2 rounded-xl border border-slate-800 bg-gradient-to-b from-[#081118] to-[#050b10] p-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold">{first ? first.helmetId.replace("_", "-").toUpperCase() : "NO HELMET"}</span>
          <span className={`flex items-center gap-1 text-[8px] ${online ? "text-emerald-400" : "text-slate-500"}`}><span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-emerald-500" : "bg-slate-600"}`} />{online ? "ACTIVE" : "OFFLINE"}</span>
        </div>
        {first ? <div className="space-y-2.5 pt-4 text-[9px]">
          <div><p className="text-slate-500">Signal Strength</p><p className="mt-1 font-semibold text-white">{first.wifi_rssi !== null ? `${first.wifi_rssi} dBm` : "N/A"}</p></div>
          <div><p className="text-slate-500">Uptime</p><p className="mt-1 font-semibold text-white">{first.uptime !== null ? `${first.uptime}s` : "N/A"}</p></div>
          <div><p className="text-slate-500">Worker ID</p><p className="mt-1 font-semibold text-white">{first.workerName || first.workerId || "N/A"}</p></div>
          <div><p className="text-slate-500">Location</p><p className="mt-1 font-semibold text-white">{first.checkpoint.where || "N/A"}</p></div>
        </div> : <p className="pt-4 text-[9px] text-slate-600">No live helmet data</p>}
        <div className="mt-4 flex items-center gap-1.5 border-t border-slate-800 pt-3 text-[8px] text-slate-500"><ShieldCheck className="h-3 w-3 text-emerald-500" /> Firebase real-time link</div>
      </div>
    </aside>
  );
}

function AlertCount({ helmets }: { helmets: ReturnType<typeof useAllHelmetData>["helmets"] }) {
  const count = helmets.reduce((total, h) => total + (h.temperature !== null && h.temperature >= 38 ? 1 : 0) + ((h.gas_status || "").toUpperCase() === "DANGER" || (h.mq2.status || "").toUpperCase() === "DANGER" || (h.mq7.status || "").toUpperCase() === "DANGER" ? 1 : 0) + ((h.mpu6050.motion_status || "").toUpperCase().includes("FALL") ? 1 : 0), 0);
  if (!count) return null;
  return <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] text-white">{count}</span>;
}
