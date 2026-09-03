"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Activity,
  AlertTriangle,
  Cloud,
  Gauge,
  HardHat,
  History,
  LayoutDashboard,
  Map,
  Radio,
  Settings,
  ShieldAlert,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Live Monitoring",
    href: "/live-monitoring",
    icon: Activity,
  },
  {
    label: "Helmets",
    href: "/helmets",
    icon: HardHat,
  },
  {
    label: "Alerts",
    href: "/alerts",
    icon: AlertTriangle,
    badge: 3,
  },
  {
    label: "Commands",
    href: "/commands",
    icon: Radio,
  },
  {
    label: "History & Logs",
    href: "/history-logs",
    icon: History,
  },
  {
    label: "Map View",
    href: "/map-view",
    icon: Map,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: Gauge,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[190px] flex-col border-r border-slate-800 bg-[#050b10] text-white">

      {/* Logo */}
      <div className="flex h-[58px] shrink-0 items-center gap-2 border-b border-slate-800 px-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-600/40 bg-red-600/10">
          <ShieldAlert className="h-5 w-5 text-red-500" />
        </div>

        <div>
          <h1 className="text-[15px] font-bold">
            MineGuardian
          </h1>

          <p className="text-[9px] text-slate-500">
            Mining Safety System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[12px] transition-all ${
                active
                  ? "border border-red-500/40 bg-red-500/10 text-red-400"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon size={16} />

              <span className="flex-1">
                {item.label}
              </span>

              {item.badge && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Helmet status */}
      <div className="m-2 rounded-lg border border-slate-800 bg-[#081118] p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold">
            HELMET-01
          </span>

          <span className="flex items-center gap-1 text-[8px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            CONNECTED
          </span>
        </div>

        <div className="my-4 flex justify-center">
          <HardHat className="h-12 w-12 text-slate-300" />
        </div>

        <div className="space-y-3 text-[9px]">
          <div>
            <p className="text-slate-500">
              Signal Strength
            </p>

            <p className="mt-1 font-semibold text-white">
              -63 dBm
            </p>
          </div>

          <div>
            <p className="text-slate-500">
              Uptime
            </p>

            <p className="mt-1 font-semibold text-white">
              00:01:33
            </p>
          </div>

          <div>
            <p className="text-slate-500">
              Worker ID
            </p>

            <p className="mt-1 font-semibold text-white">
              WORKER-07
            </p>
          </div>

          <div>
            <p className="text-slate-500">
              Location
            </p>

            <p className="mt-1 font-semibold text-white">
              Checkpoint 3
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}