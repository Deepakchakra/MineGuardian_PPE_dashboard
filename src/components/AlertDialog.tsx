"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { push, ref, serverTimestamp, set } from "firebase/database";
import { database } from "@/lib/firebase/config";
import type { HelmetData } from "@/hooks/useHelmetData";

export default function AlertDialog({
  helmet,
  onClose,
  onNeverStarted,
}: {
  helmet: HelmetData;
  onClose: () => void;
  onNeverStarted?: () => void;
}) {
  const [duration, setDuration] = useState("10");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function send() {
  if (sending) return;

  setSending(true);
  setResult(null);

  const isNever = duration === "never";
  const durationSeconds = isNever ? null : Number(duration);
  const alertPath = `/MineGuardian/${helmet.helmetId}/dashboard_alert`;

  try {
    const commandRef = push(ref(database, "/MineGuardian/commands"));

    await set(commandRef, {
      type: "ALERT",
      helmet_id: helmet.helmetId,
      worker_id: helmet.workerId ?? null,
      message: message.trim() || "Emergency alert from control room",
      duration_seconds: durationSeconds,
      duration: isNever ? "NEVER" : `${durationSeconds} seconds`,
      created_at: serverTimestamp(),
      status: isNever ? "ACTIVE" : "QUEUED",
    });

    if (isNever) {
      onNeverStarted?.();
      setResult("Alert ACTIVE until the control room stops it.");
    } else {
      const seconds = durationSeconds ?? 0;

      await set(ref(database, alertPath), true);

      setResult(`Alert active for ${seconds} seconds.`);

      window.setTimeout(async () => {
        try {
          await set(ref(database, alertPath), false);
        } catch (error) {
          console.error(
            "Unable to automatically stop alert:",
            error
          );
        }
      }, seconds * 1000);
    }
  } catch (error) {
    setResult(
      error instanceof Error
        ? error.message
        : "Unable to start alert."
    );
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
            <h2 className="text-lg font-semibold text-white">{helmet.helmetId.replace("_", "-").toUpperCase()}</h2>
          </div>
          <button onClick={onClose} className="text-xl text-slate-500 hover:text-white">×</button>
        </div>

        <div className="mt-5">
          <label className="text-[10px] text-slate-500">Duration</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 w-full rounded-md border border-slate-700 bg-[#050b10] p-2 text-xs text-white">
            <option value="10">10 seconds</option>
            <option value="20">20 seconds</option>
            <option value="30">30 seconds</option>
            <option value="never">Never — until manually stopped</option>
          </select>
          {duration === "never" && <p className="mt-2 text-[9px] text-amber-400">The helmet alarm will continue until the control room presses STOP ALERT.</p>}
        </div>

        <div className="mt-4">
          <label className="text-[10px] text-slate-500">Message</label>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Emergency alert…" className="mt-1 w-full rounded-md border border-slate-700 bg-[#050b10] p-2 text-xs text-white outline-none focus:border-red-500" />
        </div>

        {result && <p className={`mt-3 text-[10px] ${result.toLowerCase().includes("unable") ? "text-red-400" : "text-emerald-400"}`}>{result}</p>}

        <button disabled={sending} onClick={send} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-red-600 py-2.5 text-xs font-semibold text-white disabled:opacity-50">
          <Bell className="h-3.5 w-3.5" />
          {sending ? "SENDING…" : "SEND ALERT"}
        </button>
      </div>
    </div>
  );
}
