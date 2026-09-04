"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Flame, RadioTower, Thermometer, Waves } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase/config";
import DashboardPageShell from "@/components/DashboardPageShell";
import { useAllHelmetData } from "@/hooks/useHelmetData";
import { useSafetyAlertRecorder } from "@/hooks/useSafetyAlertRecorder";

type HistoryAlert = { id: string; helmetId?: string; workerId?: string | null; workerName?: string | null; alertType?: string; alertLabel?: string; value?: string; severity?: string; checkpoint?: string | null; date?: string; time?: string; createdAt?: number };

export default function AlertsPage() {
  const { helmets, loading, error } = useAllHelmetData();
  useSafetyAlertRecorder(helmets);
  const [history, setHistory] = useState<HistoryAlert[]>([]);

  useEffect(() => onValue(ref(database, "/MineGuardian/alerts"), snap => {
    const value = snap.val() || {};
    const rows = Object.entries(value).map(([id, v]) => ({ id, ...(v as object) } as HistoryAlert)).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
    setHistory(rows);
  }), []);

  const active = useMemo(() => helmets.flatMap(h => {
    const out: HistoryAlert[] = [];
    if (h.temperature !== null && h.temperature >= 38) out.push({ id: `${h.helmetId}-heat`, helmetId: h.helmetId, workerId: h.workerId, workerName: h.workerName, alertType: "HEAT", alertLabel: "Heat Danger", value: `${h.temperature} °C`, severity: "CRITICAL", checkpoint: h.checkpoint.where });
    if ([h.gas_status, h.mq2.status, h.mq7.status].some(v => (v || "").toUpperCase() === "DANGER")) out.push({ id: `${h.helmetId}-gas`, helmetId: h.helmetId, workerId: h.workerId, workerName: h.workerName, alertType: "GAS", alertLabel: "Gas Danger", value: h.gas_raw !== null ? String(h.gas_raw) : "DANGER", severity: "CRITICAL", checkpoint: h.checkpoint.where });
    if ((h.mpu6050.motion_status || "").toUpperCase().includes("FALL")) out.push({ id: `${h.helmetId}-fall`, helmetId: h.helmetId, workerId: h.workerId, workerName: h.workerName, alertType: "FALL", alertLabel: "Fall Detected", value: h.mpu6050.motion_status || "FALL", severity: "CRITICAL", checkpoint: h.checkpoint.where });
    return out;
  }), [helmets]);

  return <DashboardPageShell title="Alerts" description="Worker helmet safety incidents and danger history">
    {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}
    <div className="mb-4 grid grid-cols-3 gap-4"><Stat title="Active Alerts" value={active.length} /><Stat title="Stored Incidents" value={history.length} /><Stat title="Critical" value={history.filter(a => a.severity === "CRITICAL").length} /></div>
    <div className="min-h-0 overflow-hidden rounded-xl border border-slate-800 bg-[#071118]">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /><h2 className="text-sm font-semibold">Alert History</h2></div><span className="text-[9px] text-slate-500">Stored in Firebase</span></div>
      <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
        {loading ? <div className="p-10 text-center text-xs text-slate-500">Loading live alerts…</div> : history.length === 0 && active.length === 0 ? <div className="p-12 text-center text-sm text-emerald-400">✓ No safety alerts recorded</div> : <div>{[...active.map(a => ({...a, live: true})), ...history.map(a => ({...a, live: false}))].map((a, i) => <AlertRow key={`${a.id}-${i}`} alert={a} />)}</div>}
      </div>
    </div>
  </DashboardPageShell>;
}

function AlertRow({ alert }: { alert: HistoryAlert & { live?: boolean } }) {
  const Icon = alert.alertType === "GAS" ? Waves : alert.alertType === "FALL" ? RadioTower : Thermometer;
  return <div className="flex items-center gap-4 border-b border-slate-800/80 px-4 py-4 last:border-b-0"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10"><Icon className="h-4 w-4 text-red-400" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold text-white">{alert.alertLabel || alert.alertType || "Safety Alert"}</p><span className="rounded bg-red-950 px-1.5 py-0.5 text-[8px] font-bold text-red-400">{alert.severity || "CRITICAL"}</span>{alert.live && <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[8px] font-bold text-amber-400">LIVE</span>}</div><p className="mt-1 text-[10px] text-slate-500">{(alert.helmetId || "N/A").replace("_", "-").toUpperCase()} · Worker: {alert.workerName || alert.workerId || "N/A"} · {alert.value || "N/A"}</p><p className="mt-1 text-[9px] text-slate-600">Checkpoint: {alert.checkpoint || "N/A"}</p></div><div className="shrink-0 text-right"><p className="text-[10px] font-medium text-slate-300">{alert.date || "Live"}</p><p className="mt-1 text-[9px] text-slate-500">{alert.time || "Current"}</p></div></div>;
}

function Stat({ title, value }: { title: string; value: number }) { return <div className="rounded-lg border border-slate-800 bg-[#071118] p-4"><p className="text-[10px] text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p></div>; }
