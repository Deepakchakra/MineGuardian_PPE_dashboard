"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  HardHat,
  MapPin,
  Radio,
} from "lucide-react";

import type { HelmetData } from "@/hooks/useHelmetData";

import {
  findCheckpoint,
  getWorkerCoveragePosition,
  CHECKPOINTS,
  type Checkpoint,
} from "@/lib/mineMap/checkpoints";

export const DEMO_HELMET_IDS = [
  "helmet_02",
  "helmet_03",
  "helmet_04",
  "helmet_05",
];

function createDemoHelmet(helmetId: string): HelmetData {
  return {
    helmetId,
    temperature: null,
    humidity: null,
    gas_raw: null,
    gas_status: null,
    mq2: {
      raw: null,
      status: null,
    },
    mq7: {
      raw: null,
      status: null,
    },
    wifi_rssi: null,
    uptime: null,
    battery: null,
    vibration: null,
    workerId: null,
    workerName: null,
    checkpoint: {
      where: null,
      time: null,
    },
    mpu6050: {
      accel_x: null,
      accel_y: null,
      accel_z: null,
      gyro_x: null,
      gyro_y: null,
      gyro_z: null,
      temperature: null,
      acceleration_magnitude: null,
      rotation_magnitude: null,
      motion_status: null,
    },
  };
}

function helmetLabel(id: string) {
  return id.replace(/_/g, "-").toUpperCase();
}

