"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import type { HelmetData } from "@/hooks/useHelmetData";
import { CHECKPOINTS, findCheckpoint, getWorkerCoveragePosition } from "@/lib/mineMap/checkpoints";

export default function MineMap({
  helmets,
  selectedId,
  onSelectHelmet,
}: {
  helmets: HelmetData[];
  selectedId: string | null;
  onSelectHelmet: (id: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-black">
      <div className="relative min-h-0 w-full flex-1">
        <Image src="/mine-tunnel-map.jpeg" alt="Mine tunnel network" fill priority className="object-contain" />
        <div className="absolute inset-0">
          {CHECKPOINTS.map((cp) => (
            <div key={cp.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${cp.x}%`, top: `${cp.y}%` }}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/80 bg-blue-600 text-[9px] font-bold text-white shadow-lg shadow-blue-900/40">
                {cp.id.slice(-2)}
              </span>
              <span className="mt-1 block whitespace-nowrap rounded bg-black/75 px-1.5 py-0.5 text-[8px] font-medium text-blue-100">{cp.name}</span>
            </div>
          ))}

          {helmets.map((helmet) => {
            const checkpoint = findCheckpoint(helmet.checkpoint.where);
            const position = checkpoint ? getWorkerCoveragePosition(checkpoint.id, CHECKPOINTS) : null;
            if (!position) return null;
            const selected = helmet.helmetId === selectedId;
            return (
              <button
                key={helmet.helmetId}
                type="button"
                onClick={() => onSelectHelmet(helmet.helmetId)}
                title={`${helmet.helmetId} • ${helmet.checkpoint.where || "Checkpoint N/A"}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${selected ? "border-white bg-red-500" : "border-red-200 bg-red-600/90"} shadow-xl`}>
                  <MapPin className="h-4 w-4 text-white" />
                </span>
                <span className="mt-1 block whitespace-nowrap rounded bg-black/85 px-1.5 py-0.5 text-[8px] font-semibold text-white">
                  {helmet.helmetId.replace("_", "-").toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex h-9 shrink-0 items-center gap-5 overflow-hidden border-t border-slate-800 bg-[#071118] px-4 py-2 text-[9px] text-slate-500">
        <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500" />Checkpoint</span>
        <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />Worker coverage</span>
        <span>Position = midpoint from last RFID checkpoint to next checkpoint</span>
      </div>
    </div>
  );
}
