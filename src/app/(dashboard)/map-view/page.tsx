"use client";

import Image from "next/image";
import DashboardPageShell from "@/components/DashboardPageShell";

export default function MapView() {
  return (
    <DashboardPageShell
      title="Map View"
      description="Mine tunnel network and checkpoint monitoring"
    >

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-black">

        <div className="relative aspect-[16/9] w-full">

          <Image
            src="/mine-tunnel-map.jpeg"
            alt="Mine tunnel network"
            fill
            priority
            className="object-contain"
          />

        </div>

      </div>

    </DashboardPageShell>
  );
}