"use client";

import DashboardPageShell from "@/components/DashboardPageShell";

export default function SettingsPage() {
  return (
    <DashboardPageShell
      title="Settings"
      description="MineGuardian system configuration"
    >

      <div className="max-w-3xl rounded-lg border border-slate-800 bg-[#071118]">

        <div className="border-b border-slate-800 p-5">

          <h2 className="font-semibold">
            System Settings
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Configure monitoring and alert thresholds.
          </p>

        </div>

        <div className="space-y-5 p-5">

          <Setting
            title="Temperature Alert"
            value="35 °C"
          />

          <Setting
            title="Gas Alert Threshold"
            value="400 PPM"
          />

          <Setting
            title="Motion Monitoring"
            value="Enabled"
          />

          <Setting
            title="Automatic Emergency Alerts"
            value="Enabled"
          />

        </div>

      </div>

    </DashboardPageShell>
  );
}

function Setting({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-4">

      <div>
        <p className="text-sm text-white">
          {title}
        </p>

        <p className="mt-1 text-[10px] text-slate-500">
          Safety system configuration
        </p>
      </div>

      <input
        defaultValue={value}
        className="w-32 rounded-md border border-slate-700 bg-[#0a141b] px-3 py-2 text-right text-xs text-white"
      />

    </div>
  );
}