export default function HelmetList({
  helmets,
  onAlert,
  neverCommands,
  stopLoading,
  stopErrors,
  onStopNever,
}: {
  helmets: HelmetData[];
  onAlert: (helmet: HelmetData) => void;
  neverCommands: Record<
    string,
    {
      commandId: string;
      status: string;
    }
  >;
  stopLoading: Record<string, boolean>;
  stopErrors: Record<string, string | null>;
  onStopNever: (
    helmet: HelmetData
  ) => void | Promise<void>;
}) {
  const router = useRouter();

  const displayHelmets = [
    ...helmets,
    ...DEMO_HELMET_IDS
      .filter(
        (id) =>
          !helmets.some(
            (helmet) =>
              helmet.helmetId.toLowerCase() === id
          )
      )
      .map(createDemoHelmet),
  ];

  if (!displayHelmets.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#071118] p-6 text-center text-xs text-slate-500">
        No helmet records available in Firebase.
      </div>
    );
  }

  return (
    <div className="space-y-2.5 pb-1">
      {displayHelmets.map((h) => {
        const cp = findCheckpoint(
          h.checkpoint.where
        );

        const coverage = cp
          ? getWorkerCoveragePosition(
              cp.id,
              CHECKPOINTS
            )
          : null;

        // Explicit types prevent TypeScript from
        // incorrectly narrowing these values to never.
        const coverageFrom =
          coverage?.from as Checkpoint | undefined;

        const coverageTo =
          coverage?.to as Checkpoint | null | undefined;

        const online =
          h.wifi_rssi !== null ||
          h.uptime !== null ||
          h.temperature !== null;

        const isDemoInactive =
          DEMO_HELMET_IDS.includes(
            h.helmetId.toLowerCase()
          );

        const command =
          neverCommands[h.helmetId];

        return (
          <div
            key={h.helmetId}
            role="button"
            tabIndex={0}
            onClick={() =>
              router.push(
                `/helmet/${encodeURIComponent(
                  h.helmetId
                )}`
              )
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === " "
              ) {
                e.preventDefault();

                router.push(
                  `/helmet/${encodeURIComponent(
                    h.helmetId
                  )}`
                );
              }
            }}
            className="group w-full cursor-pointer rounded-xl border border-slate-800/90 bg-gradient-to-br from-[#09151d] to-[#061017] p-3 transition-all duration-200 hover:-translate-y-px hover:border-red-500/35 hover:shadow-[0_8px_24px_rgba(0,0,0,0.24)] focus:outline-none focus:ring-1 focus:ring-red-500/50"
            title={`Open ${helmetLabel(
              h.helmetId
            )} details`}
          >
            {/* Identity row */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700/80 bg-[#0b1822] shadow-inner">
                <HardHat className="h-5 w-5 text-slate-300 transition-colors group-hover:text-red-300" />

                <span
                  className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-[#09151d] ${
                    online
                      ? "bg-emerald-400"
                      : "bg-slate-600"
                  }`}
                />
              </div>

              <div className="min-w-[82px] flex-1 overflow-visible">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="whitespace-nowrap text-[11px] font-bold tracking-wide text-white">
                    {helmetLabel(
                      h.helmetId
                    )}
                  </span>

                  <span
                    className={`shrink-0 text-[8px] font-bold uppercase ${
                      online
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {online
                      ? "LIVE"
                      : isDemoInactive
                        ? "INACTIVE"
                        : "OFFLINE"}
                  </span>
                </div>

                <p className="mt-1 truncate text-[9px] text-slate-500">
                  {h.workerName ||
                    h.workerId ||
                    "Worker not assigned"}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAlert(h);
                }}
                className="flex h-8 w-[76px] shrink-0 items-center justify-center gap-1 rounded-lg border border-red-500/30 bg-red-500/8 px-1.5 text-[8px] font-bold tracking-wide text-red-300 transition hover:border-red-400/50 hover:bg-red-500/15"
                aria-label={`Send alert to ${helmetLabel(
                  h.helmetId
                )}`}
              >
                <AlertTriangle className="h-3 w-3" />
                ALERT
              </button>
            </div>

            {/* Compact live data row */}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-2.5 text-[9px]">
              <div className="min-w-0 text-slate-500">
                <Radio className="mr-1 inline h-3 w-3 text-slate-600" />

                <span>
                  {h.wifi_rssi !== null
                    ? `${h.wifi_rssi} dBm`
                    : "Signal N/A"}
                </span>
              </div>

              <div className="min-w-0 truncate text-slate-500">
                <MapPin className="mr-1 inline h-3 w-3 text-slate-600" />

                <span>
                  {cp?.name ||
                    h.checkpoint.where ||
                    "Checkpoint N/A"}
                </span>
              </div>
            </div>

            {/* Worker coverage */}
            {coverage && coverageFrom && (
              <div className="mt-2 rounded-lg border border-sky-500/10 bg-sky-500/[0.03] px-2 py-1.5 text-[8px] text-slate-500">
                <span className="text-slate-600">
                  ROUTE{" "}
                </span>

                <span className="text-sky-300/80">
                  {coverageFrom.name}
                </span>

                <span className="px-1 text-slate-700">
                  →
                </span>

                <span className="text-sky-300/80">
                  {coverageTo
                    ? coverageTo.name
                    : "END"}
                </span>
              </div>
            )}

            {/* Alert state stays compact and functional */}
            {command?.status === "ACTIVE" && (
              <button
                type="button"
                disabled={
                  stopLoading[h.helmetId]
                }
                onClick={(e) => {
                  e.stopPropagation();
                  void onStopNever(h);
                }}
                className="mt-2 w-full rounded-lg border border-amber-500/30 bg-amber-500/8 px-2 py-1.5 text-[8px] font-bold tracking-wide text-amber-300 hover:bg-amber-500/15 disabled:opacity-60"
              >
                {stopLoading[h.helmetId]
                  ? "STOPPING ALERT…"
                  : "STOP ACTIVE ALERT"}
              </button>
            )}

            {command?.status &&
              command.status !== "ACTIVE" && (
                <div className="mt-2 flex items-center justify-between text-[8px]">
                  <span className="text-slate-600">
                    NEVER ALERT
                  </span>

                  <span className="font-semibold text-slate-500">
                    {command.status}
                  </span>
                </div>
              )}

            {stopErrors[h.helmetId] && (
              <p className="mt-1 text-[8px] leading-3 text-red-400">
                {stopErrors[h.helmetId]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}