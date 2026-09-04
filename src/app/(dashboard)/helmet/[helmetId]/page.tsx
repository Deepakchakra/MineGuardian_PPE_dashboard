"use client";

import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";
import { useParams } from "next/navigation";
import { useHelmetData } from "@/hooks/useHelmetData";
import MineMap from "@/components/MineMap";
import HelmetSensorPanel from "@/components/HelmetSensorPanel";

export default function HelmetDetailsPage() {
  const params = useParams<{ helmetId: string }>();
  const helmetId = decodeURIComponent(params.helmetId || "helmet_01");
  const { data, loading, error } = useHelmetData(helmetId);

  const displayId = helmetId.replace("_", "-").toUpperCase();
  const isActive = data.wifi_rssi !== null || data.uptime !== null || data.temperature !== null;

  return (
    <div className="h-full min-h-0 overflow-y-auto pr-1">
      <div className="mx-auto w-full max-w-[1500px] space-y-4 pb-5">
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#050b10] px-4 py-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600">Helmet monitoring</p>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white">{displayId}</h1>
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${isActive ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
                ● {isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Dedicated location and live sensor view</p>
          </div>
          <Link href="/" className="flex items-center gap-2 rounded-md border border-slate-700 bg-[#071118] px-3 py-2 text-[10px] font-medium text-slate-300 hover:border-slate-500 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-[#050b10] p-10 text-center text-xs text-slate-500">Loading {displayId}…</div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-10 text-center text-xs text-red-300">{error}</div>
        ) : (
          <>
            <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#050b10]">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-slate-400" />
                  <div>
                    <h2 className="text-sm font-semibold">Mine Map — {displayId}</h2>
                    <p className="text-[9px] text-slate-600">{isActive ? "Only this helmet's current RFID coverage position is shown" : "No live RFID position is available for this inactive helmet"}</p>
                  </div>
                </div>
                <span className="text-[9px] text-slate-500">Last checkpoint: <span className="text-slate-300">{data.checkpoint.where || "N/A"}</span></span>
              </div>

              <div className="h-[min(62vh,620px)] min-h-[360px]">
                <MineMap helmets={[data]} selectedId={data.helmetId} onSelectHelmet={() => undefined} />
              </div>
            </section>

            <HelmetSensorPanel helmet={data} />
          </>
        )}
      </div>
    </div>
  );
}
