"use client";

import { useEffect, useState } from "react";
import { Camera, HardHat, Radio } from "lucide-react";
import { onValue, ref, update } from "firebase/database";
import { database } from "@/lib/firebase/config";
import { useAllHelmetData, type HelmetData } from "@/hooks/useHelmetData";
import HelmetList, { DEMO_HELMET_IDS } from "@/components/HelmetList";
import MineMap from "@/components/MineMap";
import AlertDialog from "@/components/AlertDialog";

export default function Home() {
  const { helmets } = useAllHelmetData();
  const [alertHelmet, setAlertHelmet] = useState<HelmetData | null>(null);
  const [neverCommands, setNeverCommands] = useState<Record<string, { commandId: string; status: string }>>({});
  const [stopLoading, setStopLoading] = useState<Record<string, boolean>>({});
  const [stopErrors, setStopErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const commandsRef = ref(database, "/MineGuardian/commands");
    return onValue(commandsRef, (snapshot) => {
      const value = snapshot.val() ?? {};
      const commands = Object.entries(value)
        .map(([commandId, raw]) => ({
          commandId,
          ...(raw as Record<string, unknown>),
        }))
        .filter(
          (command) =>
            command.type === "ALERT" &&
            command.duration === "NEVER" &&
            typeof command.helmet_id === "string",
        )
        .sort((a, b) => Number(b.created_at ?? 0) - Number(a.created_at ?? 0));

      const next: Record<string, { commandId: string; status: string }> = {};
      const activeByHelmet = new Set<string>();

      // Prefer the newest ACTIVE NEVER command for each helmet. If there is no
      // active command, keep the newest NEVER command so ACTIVE -> STOPPED is
      // reflected immediately in the UI from Firebase itself.
      for (const command of commands) {
        const helmetId = String(command.helmet_id);
        const status = String(command.status ?? "");
        if (status === "ACTIVE" && !activeByHelmet.has(helmetId)) {
          next[helmetId] = { commandId: command.commandId, status };
          activeByHelmet.add(helmetId);
        }
      }
      for (const command of commands) {
        const helmetId = String(command.helmet_id);
        if (!next[helmetId]) {
          next[helmetId] = {
            commandId: command.commandId,
            status: String(command.status ?? ""),
          };
        }
      }

      setNeverCommands(next);
    });
  }, []);

  async function stopNeverAlert(helmet: HelmetData) {
    const helmetId = helmet.helmetId;
    const command = neverCommands[helmetId];

    if (!command || command.status !== "ACTIVE") {
      setStopErrors((prev) => ({ ...prev, [helmetId]: "No active NEVER alert command was found." }));
      return;
    }

    setStopLoading((prev) => ({ ...prev, [helmetId]: true }));
    setStopErrors((prev) => ({ ...prev, [helmetId]: null }));

    try {
      await update(ref(database, `/MineGuardian/commands/${command.commandId}`), {
        status: "STOPPED",
      });
      // Do not set local status here. The /commands realtime listener above is
      // the source of truth and will change ACTIVE -> STOPPED after Firebase
      // confirms the update.
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to stop alert.";
      setStopErrors((prev) => ({ ...prev, [helmetId]: message }));
    } finally {
      setStopLoading((prev) => ({ ...prev, [helmetId]: false }));
    }
  }
  const demoHelmetCount = DEMO_HELMET_IDS.filter(
    (id) => !helmets.some((helmet) => helmet.helmetId.toLowerCase() === id),
  ).length;

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[270px_minmax(0,1fr)]">
        {/* Helmet list: only this panel scrolls when more helmets are present. */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#050b10] p-3">
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <HardHat className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold">Helmet Lists</h2>
              </div>
              <p className="mt-1 text-[9px] text-slate-600">Live helmets detected in Firebase</p>
            </div>
            <span className="rounded border border-slate-800 px-2 py-1 text-[9px] text-slate-500">{helmets.length + demoHelmetCount}</span>
          </div>

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

        {/* Default Home: camera + complete mine map only. */}
        <section className="grid h-full min-h-0 min-w-0 grid-cols-2 gap-4 overflow-hidden">
          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#050b10]">
            <div className="flex h-[58px] shrink-0 items-center gap-2 border-b border-slate-800 px-4">
              <Camera className="h-4 w-4 text-slate-400" />
              <div>
                <h2 className="text-sm font-semibold">AI PPE Detection Camera</h2>
                <p className="text-[9px] text-slate-600">Entry gate surveillance</p>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-[#03080c]">
              <div className="text-center">
                <Camera className="mx-auto h-8 w-8 text-slate-700" />
                <p className="mt-2 text-xs text-slate-600">Camera feed will be connected here</p>
                <p className="mt-1 text-[9px] text-slate-700">No camera source configured</p>
              </div>
            </div>
          </section>

          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#050b10]">
            <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-slate-800 px-4">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold">Mine Map</h2>
              </div>
              <div className="flex items-center gap-3 text-[9px] text-slate-500">
                <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500" />Checkpoint</span>
                <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />Worker coverage</span>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <MineMap helmets={helmets} selectedId={null} onSelectHelmet={() => undefined} />
            </div>
          </section>
        </section>
      </div>

      {alertHelmet && (
        <AlertDialog
          helmet={alertHelmet}
          onClose={() => setAlertHelmet(null)}
          onNeverStarted={() => undefined}
        />
      )}
    </div>
  );
}

