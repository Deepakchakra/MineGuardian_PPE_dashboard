"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import { useHelmetData } from "@/hooks/useHelmetData";

export default function AlertsPage() {
  const { data } = useHelmetData("helmet_01");

  const alerts = [];

  if (
    data.temperature !== null &&
    data.temperature > 35
  ) {
    alerts.push({
      title: "High Temperature",
      value: `${data.temperature} °C`,
      level: "CRITICAL",
    });
  }

  if (data.gas_status === "DANGER") {
    alerts.push({
      title: "Dangerous Gas Level",
      value: `${data.gas_raw}`,
      level: "CRITICAL",
    });
  }

  if (
    data.mpu6050.motion_status &&
    data.mpu6050.motion_status !== "NORMAL"
  ) {
    alerts.push({
      title: "Abnormal Motion",
      value: data.mpu6050.motion_status,
      level: "WARNING",
    });
  }

  return (
    <DashboardPageShell
      title="Alerts"
      description="MineGuardian safety alerts and incidents"
    >

      <div className="mb-5 grid grid-cols-3 gap-4">

        <Stat title="Active Alerts" value={alerts.length} />

        <Stat title="Critical" value={
          alerts.filter(
            (a) => a.level === "CRITICAL"
          ).length
        } />

        <Stat title="Warnings" value={
          alerts.filter(
            (a) => a.level === "WARNING"
          ).length
        } />

      </div>

      <div className="rounded-lg border border-slate-800 bg-[#071118]">

        <div className="border-b border-slate-800 p-4">
          <h2 className="text-sm font-semibold">
            Current Alerts
          </h2>
        </div>

        {alerts.length === 0 ? (
          <div className="p-10 text-center text-sm text-green-400">
            ✓ No active safety alerts
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-slate-800 p-4"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-950 text-red-400">
                  !
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {alert.title}
                  </p>

                  <p className="text-xs text-slate-500">
                    HELMET-01 · {alert.value}
                  </p>
                </div>

              </div>

              <span className="rounded bg-red-950 px-2 py-1 text-[9px] font-bold text-red-400">
                {alert.level}
              </span>

            </div>
          ))
        )}

      </div>

    </DashboardPageShell>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#071118] p-5">

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}