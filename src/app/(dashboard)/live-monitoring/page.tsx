"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import { useHelmetData } from "@/hooks/useHelmetData";

export default function LiveMonitoringPage() {
  const {
    data,
    loading,
    error,
  } = useHelmetData("helmet_01");

  if (loading) {
    return (
      <DashboardPageShell
        title="Live Monitoring"
        description="Real-time helmet sensor monitoring"
      >
        <div className="rounded-lg border border-slate-800 bg-[#081118] p-8 text-center text-sm text-slate-400">
          Loading sensor data...
        </div>
      </DashboardPageShell>
    );
  }

  if (error) {
    return (
      <DashboardPageShell
        title="Live Monitoring"
        description="Real-time helmet sensor monitoring"
      >
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-8 text-center text-sm text-red-400">
          Unable to connect to Firebase.
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Live Monitoring"
      description="Real-time helmet sensor monitoring"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <SensorCard
          title="Temperature"
          value={data.temperature}
          unit="°C"
        />

        <SensorCard
          title="Humidity"
          value={data.humidity}
          unit="%"
        />

        <SensorCard
          title="MQ-2 Gas"
          value={data.mq2?.raw}
          unit="PPM"
        />

        <SensorCard
          title="Wi-Fi Signal"
          value={data.wifi?.rssi}
          unit="dBm"
        />

      </div>
    </DashboardPageShell>
  );
}

function SensorCard({
  title,
  value,
  unit,
}: {
  title: string;
  value: number | string | null | undefined;
  unit: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#081118] p-5">
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <div className="mt-4 flex items-end gap-1">
        <span className="text-2xl font-semibold text-white">
          {value ?? "--"}
        </span>

        <span className="mb-1 text-xs text-slate-500">
          {unit}
        </span>
      </div>

      <p className="mt-2 text-[9px] text-emerald-400">
        ● LIVE
      </p>
    </div>
  );
}