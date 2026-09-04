"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  CheckCircle2,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase/config";
import DashboardPageShell from "@/components/DashboardPageShell";

const AI_VIDEO_URL = "http://127.0.0.1:8000/video";
const AI_DETECTIONS_URL = "http://127.0.0.1:8000/detections";

type Detection = {
  class: string;
  confidence: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type DetectionResponse = {
  timestamp: number;
  count: number;
  detections: Detection[];
};

export default function AIPPEDetectionPage() {
  const [stats, setStats] = useState({
    accepted: null as number | null,
    rejected: null as number | null,
  });

  const [detections, setDetections] = useState<Detection[]>([]);
  const [aiOnline, setAiOnline] = useState(false);

  /* ============================================================
     FIREBASE PPE STATS
     ============================================================ */

  useEffect(() => {
    const candidates = [
      "/MineGuardian/ppe_detection",
      "/MineGuardian/ai_ppe",
      "/MineGuardian/ppe",
    ];

    let active = true;

    const unsubs = candidates.map((path) =>
      onValue(ref(database, path), (snap) => {
        if (!active || !snap.exists()) {
          return;
        }

        const v = snap.val() || {};

        const accepted =
          typeof v.accepted === "number"
            ? v.accepted
            : typeof v.workers_accepted === "number"
              ? v.workers_accepted
              : null;

        const rejected =
          typeof v.rejected === "number"
            ? v.rejected
            : typeof v.workers_rejected === "number"
              ? v.workers_rejected
              : null;

        if (accepted !== null || rejected !== null) {
          setStats({
            accepted,
            rejected,
          });
        }
      }),
    );

    return () => {
      active = false;

      unsubs.forEach((unsubscribe) => {
        unsubscribe();
      });
    };
  }, []);

  /* ============================================================
     AI DETECTION SERVER
     ============================================================ */

  useEffect(() => {
    let active = true;

    const loadDetections = async () => {
      try {
        const response = await fetch(AI_DETECTIONS_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("AI server unavailable");
        }

        const data = (await response.json()) as DetectionResponse;

        if (!active) {
          return;
        }

        setDetections(
          Array.isArray(data.detections)
            ? data.detections
            : [],
        );

        setAiOnline(true);
      } catch {
        if (active) {
          setAiOnline(false);
        }
      }
    };

    loadDetections();

    const interval = window.setInterval(
      loadDetections,
      1000,
    );

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  /* ============================================================
     UNIQUE DETECTION CLASSES
     ============================================================ */

  const uniqueClasses = useMemo(
    () =>
      Array.from(
        new Set(
          detections.map(
            (detection) => detection.class,
          ),
        ),
      ),
    [detections],
  );

  /* ============================================================
     PAGE
     ============================================================ */

  return (
    <DashboardPageShell
      title="AI PPE Detection"
      description="Entry-gate PPE surveillance and worker compliance"
    >
      {/* ========================================================
          MAIN AI AREA

          LEFT  = CAMERA
          RIGHT = STATISTICS
          ======================================================== */}

      <div className="grid h-full min-h-0 grid-cols-[minmax(0,3fr)_minmax(260px,1fr)] gap-3">

        {/* ======================================================
            LEFT SIDE — LARGE CAMERA
            ====================================================== */}

        <section className="relative min-h-0 overflow-hidden rounded-xl border border-slate-800 bg-black">

          {/* CAMERA HEADER */}

          <div className="absolute left-0 right-0 top-0 z-30 flex h-11 items-center gap-2 border-b border-slate-800 bg-[#050b10]/95 px-4">

            <Camera className="h-4 w-4 text-slate-400" />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Live AI PPE Detection Camera
              </h2>

              <p className="text-[9px] text-slate-600">
                Entry gate surveillance • OBS + YOLO
              </p>
            </div>

            {/* AI STATUS */}

            <span
              className={`ml-auto flex items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] ${
                aiOnline
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                  : "border-amber-500/20 bg-amber-500/5 text-amber-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  aiOnline
                    ? "animate-pulse bg-emerald-500"
                    : "bg-amber-500"
                }`}
              />

              {aiOnline
                ? "AI CAMERA LIVE"
                : "AI SERVER OFFLINE"}
            </span>
          </div>

          {/* ====================================================
              FULL CAMERA

              The image fills the entire left panel.
              No aspect-video.
              No object-contain.
              No centered black space.
              ==================================================== */}

          <div className="absolute inset-0 overflow-hidden bg-black">

            <img
              src={AI_VIDEO_URL}
              alt="Live MineGuardian AI PPE detection"
              className="absolute inset-0 h-full w-full object-cover"
            />

          </div>

          {/* ====================================================
              TOP CAMERA GRADIENT
              ==================================================== */}

          <div className="pointer-events-none absolute left-0 right-0 top-11 z-10 h-20 bg-gradient-to-b from-black/50 to-transparent" />

          {/* ====================================================
              DETECTION COUNTER
              ==================================================== */}

          <div className="pointer-events-none absolute left-3 top-14 z-20 rounded border border-slate-700/80 bg-black/75 px-2 py-1 text-[8px] text-slate-300 backdrop-blur-sm">
            {detections.length} detection
            {detections.length === 1 ? "" : "s"}
          </div>

          {/* ====================================================
              DETECTED CLASSES
              ==================================================== */}

          {uniqueClasses.length > 0 && (
            <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex max-w-[80%] flex-wrap gap-1.5">
              {uniqueClasses.map((name) => (
                <span
                  key={name}
                  className="rounded border border-emerald-500/20 bg-black/75 px-2 py-1 text-[8px] font-medium text-emerald-300 backdrop-blur-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* ====================================================
              CAMERA BRANDING
              ==================================================== */}

          <div className="pointer-events-none absolute bottom-3 right-3 z-20 rounded border border-slate-700/50 bg-black/70 px-2 py-1 text-[8px] font-medium text-white/80 backdrop-blur-sm">
            MineGuardian AI PPE Detection
          </div>
        </section>

        {/* ======================================================
            RIGHT SIDE — LIVE STATISTICS
            ====================================================== */}

        <section className="grid min-h-0 grid-rows-3 gap-3">

          {/* ====================================================
              WORKERS ACCEPTED
              ==================================================== */}

          <StatCard
            icon={
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            }
            title="Workers Accepted"
            value={stats.accepted}
            description="PPE compliant workers"
            valueClass="text-emerald-400"
          />

          {/* ====================================================
              WORKERS REJECTED
              ==================================================== */}

          <StatCard
            icon={
              <XCircle className="h-6 w-6 text-red-400" />
            }
            title="Workers Rejected"
            value={stats.rejected}
            description="PPE non-compliant workers"
            valueClass="text-red-400"
          />

          {/* ====================================================
              LIVE DETECTIONS
              ==================================================== */}

          <StatCard
            icon={
              <ShieldCheck className="h-6 w-6 text-sky-400" />
            }
            title="Live Detections"
            value={detections.length}
            description={
              uniqueClasses.length
                ? uniqueClasses.join(" • ")
                : "No current detections"
            }
            valueClass="text-sky-400"
          />
        </section>
      </div>
    </DashboardPageShell>
  );
}

/* ================================================================
   STAT CARD
   ================================================================ */

function StatCard({
  icon,
  title,
  value,
  description,
  valueClass,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | null;
  description: string;
  valueClass: string;
}) {
  return (
    <div className="flex min-h-0 flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-[#071118] p-5">

      {/* CARD HEADER */}

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-slate-800 bg-[#050b10]">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-sm font-semibold text-white">
            {title}
          </p>

          <p className="mt-1 text-[10px] leading-4 text-slate-500">
            {description}
          </p>

        </div>
      </div>

      {/* CARD VALUE */}

      <div className="flex items-end justify-between">

        <span
          className={`text-5xl font-bold tracking-tight ${valueClass}`}
        >
          {value === null ? "N/A" : value}
        </span>

        <Users className="mb-1 h-5 w-5 text-slate-700" />

      </div>
    </div>
  );
}