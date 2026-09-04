"use client";

import { useEffect, useState } from "react";
import { Camera, HardHat, Radio } from "lucide-react";
import { onValue, ref, update } from "firebase/database";
import { database } from "@/lib/firebase/config";
import {
  useAllHelmetData,
  type HelmetData,
} from "@/hooks/useHelmetData";
import HelmetList, {
  DEMO_HELMET_IDS,
} from "@/components/HelmetList";
import MineMap from "@/components/MineMap";
import AlertDialog from "@/components/AlertDialog";

/* ================================================================
   TYPES
   ================================================================ */

type FirebaseCommand = {
  commandId: string;
  type?: string;
  duration?: string;
  helmet_id?: string;
  status?: string;
  created_at?: number | string;
  [key: string]: unknown;
};

type NeverCommandState = {
  commandId: string;
  status: string;
};

/* ================================================================
   HOME PAGE
   ================================================================ */

export default function Home() {
  const { helmets } = useAllHelmetData();

  const [alertHelmet, setAlertHelmet] =
    useState<HelmetData | null>(null);

  const [neverCommands, setNeverCommands] =
    useState<Record<string, NeverCommandState>>({});

  const [stopLoading, setStopLoading] =
    useState<Record<string, boolean>>({});

  const [stopErrors, setStopErrors] =
    useState<Record<string, string | null>>({});

  /* ================================================================
     REAL-TIME NEVER ALERT COMMAND LISTENER
     ================================================================ */

  useEffect(() => {
    const commandsRef = ref(
      database,
      "/MineGuardian/commands",
    );

    const unsubscribe = onValue(
      commandsRef,
      (snapshot) => {
        const value = snapshot.val();

        if (!value || typeof value !== "object") {
          setNeverCommands({});
          return;
        }

        const commands: FirebaseCommand[] = [];

        Object.entries(
          value as Record<string, unknown>,
        ).forEach(([commandId, rawValue]) => {
          if (
            !rawValue ||
            typeof rawValue !== "object"
          ) {
            return;
          }

          const raw = rawValue as Record<
            string,
            unknown
          >;

          const command: FirebaseCommand = {
            commandId,
            type:
              typeof raw.type === "string"
                ? raw.type
                : undefined,

            duration:
              typeof raw.duration === "string"
                ? raw.duration
                : undefined,

            helmet_id:
              typeof raw.helmet_id === "string"
                ? raw.helmet_id
                : undefined,

            status:
              typeof raw.status === "string"
                ? raw.status
                : undefined,

            created_at:
              typeof raw.created_at === "number" ||
              typeof raw.created_at === "string"
                ? raw.created_at
                : undefined,
          };

          /*
          * Only keep NEVER ALERT commands
          * belonging to a helmet.
          */
          if (
            command.type === "ALERT" &&
            command.duration === "NEVER" &&
            typeof command.helmet_id === "string"
          ) {
            commands.push(command);
          }
        });

        /*
        * Newest commands first.
        */
        commands.sort(
          (a, b) =>
            Number(b.created_at ?? 0) -
            Number(a.created_at ?? 0),
        );

        const next: Record<
          string,
          NeverCommandState
        > = {};

        /*
        * First collect ACTIVE NEVER commands.
        */
        for (const command of commands) {
          if (!command.helmet_id) {
            continue;
          }

          if (
            command.status === "ACTIVE" &&
            !next[command.helmet_id]
          ) {
            next[command.helmet_id] = {
              commandId: command.commandId,
              status: "ACTIVE",
            };
          }
        }

        /*
        * Then keep the newest command for helmets
        * that don't currently have an ACTIVE command.
        *
        * This allows:
        *
        * ACTIVE → STOPPED
        *
        * to appear correctly.
        */
        for (const command of commands) {
          if (!command.helmet_id) {
            continue;
          }

          if (!next[command.helmet_id]) {
            next[command.helmet_id] = {
              commandId: command.commandId,
              status: command.status ?? "",
            };
          }
        }

        setNeverCommands(next);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  /* ================================================================
     STOP NEVER ALERT
     ================================================================ */

  async function stopNeverAlert(
    helmet: HelmetData,
  ) {
    const helmetId = helmet.helmetId;

    const command =
      neverCommands[helmetId];

    if (
      !command ||
      command.status !== "ACTIVE"
    ) {
      setStopErrors((prev) => ({
        ...prev,
        [helmetId]:
          "No active NEVER alert command was found.",
      }));

      return;
    }

    setStopLoading((prev) => ({
      ...prev,
      [helmetId]: true,
    }));

    setStopErrors((prev) => ({
      ...prev,
      [helmetId]: null,
    }));

    try {
      await update(
        ref(
          database,
          `/MineGuardian/commands/${command.commandId}`,
        ),
        {
          status: "STOPPED",
        },
      );

      /*
       * The Firebase realtime listener above will automatically
       * update the NEVER command status from ACTIVE -> STOPPED.
       */
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to stop alert.";

      setStopErrors((prev) => ({
        ...prev,
        [helmetId]: message,
      }));
    } finally {
      setStopLoading((prev) => ({
        ...prev,
        [helmetId]: false,
      }));
    }
  }

  /* ================================================================
     DEMO HELMET COUNT
     ================================================================ */

  const demoHelmetCount =
    DEMO_HELMET_IDS.filter(
      (id) =>
        !helmets.some(
          (helmet) =>
            helmet.helmetId.toLowerCase() ===
            id,
        ),
    ).length;

  /* ================================================================
     PAGE
     ================================================================ */

  return (
    <div className="h-full min-h-0 overflow-hidden">

      {/* ============================================================
          MAIN HOME GRID
          ============================================================ */}

      <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[270px_minmax(0,1fr)]">

        {/* ==========================================================
            LEFT — HELMET LIST
            ========================================================== */}

        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#050b10] p-3">

          {/* HEADER */}

          <div className="mb-3 flex shrink-0 items-center justify-between">

            <div>

              <div className="flex items-center gap-2">

                <HardHat className="h-4 w-4 text-slate-400" />

                <h2 className="text-sm font-semibold text-white">
                  Helmet Lists
                </h2>

              </div>

              <p className="mt-1 text-[9px] text-slate-600">
                Live helmets detected in Firebase
              </p>

            </div>

            <span className="rounded border border-slate-800 px-2 py-1 text-[9px] text-slate-500">
              {helmets.length + demoHelmetCount}
            </span>

          </div>

          {/* HELMET LIST */}

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">

            <HelmetList
              helmets={helmets}
              onAlert={setAlertHelmet}
              neverCommands={neverCommands}
              stopLoading={stopLoading}
              stopErrors={stopErrors}
              onStopNever={stopNeverAlert}
            />

          </div>
        </section>

        {/* ==========================================================
            CAMERA + MINE MAP

            CAMERA = smaller
            MINE MAP = larger
            ========================================================== */}

        <section className="grid h-full min-h-0 min-w-0 grid-cols-[minmax(0,0.88fr)_minmax(0,1.32fr)] gap-4 overflow-hidden">

          {/* ========================================================
              AI PPE CAMERA
              ======================================================== */}

          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#050b10]">

            {/* CAMERA HEADER */}

            <div className="flex h-[58px] shrink-0 items-center gap-2 border-b border-slate-800 px-4">

              <Camera className="h-4 w-4 text-slate-400" />

              <div className="min-w-0">

                <h2 className="truncate text-sm font-semibold text-white">
                  AI PPE Detection Camera
                </h2>

                <p className="text-[9px] text-slate-600">
                  Entry gate surveillance
                </p>

              </div>

            </div>

            {/* CAMERA */}

            <div className="relative min-h-0 flex-1 overflow-hidden bg-black">

              <img
                src="http://127.0.0.1:8000/video"
                alt="MineGuardian live AI PPE detection camera"
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* LIVE INDICATOR */}

              <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-black/70 px-2.5 py-1 text-[8px] font-semibold text-emerald-400 backdrop-blur-sm">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />

                LIVE AI PPE

              </div>

              {/* CAMERA LABEL */}

              <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded border border-slate-700/80 bg-black/70 px-2 py-1 text-[8px] text-slate-400 backdrop-blur-sm">

                OBS Virtual Camera • YOLO

              </div>

            </div>
          </section>

          {/* ========================================================
              LARGE MINE MAP
              ======================================================== */}

          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#050b10]">

            {/* MAP HEADER */}

            <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-slate-800 px-4">

              <div className="flex min-w-0 items-center gap-2">

                <Radio className="h-4 w-4 shrink-0 text-slate-400" />

                <h2 className="truncate text-sm font-semibold text-white">
                  Mine Map
                </h2>

              </div>

              {/* MAP LEGEND */}

              <div className="flex shrink-0 items-center gap-3 text-[9px] text-slate-500">

                <span className="flex items-center gap-1">

                  <i className="inline-block h-2 w-2 rounded-full bg-blue-500" />

                  Checkpoint

                </span>

                <span className="flex items-center gap-1">

                  <i className="inline-block h-2 w-2 rounded-full bg-red-500" />

                  Worker coverage

                </span>

              </div>
            </div>

            {/* MAP */}

            <div className="min-h-0 flex-1 overflow-hidden">

              <MineMap
                helmets={helmets}
                selectedId={null}
                onSelectHelmet={() => undefined}
              />

            </div>
          </section>
        </section>
      </div>

      {/* ============================================================
          ALERT DIALOG
          ============================================================ */}

      {alertHelmet && (
        <AlertDialog
          helmet={alertHelmet}
          onClose={() =>
            setAlertHelmet(null)
          }
          onNeverStarted={() =>
            undefined
          }
        />
      )}
    </div>
  );
}