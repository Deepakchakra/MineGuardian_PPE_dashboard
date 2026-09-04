"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAllHelmetData } from "@/hooks/useHelmetData";
import { AlertTriangle, Camera, ClipboardList, Home, ShieldAlert, ShieldCheck, Activity } from "lucide-react";

const navigation = [
  { label: "Home", href: "/", icon: Home },
  { label: "AI PPE Detection", href: "/ai-ppe-detection", icon: Camera },
  { label: "Alerts", href: "/alerts", icon: AlertTriangle },
  { label: "History Logs", href: "/history-logs", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { helmets } = useAllHelmetData();
  const first = helmets[0];
  const online = !!first && (first.wifi_rssi !== null || first.uptime !== null || first.temperature !== null);

  return (
    <aside className="sticky top-0 flex h-screen w-[190px] shrink-0 flex-col border-r border-slate-900/80 bg-[#040a0f] text-white">
      {/* Brand */}
      <div className="relative flex h-[112px] shrink-0 flex-col justify-center overflow-hidden border-b border-slate-900/80 px-3">
        <div className="absolute -left-10 -top-12 h-32 w-32 rounded-full bg-red-600/12 blur-3xl" />
        <div className="absolute -right-8 bottom-0 h-20 w-20 rounded-full bg-cyan-500/5 blur-2xl" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/40 bg-gradient-to-br from-red-500/20 via-red-950/20 to-slate-950 shadow-[0_0_28px_rgba(239,68,68,0.13)]">
            <ShieldAlert className="h-6 w-6 text-red-400" />
          </div>
          <div className="min-w-0">
            <h1 className="whitespace-nowrap text-[12px] font-black uppercase tracking-[0.045em] text-white">MINEGUARDIAN</h1>
            <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.2em] text-red-400/80">Safety Command Center</p>
          </div>
        </div>
        <div className="relative mt-3 flex items-center gap-1.5 text-[7px] uppercase tracking-[0.16em] text-slate-600">
          <Activity className="h-3 w-3 text-emerald-500" />
          Real-time control
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 px-2 pt-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 text-[11px] font-medium transition-all ${
                active
                  ? "border-red-500/25 bg-gradient-to-r from-red-500/12 via-red-500/5 to-transparent text-white shadow-[inset_3px_0_0_rgba(239,68,68,0.95),0_5px_18px_rgba(0,0,0,0.12)]"
                  : "border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/60 hover:text-white"
              }`}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-red-400" />}
              <Icon size={16} className={active ? "text-red-400" : "text-slate-500 group-hover:text-slate-300"} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.label === "Alerts" && <AlertCount helmets={helmets} />}
            </Link>
          );
        })}
      </nav>

      {/* Live helmet tab */}
      <div className="mt-auto p-2">
        {first ? (
          <Link
            href={`/helmet/${encodeURIComponent(first.helmetId)}`}
            className="group block rounded-xl border border-slate-800 bg-gradient-to-b from-[#0a1720] to-[#050c11] p-3 shadow-[0_10px_28px_rgba(0,0,0,0.25)] transition hover:border-red-500/30 hover:bg-[#0b1821]"
            title={`Open ${first.helmetId.replace(/_/g, "-").toUpperCase()} details`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${online ? "animate-pulse bg-emerald-400" : "bg-slate-600"}`} />
                <span className="truncate text-[10px] font-black tracking-wide text-white">{first.helmetId.replace(/_/g, "-").toUpperCase()}</span>
              </div>
              <span className={`text-[7px] font-bold ${online ? "text-emerald-400" : "text-slate-500"}`}>{online ? "ACTIVE" : "OFFLINE"}</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2 text-[8px]">
              <div>
                <p className="uppercase tracking-wide text-slate-600">Signal</p>
                <p className="mt-0.5 truncate font-semibold text-slate-200">{first.wifi_rssi !== null ? `${first.wifi_rssi} dBm` : "N/A"}</p>
              </div>
              <div>
                <p className="uppercase tracking-wide text-slate-600">Uptime</p>
                <p className="mt-0.5 truncate font-semibold text-slate-200">{first.uptime !== null ? `${first.uptime}s` : "N/A"}</p>
              </div>
              <div>
                <p className="uppercase tracking-wide text-slate-600">Worker</p>
                <p className="mt-0.5 truncate font-semibold text-slate-200">{first.workerName || first.workerId || "N/A"}</p>
              </div>
              <div>
                <p className="uppercase tracking-wide text-slate-600">Location</p>
                <p className="mt-0.5 truncate font-semibold text-slate-200">{first.checkpoint.where || "N/A"}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2.5 text-[7px] uppercase tracking-[0.12em]">
              <span className="flex items-center gap-1 text-emerald-400/80"><ShieldCheck className="h-3 w-3" /> Firebase Live</span>
              <span className="text-slate-600 transition group-hover:text-red-300">Open Details →</span>
            </div>
          </Link>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-[#071118] p-3 text-[9px] text-slate-600">No live helmet data</div>
        )}
      </div>
    </aside>
  );
}

function AlertCount({ helmets }: { helmets: ReturnType<typeof useAllHelmetData>["helmets"] }) {
  const count = helmets.reduce(
    (total, h) =>
      total +
      (h.temperature !== null && h.temperature >= 38 ? 1 : 0) +
      (((h.gas_status || "").toUpperCase() === "DANGER" || (h.mq2.status || "").toUpperCase() === "DANGER" || (h.mq7.status || "").toUpperCase() === "DANGER") ? 1 : 0) +
      ((h.mpu6050.motion_status || "").toUpperCase().includes("FALL") ? 1 : 0),
    0,
  );
  if (!count) return null;
  return <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.35)]">{count}</span>;
}
