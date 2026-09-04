"use client";

import { useState } from "react";
import { Maximize2, X } from "lucide-react";
import type { HelmetData } from "@/hooks/useHelmetData";
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

        </div>

        {/* Bottom status bar */}
        <div className="flex h-9 shrink-0 items-center overflow-hidden border-t border-slate-800 bg-[#071118] px-4 py-2 text-[9px] text-slate-500">
          <span>Interactive 3D mine view • Drag to rotate • Scroll to zoom • Right-click to pan</span>
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