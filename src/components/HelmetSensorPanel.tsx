"use client";

import type { ReactNode } from "react";
import { Battery, Gauge, Thermometer, Wifi } from "lucide-react";
import type { HelmetData } from "@/hooks/useHelmetData";

function value(v: number | null, unit = "") {
  return v === null ? "N/A" : `${v}${unit}`;
}

function SensorCard({ title, valueText, status, icon }: { title: string; valueText: string; status?: string | null; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#071118] p-3">
      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-white">{valueText}</p>
      {status && <p className="mt-1 text-[9px] uppercase tracking-wide text-slate-500">{status}</p>}
    </div>
  );
}

function AxisCard({ title, values }: { title: string; values: [number | null, number | null, number | null] }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#071118] p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{title}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[['X', values[0]], ['Y', values[1]], ['Z', values[2]]].map(([axis, v]) => (
          <div key={axis as string} className="rounded-md border border-slate-800/80 bg-[#050b10] p-2">
            <p className="text-[9px] text-slate-600">{axis as string}</p>
            <p className="mt-1 text-xs font-semibold text-white">{v === null ? "N/A" : Number(v).toFixed(3)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HelmetSensorPanel({ helmet }: { helmet: HelmetData | null }) {
  if (!helmet) {
    return (
      <section className="rounded-xl border border-slate-800 bg-[#050b10] p-5 text-center text-xs text-slate-500">
        Select a helmet to view its live sensor data.
      </section>
    );
  }

  const id = helmet.helmetId.replace("_", "-").toUpperCase();

  return (
    <section className="rounded-xl border border-slate-800 bg-[#050b10] p-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-slate-600">Live sensor data</p>
          <h2 className="mt-1 text-base font-semibold text-white">{id}</h2>
          <p className="mt-1 text-[10px] text-slate-500">Worker: {helmet.workerName || helmet.workerId || "N/A"}</p>
        </div>
        <div className="text-right text-[9px] text-slate-500">
          <p>Last RFID checkpoint: <span className="text-slate-300">{helmet.checkpoint.where || "N/A"}</span></p>
          <p className="mt-1">RFID time: <span className="text-slate-300">{helmet.checkpoint.time || "N/A"}</span></p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <SensorCard title="Temperature" valueText={value(helmet.temperature, " °C")} icon={<Thermometer className="h-3.5 w-3.5" />} />
        <SensorCard title="Humidity" valueText={value(helmet.humidity, " %")} icon={<Gauge className="h-3.5 w-3.5" />} />
        <SensorCard title="MQ-2 Gas" valueText={value(helmet.mq2.raw)} status={helmet.mq2.status} icon={<span className="text-[9px] font-bold">MQ2</span>} />
        <SensorCard title="MQ-7 Gas" valueText={value(helmet.mq7.raw)} status={helmet.mq7.status} icon={<span className="text-[9px] font-bold">MQ7</span>} />
        <SensorCard title="Battery" valueText={value(helmet.battery, " %")} icon={<Battery className="h-3.5 w-3.5" />} />
        <SensorCard title="Wi-Fi Signal" valueText={value(helmet.wifi_rssi, " dBm")} icon={<Wifi className="h-3.5 w-3.5" />} />
        <SensorCard title="Vibration" valueText={value(helmet.vibration)} status={helmet.mpu6050.motion_status} icon={<span className="text-[9px] font-bold">VIB</span>} />
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <AxisCard title="Accelerometer" values={[helmet.mpu6050.accel_x, helmet.mpu6050.accel_y, helmet.mpu6050.accel_z]} />
        <AxisCard title="Gyroscope" values={[helmet.mpu6050.gyro_x, helmet.mpu6050.gyro_y, helmet.mpu6050.gyro_z]} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        <SensorCard title="Acceleration Magnitude" valueText={value(helmet.mpu6050.acceleration_magnitude)} icon={<span className="text-[9px] font-bold">ACC</span>} />
        <SensorCard title="Rotation Magnitude" valueText={value(helmet.mpu6050.rotation_magnitude)} icon={<span className="text-[9px] font-bold">ROT</span>} />
        <SensorCard title="MPU Temperature" valueText={value(helmet.mpu6050.temperature, " °C")} icon={<Thermometer className="h-3.5 w-3.5" />} />
        <SensorCard title="Uptime" valueText={value(helmet.uptime, " s")} icon={<span className="text-[9px] font-bold">UP</span>} />
      </div>
    </section>
  );
}
