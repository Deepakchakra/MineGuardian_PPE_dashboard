"use client";

import { useState } from "react";
import { Bell, Camera, HardHat, Radio } from "lucide-react";
import { push, ref, serverTimestamp, set } from "firebase/database";
import { database } from "@/lib/firebase/config";
import { useAllHelmetData, type HelmetData } from "@/hooks/useHelmetData";
import HelmetList, { DEMO_HELMET_IDS } from "@/components/HelmetList";
import MineMap from "@/components/MineMap";

export default function Home() {
  const { helmets } = useAllHelmetData();
  const [alertHelmet, setAlertHelmet] = useState<HelmetData | null>(null);
  const demoHelmetCount = DEMO_HELMET_IDS.filter(
    (id) => !helmets.some((helmet) => helmet.helmetId.toLowerCase() === id),
  ).length;

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[270px_minmax(0,1fr)]">
        {/* Helmet list: only this panel scrolls when more helmets are present. */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#050b10] p-3">
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <HardHat className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold">Helmet Lists</h2>
              </div>
              <p className="mt-1 text-[9px] text-slate-600">Live helmets detected in Firebase</p>
            </div>
            <span className="rounded border border-slate-800 px-2 py-1 text-[9px] text-slate-500">{helmets.length + demoHelmetCount}</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <HelmetList helmets={helmets} onAlert={setAlertHelmet} />
          </div>
        </section>

        {/* Default Home: camera + complete mine map only. */}
        <section className="grid h-full min-h-0 min-w-0 grid-cols-2 gap-4 overflow-hidden">
          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#050b10]">
            <div className="flex h-[58px] shrink-0 items-center gap-2 border-b border-slate-800 px-4">
              <Camera className="h-4 w-4 text-slate-400" />
              <div>
                <h2 className="text-sm font-semibold">AI PPE Detection Camera</h2>
                <p className="text-[9px] text-slate-600">Entry gate surveillance</p>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-[#03080c]">
              <div className="text-center">
                <Camera className="mx-auto h-8 w-8 text-slate-700" />
                <p className="mt-2 text-xs text-slate-600">Camera feed will be connected here</p>
                <p className="mt-1 text-[9px] text-slate-700">No camera source configured</p>
              </div>
            </div>
          </section>

          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#050b10]">
            <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-slate-800 px-4">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold">Mine Map</h2>
              </div>
              <div className="flex items-center gap-3 text-[9px] text-slate-500">
                <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500" />Checkpoint</span>
                <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />Worker coverage</span>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <MineMap helmets={helmets} selectedId={null} onSelectHelmet={() => undefined} />
            </div>
          </section>
        </section>
      </div>

      {alertHelmet && <AlertDialog helmet={alertHelmet} onClose={() => setAlertHelmet(null)} />}
    </div>
  );
}

function AlertDialog({ helmet, onClose }: { helmet: HelmetData; onClose: () => void }) {
  const [duration, setDuration] = useState("10");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function send() {
    if (sending) return;
    setSending(true);
    setResult(null);
    try {
      const commandRef = push(ref(database, "/MineGuardian/commands"));
      await set(commandRef, {
        type: "ALERT",
        helmet_id: helmet.helmetId,
        worker_id: helmet.workerId ?? null,
        message: message.trim() || "Emergency alert from control room",
        duration_seconds: Number(duration),
        created_at: serverTimestamp(),
        status: "QUEUED",
      });
      setResult("Alert queued successfully.");
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Unable to queue alert.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-[#071118] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500">TARGET HELMET</p>
            <h2 className="text-lg font-semibold">{helmet.helmetId.replace("_", "-").toUpperCase()}</h2>
          </div>
          <button onClick={onClose} className="text-xl text-slate-500 hover:text-white">×</button>
        </div>
        <div className="mt-5">
          <label className="text-[10px] text-slate-500">Duration</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 w-full rounded-md border border-slate-700 bg-[#050b10] p-2 text-xs text-white">
            <option value="10">10 seconds</option>
            <option value="20">20 seconds</option>
            <option value="30">30 seconds</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="text-[10px] text-slate-500">Message</label>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Emergency alert…" className="mt-1 w-full rounded-md border border-slate-700 bg-[#050b10] p-2 text-xs text-white outline-none focus:border-red-500" />
        </div>
        {result && <p className={`mt-3 text-[10px] ${result.includes("successfully") ? "text-emerald-400" : "text-red-400"}`}>{result}</p>}
        <button disabled={sending} onClick={send} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-red-600 py-2.5 text-xs font-semibold text-white disabled:opacity-50">
          <Bell className="h-3.5 w-3.5" />{sending ? "SENDING…" : "SEND ALERT"}
        </button>
      </div>
    </div>
  );
}
