"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import { useHelmetData } from "@/hooks/useHelmetData";

export default function HelmetsPage() {
  const { data, loading, error } =
    useHelmetData("helmet_01");

  return (
    <DashboardPageShell
      title="Helmets"
      description="Connected worker safety helmets"
    >

      <div className="mb-5 flex items-center justify-between">

        <div>
          <h2 className="text-lg font-semibold">
            Registered Helmets
          </h2>

          <p className="text-xs text-slate-500">
            Live connection status
          </p>
        </div>

        <button className="rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-white">
          + Register Helmet
        </button>

      </div>

      <div className="grid grid-cols-3 gap-5">

        <HelmetCard
          id="HELMET-01"
          worker="WORKER-07"
          connected={!loading && !error}
          signal={data.wifi_rssi}
          uptime={data.uptime}
        />

      </div>

    </DashboardPageShell>
  );
}

function HelmetCard({
  id,
  worker,
  connected,
  signal,
  uptime,
}: {
  id: string;
  worker: string;
  connected: boolean;
  signal: number | null;
  uptime: number | null;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#071118] p-5">

      <div className="flex items-center justify-between">

        <h3 className="font-semibold">
          {id}
        </h3>

        <span
          className={
            connected
              ? "text-[10px] text-green-400"
              : "text-[10px] text-red-400"
          }
        >
          ● {connected ? "CONNECTED" : "OFFLINE"}
        </span>

      </div>

      <div className="my-8 flex justify-center">

        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-5xl">
          ⛑
        </div>

      </div>

      <Info label="Worker ID" value={worker} />

      <Info
        label="Signal Strength"
        value={
          signal !== null
            ? `${signal} dBm`
            : "--"
        }
      />

      <Info
        label="Uptime"
        value={
          uptime !== null
            ? `${uptime}s`
            : "--"
        }
      />

    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-slate-800 py-3">

      <p className="text-[10px] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium text-white">
        {value}
      </p>

    </div>
  );
}