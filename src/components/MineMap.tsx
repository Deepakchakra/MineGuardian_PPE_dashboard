"use client";

import { useState } from "react";
import { Maximize2, MapPin, X } from "lucide-react";
import type { HelmetData } from "@/hooks/useHelmetData";
import {
  CHECKPOINTS,
  findCheckpoint,
  getWorkerCoveragePosition,
} from "@/lib/mineMap/checkpoints";
import Mine3DViewer from "./Mine3DViewer";

export default function MineMap({
  helmets,
  selectedId,
  onSelectHelmet,
}: {
  helmets: HelmetData[];
  selectedId: string | null;
  onSelectHelmet: (id: string) => void;
}) {
  const [show360, setShow360] = useState(false);

  return (
    <>
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-black">
        <div className="relative min-h-0 w-full flex-1">
          {/* 3D Mine */}
          <Mine3DViewer />

          {/* View 360 Button */}
          <button
            type="button"
            onClick={() => setShow360(true)}
            className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-black/80 px-3 py-2 text-xs font-semibold text-cyan-300 shadow-lg backdrop-blur transition hover:bg-cyan-500/20 hover:text-cyan-200"
          >
            <Maximize2 className="h-4 w-4" />
            View 360°
          </button>

          {/* Checkpoints */}
          <div className="pointer-events-none absolute inset-0">
            {CHECKPOINTS.map((cp) => (
              <div
                key={cp.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${cp.x}%`,
                  top: `${cp.y}%`,
                }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/80 bg-blue-600 text-[9px] font-bold text-white shadow-lg shadow-blue-900/40">
                  {cp.id.slice(-2)}
                </span>

                <span className="mt-1 block whitespace-nowrap rounded bg-black/75 px-1.5 py-0.5 text-[8px] font-medium text-blue-100">
                  {cp.name}
                </span>
              </div>
            ))}

            {/* Workers */}
            {helmets.map((helmet) => {
              const checkpoint = findCheckpoint(helmet.checkpoint.where);

              const position = checkpoint
                ? getWorkerCoveragePosition(
                    checkpoint.id,
                    CHECKPOINTS
                  )
                : null;

              if (!position) return null;

              const selected = helmet.helmetId === selectedId;

              return (
                <button
                  key={helmet.helmetId}
                  type="button"
                  onClick={() => onSelectHelmet(helmet.helmetId)}
                  title={`${helmet.helmetId} • ${
                    helmet.checkpoint.where || "Checkpoint N/A"
                  }`}
                  className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                  }}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                      selected
                        ? "border-white bg-red-500"
                        : "border-red-200 bg-red-600/90"
                    } shadow-xl`}
                  >
                    <MapPin className="h-4 w-4 text-white" />
                  </span>

                  <span className="mt-1 block whitespace-nowrap rounded bg-black/85 px-1.5 py-0.5 text-[8px] font-semibold text-white">
                    {helmet.helmetId
                      .replace("_", "-")
                      .toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="flex h-9 shrink-0 items-center gap-5 overflow-hidden border-t border-slate-800 bg-[#071118] px-4 py-2 text-[9px] text-slate-500">
          <span>
            <i className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500" />
            Checkpoint
          </span>

          <span>
            <i className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />
            Worker coverage
          </span>

          <span>
            Position = midpoint from last RFID checkpoint to next checkpoint
          </span>
        </div>
      </div>

      {/* 360° Fullscreen Viewer */}
      {show360 && (
        <div className="fixed inset-0 z-[100] bg-black">
          <Mine3DViewer />

          {/* Top bar */}
          <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-black/80 px-5 py-3 backdrop-blur">
            <div>
              <h2 className="text-sm font-semibold text-white">
                360° Mine Tunnel
              </h2>

              <p className="text-[10px] text-slate-400">
                Drag to rotate • Scroll to zoom • Right-click to pan
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShow360(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              title="Close 360° viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}