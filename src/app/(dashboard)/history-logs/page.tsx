"use client";

import DashboardPageShell from "@/components/DashboardPageShell";

const logs = [
  {
    time: "10:24:31 AM",
    helmet: "HELMET-01",
    event: "STATUS UPDATE",
    status: "NORMAL",
  },
  {
    time: "10:21:05 AM",
    helmet: "HELMET-01",
    event: "TEMPERATURE CHECK",
    status: "WARNING",
  },
  {
    time: "10:15:42 AM",
    helmet: "HELMET-01",
    event: "GAS CHECK",
    status: "NORMAL",
  },
];

export default function HistoryLogs() {
  return (
    <DashboardPageShell
      title="History & Logs"
      description="Sensor events and system activity"
    >

      <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#071118]">

        <table className="w-full text-left text-xs">

          <thead className="border-b border-slate-800 bg-[#0a141b] text-slate-500">
            <tr>
              <th className="p-4">TIME</th>
              <th className="p-4">HELMET</th>
              <th className="p-4">EVENT</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log, index) => (
              <tr
                key={index}
                className="border-b border-slate-800 hover:bg-slate-900/40"
              >
                <td className="p-4 text-slate-400">
                  {log.time}
                </td>

                <td className="p-4 text-white">
                  {log.helmet}
                </td>

                <td className="p-4 text-slate-300">
                  {log.event}
                </td>

                <td className="p-4">
                  <span className="rounded bg-green-950 px-2 py-1 text-[9px] text-green-400">
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </DashboardPageShell>
  );
}