"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, MapPin, Radio } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase/config";
import DashboardPageShell from "@/components/DashboardPageShell";

type CheckpointLog = {
  helmetId: string;
  where: string;
  time: string;
};

function displayHelmetId(id: string) {
  return id.replace(/_/g, "-").toUpperCase();
}

function checkpointNumber(where: string) {
  const match = where.match(/\d+/);
  return match ? Number(match[0]) : 999;
}

export default function HistoryLogs() {
  const [logs, setLogs] = useState<CheckpointLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onValue(
      ref(database, "/MineGuardian/mine_map"),
      (snapshot) => {
        const value = snapshot.val();

        if (!value || typeof value !== "object") {
          setLogs([]);
          setLoading(false);
          setError(null);
          return;
        }

        const next: CheckpointLog[] = [];

        Object.entries(value as Record<string, unknown>).forEach(([helmetId, rawValue]) => {
          if (!rawValue || typeof rawValue !== "object") return;
          const raw = rawValue as Record<string, unknown>;
          if (typeof raw.where !== "string" || typeof raw.time !== "string") return;

          next.push({
            helmetId,
            where: raw.where,
            time: raw.time,
          });
        });

        next.sort((a, b) => {
          const cp = checkpointNumber(a.where) - checkpointNumber(b.where);
          if (cp !== 0) return cp;
          return a.helmetId.localeCompare(b.helmetId, undefined, { numeric: true });
        });

        setLogs(next);
        setLoading(false);
        setError(null);
      },
      (firebaseError) => {
        setError(firebaseError.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const checkpointSummary = useMemo(() => {
    const counts = new Map<string, number>();
    logs.forEach((log) => counts.set(log.where, (counts.get(log.where) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => checkpointNumber(a[0]) - checkpointNumber(b[0]));
  }, [logs]);

  return (
    <DashboardPageShell
      title="History Logs"
      description="Live RFID checkpoint crossings from Firebase"
    >
      <div className="space-y-4">
        <section className="rounded-xl border border-slate-800 bg-[#071118] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-sky-400" />
              <div>
                <h2 className="text-sm font-semibold text-white">Current Checkpoint Presence</h2>
                <p className="text-[9px] text-slate-500">Which helmet is currently associated with which checkpoint and the recorded RFID time.</p>
              </div>
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[9px] text-emerald-400">LIVE FIREBASE</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {checkpointSummary.length === 0 ? (
              <span className="text-[10px] text-slate-600">No checkpoint records available.</span>
            ) : (
              checkpointSummary.map(([checkpoint, count]) => (
                <span key={checkpoint} className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-[10px] text-sky-300">
                  {checkpoint} <span className="text-slate-500">• {count} helmet{count === 1 ? "" : "s"}</span>
                </span>
              ))
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#071118]">
          <div className="border-b border-slate-800 bg-[#0a141b] px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-slate-400" />
              <h2 className="text-xs font-semibold text-white">Helmet → Checkpoint Log</h2>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[10px] text-slate-500">Reading RFID checkpoint data…</div>
          ) : error ? (
            <div className="p-8 text-center text-[10px] text-red-300">{error}</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-[10px] text-slate-600">No helmet checkpoint data is currently stored in Firebase.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {logs.map((log) => (
                <div key={log.helmetId} className="grid grid-cols-[minmax(120px,1fr)_minmax(160px,1.4fr)_120px] items-center gap-3 px-4 py-3 hover:bg-slate-900/40">
                  <div className="font-semibold text-white text-[11px]">{displayHelmetId(log.helmetId)}</div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-sky-400" />
                    {log.where}
                  </div>
                  <div className="text-right text-[10px] font-semibold text-amber-300">{log.time}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-[9px] text-slate-600">Note: Firebase currently stores the latest <span className="text-slate-400">where</span> and <span className="text-slate-400">time</span> for each helmet, so this page shows the latest recorded checkpoint for each helmet rather than inventing past crossings.</p>
      </div>
    </DashboardPageShell>
  );
}
