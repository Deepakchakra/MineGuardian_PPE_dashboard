"use client";

import type { HelmetData } from "@/hooks/useHelmetData";
import {
  findCheckpoint,
  getWorkerCoveragePosition,
  type Checkpoint,
} from "@/lib/mineMap/checkpoints";

export default function HelmetDetails({
  helmet,
  onAlert,
}: {
  helmet: HelmetData | null;
  onAlert: (h: HelmetData) => void;
}) {
  if (!helmet) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#071118] p-6 text-xs text-slate-500">
        Select a helmet to view live details.
      </div>
    );
  }

  const cp: Checkpoint | undefined = findCheckpoint(
    helmet.checkpoint?.where
  );

  const coverage = cp
    ? getWorkerCoveragePosition(cp.id)
    : null;

  // Explicitly type the values to prevent TypeScript
  // from incorrectly narrowing coverage.to to never.
  const coverageFrom = coverage?.from as Checkpoint | undefined;
  const coverageTo = coverage?.to as Checkpoint | null | undefined;

  const active =
    helmet.wifi_rssi !== null ||
    helmet.uptime !== null ||
    helmet.temperature !== null;

  const lastCheckpoint =
    cp?.name ??
    helmet.checkpoint?.where ??
    "N/A";

  const coverageText = coverageFrom
    ? coverageTo
      ? `${coverageFrom.name} → ${coverageTo.name}`
      : `${coverageFrom.name} → EXIT`
    : "N/A";

  return (
    <div className="rounded-xl border border-slate-800 bg-[#071118] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500">
            SELECTED HELMET
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            {helmet.helmetId
              .replace(/_/g, "-")
              .toUpperCase()}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => onAlert(helmet)}
          className="rounded-md bg-red-600 px-3 py-2 text-[10px] font-semibold text-white hover:bg-red-500"
        >
          SEND ALERT
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-[10px]">
        <Info
          l="Status"
          v={active ? "ACTIVE" : "OFFLINE"}
        />

        <Info
          l="Worker"
          v={
            helmet.workerName ||
            helmet.workerId ||
            "N/A"
          }
        />

        <Info
          l="Last checkpoint"
          v={lastCheckpoint}
        />

        <Info
          l="RFID time"
          v={helmet.checkpoint?.time || "N/A"}
        />

        <Info
          l="Coverage"
          v={coverageText}
        />

        <Info
          l="Battery"
          v={
            helmet.battery !== null
              ? `${helmet.battery}%`
              : "N/A"
          }
        />

        <Info
          l="Signal"
          v={
            helmet.wifi_rssi !== null
              ? `${helmet.wifi_rssi} dBm`
              : "N/A"
          }
        />

        <Info
          l="Uptime"
          v={
            helmet.uptime !== null
              ? `${helmet.uptime}s`
              : "N/A"
          }
        />
      </div>
    </div>
  );
}

function Info({
  l,
  v,
}: {
  l: string;
  v: string;
}) {
  return (
    <div className="border-t border-slate-800 pt-2">
      <p className="text-slate-500">{l}</p>
      <p className="mt-1 font-medium text-white">
        {v}
      </p>
    </div>
  );
}