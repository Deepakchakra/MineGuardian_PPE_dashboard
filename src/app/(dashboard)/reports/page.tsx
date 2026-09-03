"use client";

import DashboardPageShell from "@/components/DashboardPageShell";

export default function ReportsPage() {
  return (
    <DashboardPageShell
      title="Reports"
      description="Mining safety analytics and reports"
    >

      <div className="grid grid-cols-3 gap-5">

        <ReportCard
          title="Daily Safety Report"
          description="Sensor and alert summary for today."
        />

        <ReportCard
          title="Helmet Performance"
          description="Connectivity and sensor performance."
        />

        <ReportCard
          title="Incident Report"
          description="Safety incidents and critical alerts."
        />

      </div>

    </DashboardPageShell>
  );
}

function ReportCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#071118] p-5">

      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950 text-blue-400">
        ▣
      </div>

      <h2 className="font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <button className="mt-5 rounded-md border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800">
        Generate Report
      </button>

    </div>
  );
}