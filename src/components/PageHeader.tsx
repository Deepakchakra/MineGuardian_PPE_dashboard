"use client";

import {
  Bell,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";

export default function PageHeader() {
  return (
    <header className="flex h-[58px] items-center justify-between border-b border-slate-800 bg-[#050b10] px-5">

      <div className="flex items-center gap-3">
        <ShieldAlert className="h-5 w-5 text-red-500" />

        <div>
          <h2 className="text-sm font-semibold text-white">
            MineGuardian
          </h2>

          <p className="text-[9px] text-slate-500">
            Mining Safety Control Room
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">

        {/* System status */}
        <div className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2">
          <span className="text-[10px] font-semibold text-red-400">
            ⚠ SYSTEM MONITORING
          </span>
        </div>

        {/* Notification */}
        <div className="relative">
          <Bell className="h-4 w-4 text-slate-300" />

          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[8px] text-white">
            3
          </span>
        </div>

        {/* Operator */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold">
            OP
          </div>

          <div>
            <p className="text-[10px] font-semibold">
              Operator
            </p>

            <p className="text-[8px] text-slate-500">
              Control Room
            </p>
          </div>

          <ChevronDown className="h-3 w-3 text-slate-500" />
        </div>

      </div>
    </header>
  );
}