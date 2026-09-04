"use client";

import { useRouter } from "next/navigation";
import { HardHat, MapPin, Radio } from "lucide-react";
import type { HelmetData } from "@/hooks/useHelmetData";
import { findCheckpoint, getWorkerCoveragePosition, CHECKPOINTS } from "@/lib/mineMap/checkpoints";

export const DEMO_HELMET_IDS = ["helmet_02", "helmet_03", "helmet_04", "helmet_05"];

function createDemoHelmet(helmetId: string): HelmetData {
  return {
    helmetId,
    temperature: null,
    humidity: null,
    gas_raw: null,
    gas_status: null,
    mq2: { raw: null, status: null },
    mq7: { raw: null, status: null },
    wifi_rssi: null,
    uptime: null,
    battery: null,
    vibration: null,
    workerId: null,
    workerName: null,
    checkpoint: { where: null, time: null },
    mpu6050: {
      accel_x: null, accel_y: null, accel_z: null,
      gyro_x: null, gyro_y: null, gyro_z: null,
      temperature: null,
      acceleration_magnitude: null,
      rotation_magnitude: null,
      motion_status: null,
    },
  };
}

export default function HelmetList({
  helmets,
  onAlert,
  neverActive,
  onStopNever,
}: {
  helmets: HelmetData[];
  onAlert: (helmet: HelmetData) => void;
  neverActive: Record<string, boolean>;
  onStopNever: (helmet: HelmetData) => void | Promise<void>;
}) {
  const router = useRouter();

  const displayHelmets = [
    ...helmets,
    ...DEMO_HELMET_IDS
      .filter((id) => !helmets.some((helmet) => helmet.helmetId.toLowerCase() === id))
      .map(createDemoHelmet),
  ];

  if (!displayHelmets.length) {
    return <div className="rounded-xl border border-slate-800 bg-[#071118] p-8 text-center text-xs text-slate-500">No helmet records available in Firebase.</div>;
  }

  return (
    <div className="space-y-2">
      {displayHelmets.map((h) => {
        const cp = findCheckpoint(h.checkpoint.where);
        const coverage = cp ? getWorkerCoveragePosition(cp.id, CHECKPOINTS) : null;
        const online = h.wifi_rssi !== null || h.uptime !== null || h.temperature !== null;
        const isDemoInactive = DEMO_HELMET_IDS.includes(h.helmetId.toLowerCase());

        return (
          <div
            key={h.helmetId}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/helmet/${encodeURIComponent(h.helmetId)}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/helmet/${encodeURIComponent(h.helmetId)}`);
              }
            }}
            className="w-full cursor-pointer rounded-xl border border-slate-800 bg-[#071118] p-3 text-left transition hover:border-red-500/40 hover:bg-red-500/5 focus:outline-none focus:ring-1 focus:ring-red-500/50"
            title={`Open ${h.helmetId.replace("_", "-").toUpperCase()} details`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900">
                <HardHat className="h-5 w-5 text-slate-300" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{h.helmetId.replace("_", "-").toUpperCase()}</span>
                  <span className={`text-[9px] font-semibold ${online ? "text-emerald-400" : "text-red-400"}`}>● {online ? "ACTIVE" : isDemoInactive ? "INACTIVE" : "OFFLINE"}</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">{h.workerName || h.workerId || "Worker: N/A"}</p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAlert(h);
                  }}
                  className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[9px] text-red-300 hover:bg-red-500/20"
                >
                  ALERT
                </button>
                {neverActive[h.helmetId] && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void onStopNever(h);
                    }}
                    className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[9px] font-semibold text-amber-300 hover:bg-amber-500/20"
                  >
                    STOP ALERT
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[9px]">
              <div className="text-slate-500"><Radio className="mr-1 inline h-3 w-3" />{h.wifi_rssi !== null ? `${h.wifi_rssi} dBm` : "Signal N/A"}</div>
              <div className="text-slate-500"><MapPin className="mr-1 inline h-3 w-3" />{cp?.name || h.checkpoint.where || "Checkpoint N/A"}</div>
            </div>

            {coverage && <p className="mt-2 text-[9px] text-slate-600">Coverage: {coverage.from.name} → {coverage.to?.name || "End"}</p>}
          </div>
        );
      })}
    </div>
  );
}
