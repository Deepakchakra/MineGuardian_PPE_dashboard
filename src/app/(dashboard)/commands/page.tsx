"use client";

import { useState } from "react";
import DashboardPageShell from "@/components/DashboardPageShell";

export default function CommandsPage() {
  const [duration, setDuration] = useState("10");
  const [message, setMessage] = useState(
    "Return to safe zone immediately."
  );

  function sendAlert() {
    alert(
      `Helmet alert command prepared\nDuration: ${duration}s\nMessage: ${message}`
    );
  }

  return (
    <DashboardPageShell
      title="Commands"
      description="Send commands to connected helmets"
    >

      <div className="max-w-2xl rounded-lg border border-slate-800 bg-[#071118] p-6">

        <h2 className="text-lg font-semibold">
          Helmet Alert Command
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Send an audible emergency alert to the selected helmet.
        </p>

        <div className="mt-6">

          <label className="text-xs text-slate-400">
            Helmet
          </label>

          <select className="mt-2 w-full rounded-md border border-slate-700 bg-[#0a141b] p-3 text-sm text-white">
            <option>HELMET-01</option>
          </select>

        </div>

        <div className="mt-5">

          <label className="text-xs text-slate-400">
            Duration
          </label>

          <select
            value={duration}
            onChange={(e) =>
              setDuration(e.target.value)
            }
            className="mt-2 w-full rounded-md border border-slate-700 bg-[#0a141b] p-3 text-sm text-white"
          >
            <option value="5">5 Seconds</option>
            <option value="10">10 Seconds</option>
            <option value="20">20 Seconds</option>
            <option value="30">30 Seconds</option>
          </select>

        </div>

        <div className="mt-5">

          <label className="text-xs text-slate-400">
            Message
          </label>

          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            className="mt-2 w-full rounded-md border border-slate-700 bg-[#0a141b] p-3 text-sm text-white outline-none focus:border-red-500"
          />

        </div>

        <button
          onClick={sendAlert}
          className="mt-6 w-full rounded-md bg-red-700 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          🔊 ACTIVATE HELMET ALERT
        </button>

      </div>

    </DashboardPageShell>
  );
}