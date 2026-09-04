"use client";

import { useEffect, useState } from "react";
import { Camera, CheckCircle2, ShieldCheck, Users, XCircle } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase/config";
import DashboardPageShell from "@/components/DashboardPageShell";

export default function AIPPEDetectionPage() {
  const [stats, setStats] = useState({ accepted: null as number | null, rejected: null as number | null });

  useEffect(() => {
    const candidates = ["/MineGuardian/ppe_detection", "/MineGuardian/ai_ppe", "/MineGuardian/ppe"];
    let active = true;
    const unsubs = candidates.map((path) => onValue(ref(database, path), (snap) => {
      if (!active || !snap.exists()) return;
      const v = snap.val() || {};
      const accepted = typeof v.accepted === "number" ? v.accepted : typeof v.workers_accepted === "number" ? v.workers_accepted : null;
      const rejected = typeof v.rejected === "number" ? v.rejected : typeof v.workers_rejected === "number" ? v.workers_rejected : null;
      if (accepted !== null || rejected !== null) setStats({ accepted, rejected });
    }));
    return () => { active = false; unsubs.forEach((u) => u()); };
  }, []);

  return (
    <DashboardPageShell title="AI PPE Detection" description="Entry-gate PPE surveillance and worker compliance">
      <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_150px] gap-4">
        <section className="relative min-h-0 overflow-hidden rounded-xl border border-slate-800 bg-[#050b10]">
          <div className="flex h-12 items-center gap-2 border-b border-slate-800 px-4"><Camera className="h-4 w-4 text-slate-400" /><div><h2 className="text-sm font-semibold">Live AI PPE Detection Camera</h2><p className="text-[9px] text-slate-600">Entry gate surveillance</p></div><span className="ml-auto rounded-full border border-amber-500/20 bg-amber-500/5 px-2 py-1 text-[8px] text-amber-400">CAMERA NOT CONNECTED</span></div>
          <div className="flex h-[calc(100%-3rem)] items-center justify-center bg-[#03080c]"><div className="text-center"><Camera className="mx-auto h-12 w-12 text-slate-700" /><p className="mt-3 text-sm text-slate-500">Live camera feed will be connected here</p><p className="mt-1 text-[10px] text-slate-700">No camera source configured</p></div></div>
        </section>
        <section className="grid grid-cols-2 gap-4">
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />} title="Workers Accepted" value={stats.accepted} description="PPE compliant workers" />
          <StatCard icon={<XCircle className="h-5 w-5 text-red-400" />} title="Workers Rejected" value={stats.rejected} description="PPE non-compliant workers" />
        </section>
      </div>
    </DashboardPageShell>
  );
}

function StatCard({ icon, title, value, description }: { icon: React.ReactNode; title: string; value: number | null; description: string }) {
  return <div className="rounded-xl border border-slate-800 bg-[#071118] p-5"><div className="flex items-center gap-3">{icon}<div><p className="text-xs font-semibold text-white">{title}</p><p className="mt-1 text-[9px] text-slate-500">{description}</p></div></div><div className="mt-5 flex items-center gap-2"><span className="text-3xl font-bold text-white">{value === null ? "N/A" : value}</span><Users className="h-4 w-4 text-slate-600" /></div></div>;
}
