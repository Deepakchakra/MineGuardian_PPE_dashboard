"use client";

import { useEffect, useRef } from "react";
import { push, ref, set } from "firebase/database";
import { database } from "@/lib/firebase/config";
import type { HelmetData } from "@/hooks/useHelmetData";

export type SafetyAlertType = "HEAT" | "GAS" | "FALL";

function getEvents(helmet: HelmetData) {
  const events: Array<{ type: SafetyAlertType; value: string; severity: "CRITICAL" | "WARNING" }> = [];
  if (helmet.temperature !== null && helmet.temperature >= 38) events.push({ type: "HEAT", value: `${helmet.temperature} °C`, severity: "CRITICAL" });
  const gasDanger = [helmet.gas_status, helmet.mq2.status, helmet.mq7.status].some(v => (v || "").toUpperCase() === "DANGER");
  if (gasDanger) events.push({ type: "GAS", value: helmet.gas_raw !== null ? String(helmet.gas_raw) : "DANGER", severity: "CRITICAL" });
  if ((helmet.mpu6050.motion_status || "").toUpperCase().includes("FALL")) events.push({ type: "FALL", value: helmet.mpu6050.motion_status || "FALL", severity: "CRITICAL" });
  return events;
}

export function useSafetyAlertRecorder(helmets: HelmetData[]) {
  const previous = useRef(new Set<string>());
  useEffect(() => {
    const current = new Set<string>();
    const now = new Date();
    helmets.forEach((helmet) => {
      getEvents(helmet).forEach((event) => {
        const signature = `${helmet.helmetId}|${event.type}|${event.value}`;
        current.add(signature);
        if (previous.current.has(signature)) return;
        const alertRef = push(ref(database, "/MineGuardian/alerts"));
        void set(alertRef, {
          helmetId: helmet.helmetId,
          workerId: helmet.workerId,
          workerName: helmet.workerName,
          alertType: event.type,
          alertLabel: event.type === "GAS" ? "Gas Danger" : event.type === "FALL" ? "Fall Detected" : "Heat Danger",
          value: event.value,
          severity: event.severity,
          checkpoint: helmet.checkpoint.where,
          rfidTime: helmet.checkpoint.time,
          date: now.toLocaleDateString("en-IN"),
          time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          createdAt: Date.now(),
        });
      });
    });
    previous.current = current;
  }, [helmets]);
}
