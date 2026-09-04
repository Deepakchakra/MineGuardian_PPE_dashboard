"use client";

import {
  Bell,
  ChevronDown,
} from "lucide-react";

export default function PageHeader() {
  return (
    <header className="flex h-[58px] items-center justify-end border-b border-slate-800 bg-[#050b10] px-5">

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">

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
            <p className="text-[10px] font-semibold text-white">
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