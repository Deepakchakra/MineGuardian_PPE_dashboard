"use client";

import Image from "next/image";
import {
  Activity,
  Bell,
  Cloud,
  Thermometer,
  Wifi,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useHelmetData } from "@/hooks/useHelmetData";

const MINE_MAP_IMAGE = "/mine-tunnel-map.jpeg";

type MotionPoint = {
  time: string;

  accel_x: number | null;
  accel_y: number | null;
  accel_z: number | null;

  gyro_x: number | null;
  gyro_y: number | null;
  gyro_z: number | null;
};

export default function Home() {
  const { data, loading, error, lastUpdated } =
    useHelmetData("helmet_01");

  const [motionHistory, setMotionHistory] = useState<MotionPoint[]>(
    []
  );

  /* ============================================================
     MOTION HISTORY
  ============================================================ */

  useEffect(() => {
    if (loading) return;

    const newPoint: MotionPoint = {
      time: new Date().toLocaleTimeString(),

      accel_x: data.mpu6050.accel_x,
      accel_y: data.mpu6050.accel_y,
      accel_z: data.mpu6050.accel_z,

      gyro_x: data.mpu6050.gyro_x,
      gyro_y: data.mpu6050.gyro_y,
      gyro_z: data.mpu6050.gyro_z,
    };

    setMotionHistory((previous) => {
      const updated = [...previous, newPoint];

      return updated.slice(-30);
    });
  }, [
    loading,
    data.mpu6050.accel_x,
    data.mpu6050.accel_y,
    data.mpu6050.accel_z,
    data.mpu6050.gyro_x,
    data.mpu6050.gyro_y,
    data.mpu6050.gyro_z,
  ]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#02070b] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-red-500" />

          <p className="text-sm text-slate-400">
            Connecting to MineGuardian...
          </p>
        </div>
      </main>
    );
  }

  /* ============================================================
     SENSOR VALUES
  ============================================================ */

  const temperature = data.temperature;
  const humidity = data.humidity;

  const mq2 = data.mq2?.raw;
  const mq7 = data.mq7?.raw;

  const vibration =
    data.mpu6050?.acceleration_magnitude;

  const motionStatus =
    data.mpu6050?.motion_status;

  const temperatureDanger =
    temperature !== null &&
    temperature >= 38;

  const gasDanger =
    data.gas_status === "DANGER" ||
    data.mq2?.status === "DANGER" ||
    data.mq7?.status === "DANGER";

  const motionDanger =
    motionStatus !== null &&
    motionStatus.toUpperCase() !== "NORMAL";

  const emergency =
    temperatureDanger ||
    gasDanger ||
    motionDanger;

  return (
    <main className="min-h-screen bg-[#02070b] text-white">

      <div className="min-h-screen">

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <section className="min-w-0">

          <div className="mx-auto w-full max-w-[1800px] space-y-4 p-3 sm:p-4 lg:p-5">

            {/* ==================================================
                SENSOR OVERVIEW
            ================================================== */}

            <div
              className={`min-w-0 rounded-lg border p-3 sm:p-4 ${
                emergency
                  ? "border-red-900/70 bg-[#071016]"
                  : "border-slate-800 bg-[#071016]"
              }`}
            >

              {/* SENSOR HEADER */}

              <div className="mb-3 flex items-center justify-between">

                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Live Sensor Overview
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Real-time helmet telemetry
                  </p>
                </div>

                <span
                  className={`flex items-center gap-1.5 text-[9px] font-semibold ${
                    emergency
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  <span
                    className={`h-2 w-2 animate-pulse rounded-full ${
                      emergency
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  />

                  {emergency ? "ALERT" : "LIVE"}
                </span>

              </div>

              {/* SENSOR CARDS */}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7">

                <SensorCard
                  icon={<Thermometer size={17} />}
                  title="Temperature"
                  value={
                    temperature !== null
                      ? `${temperature} °C`
                      : "--"
                  }
                  status={
                    temperatureDanger
                      ? "DANGER"
                      : "NORMAL"
                  }
                  danger={temperatureDanger}
                />

                <SensorCard
                  icon={<Cloud size={17} />}
                  title="Humidity"
                  value={
                    humidity !== null
                      ? `${humidity} %`
                      : "--"
                  }
                  status="NORMAL"
                />

                <SensorCard
                  icon={<Wind size={17} />}
                  title="MQ-2 Gas"
                  value={
                    mq2 !== null &&
                    mq2 !== undefined
                      ? `${mq2} PPM`
                      : "--"
                  }
                  status={
                    data.mq2?.status ?? "NORMAL"
                  }
                  danger={
                    data.mq2?.status === "DANGER"
                  }
                />

                <SensorCard
                  icon={<Cloud size={17} />}
                  title="MQ-7 Gas"
                  value={
                    mq7 !== null &&
                    mq7 !== undefined
                      ? `${mq7} PPM`
                      : "--"
                  }
                  status={
                    data.mq7?.status ?? "NORMAL"
                  }
                  danger={
                    data.mq7?.status === "DANGER"
                  }
                />

                <SensorCard
                  icon={<Activity size={17} />}
                  title="Vibration"
                  value={
                    vibration !== null &&
                    vibration !== undefined
                      ? `${vibration}`
                      : "--"
                  }
                  status={
                    motionDanger
                      ? "DANGER"
                      : "NORMAL"
                  }
                  danger={motionDanger}
                />

                <SensorCard
                  icon={<Wifi size={17} />}
                  title="Wi-Fi Signal"
                  value={
                    data.wifi_rssi !== null
                      ? `${data.wifi_rssi} dBm`
                      : "--"
                  }
                  status="GOOD"
                />

                <SensorCard
                  icon={<Activity size={17} />}
                  title="Motion Status"
                  value={
                    motionStatus ?? "--"
                  }
                  status={
                    motionStatus ?? "NORMAL"
                  }
                  danger={motionDanger}
                />

              </div>
            </div>

            {/* ==================================================
                MINE MAP + RIGHT PANEL
            ================================================== */}

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">

              {/* =================================================
                  MINE MAP
              ================================================= */}

              <MineMap />

              {/* =================================================
                  RIGHT PANEL
              ================================================= */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">

                {/* =================================================
                    HELMET ALERT COMMAND
                ================================================= */}

                <div className="rounded-lg border border-slate-800 bg-[#071016] p-4">

                  <h2 className="text-sm font-semibold text-white">
                    Helmet Alert Command
                  </h2>

                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-red-700 py-3 text-xs font-semibold text-white transition hover:bg-red-600">
                    <Bell size={15} />
                    ACTIVATE HELMET ALERT
                  </button>

                  <p className="mt-3 text-[10px] leading-4 text-slate-500">
                    Send an audible alert command to the selected
                    helmet.
                  </p>

                  <label className="mt-4 block text-[10px] text-slate-400">
                    Duration (Seconds)
                  </label>

                  <select className="mt-2 w-full rounded-md border border-slate-700 bg-[#0a131a] px-3 py-2 text-xs text-white outline-none focus:border-red-700">
                    <option>10 Seconds</option>
                    <option>20 Seconds</option>
                    <option>30 Seconds</option>
                  </select>

                  <label className="mt-4 block text-[10px] text-slate-400">
                    Message
                  </label>

                  <input
                    className="mt-2 w-full rounded-md border border-slate-700 bg-[#0a131a] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-red-700"
                    placeholder="Return to safe zone immediately."
                  />

                </div>

                {/* =================================================
                    HELMET INFORMATION
                ================================================= */}

                <div className="rounded-lg border border-slate-800 bg-[#071016] p-4">

                  <h2 className="text-sm font-semibold text-white">
                    Helmet Information
                  </h2>

                  <div className="mt-4 space-y-3 text-xs">

                    <InfoRow
                      label="Helmet ID"
                      value="HELMET-01"
                    />

                    <InfoRow
                      label="Status"
                      value="CONNECTED"
                      green
                    />

                    <InfoRow
                      label="Worker ID"
                      value="WORKER-07"
                    />

                    <InfoRow
                      label="Current Location"
                      value="Checkpoint 3"
                    />

                    <InfoRow
                      label="Uptime"
                      value={formatUptime(data.uptime)}
                    />

                    <InfoRow
                      label="Wi-Fi Signal"
                      value={
                        data.wifi_rssi !== null
                          ? `${data.wifi_rssi} dBm`
                          : "--"
                      }
                    />

                    <InfoRow
                      label="Last Update"
                      value={
                        lastUpdated
                          ? lastUpdated.toLocaleTimeString()
                          : "--"
                      }
                    />

                  </div>
                </div>

              </div>
            </div>

            {/* ==================================================
                MPU6050 GRAPHS
            ================================================== */}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

              <MotionGraph
                title="MPU6050 – Gyroscope"
                data={motionHistory}
                type="gyroscope"
              />

              <MotionGraph
                title="MPU6050 – Acceleration"
                data={motionHistory}
                type="acceleration"
              />

            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/30 p-3 text-xs text-red-400">
                Firebase Error: {error}
              </div>
            )}

          </div>
        </section>
      </div>
    </main>
  );
}

/* ==============================================================
   SENSOR CARD
============================================================== */

function SensorCard({
  icon,
  title,
  value,
  status,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  status: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-md border bg-[#0a141b] p-3 ${
        danger
          ? "border-red-900/70"
          : "border-slate-800"
      }`}
    >

      <div className="flex min-w-0 items-center gap-2 text-xs text-slate-300">

        <span
          className={`shrink-0 ${
            danger
              ? "text-red-400"
              : "text-slate-400"
          }`}
        >
          {icon}
        </span>

        <span className="truncate">
          {title}
        </span>

      </div>

      <p
        className={`mt-4 truncate text-lg font-bold ${
          danger
            ? "text-red-500"
            : "text-white"
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-2 truncate text-[9px] font-semibold ${
          danger
            ? "text-red-500"
            : "text-green-400"
        }`}
      >
        {status}
      </p>

    </div>
  );
}

/* ==============================================================
   INFO ROW
============================================================== */

function InfoRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800/70 pb-2">

      <span className="shrink-0 text-slate-500">
        {label}
      </span>

      <span
        className={`min-w-0 truncate text-right ${
          green
            ? "font-medium text-green-400"
            : "text-slate-200"
        }`}
      >
        {green && "● "}
        {value}
      </span>

    </div>
  );
}

/* ==============================================================
   MOTION GRAPH
============================================================== */

function MotionGraph({
  title,
  data,
  type,
}: {
  title: string;
  data: MotionPoint[];
  type: "acceleration" | "gyroscope";
}) {
  const isAcceleration =
    type === "acceleration";

  const latest =
    data[data.length - 1];

  return (
    <div className="min-w-0 rounded-lg border border-slate-800 bg-[#071016] p-4">

      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between gap-4">

        <div className="min-w-0">

          <h2 className="truncate text-sm font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-[10px] text-slate-500">
            Real-time sensor data
          </p>

        </div>

        <div className="flex shrink-0 items-center gap-2">

          <span className="flex items-center gap-1 text-[9px] font-semibold text-green-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            LIVE
          </span>

          <span className="rounded border border-slate-700 px-2 py-1 text-[9px] text-slate-400">
            {isAcceleration ? "g" : "°/s"}
          </span>

        </div>
      </div>

      {/* GRAPH */}

      <div className="h-[260px] w-full">

        {data.length < 2 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            Waiting for sensor readings...
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
              />

              <XAxis
                dataKey="time"
                tick={{
                  fill: "#64748b",
                  fontSize: 9,
                }}
                axisLine={{
                  stroke: "#334155",
                }}
                tickLine={false}
                minTickGap={25}
              />

              <YAxis
                tick={{
                  fill: "#64748b",
                  fontSize: 9,
                }}
                axisLine={{
                  stroke: "#334155",
                }}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#071016",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "11px",
                }}
                labelStyle={{
                  color: "#94a3b8",
                  marginBottom: "5px",
                }}
              />

              <Legend
                wrapperStyle={{
                  fontSize: "10px",
                  paddingTop: "8px",
                }}
              />

              {isAcceleration ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="accel_x"
                    name="X Axis"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls
                  />

                  <Line
                    type="monotone"
                    dataKey="accel_y"
                    name="Y Axis"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls
                  />

                  <Line
                    type="monotone"
                    dataKey="accel_z"
                    name="Z Axis"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="gyro_x"
                    name="X Axis"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls
                  />

                  <Line
                    type="monotone"
                    dataKey="gyro_y"
                    name="Y Axis"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls
                  />

                  <Line
                    type="monotone"
                    dataKey="gyro_z"
                    name="Z Axis"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls
                  />
                </>
              )}

            </LineChart>
          </ResponsiveContainer>
        )}

      </div>

      {/* CURRENT VALUES */}

      <div className="mt-4 grid grid-cols-3 gap-2">

        {isAcceleration ? (
          <>
            <CurrentValue
              label="X"
              value={latest?.accel_x}
            />

            <CurrentValue
              label="Y"
              value={latest?.accel_y}
            />

            <CurrentValue
              label="Z"
              value={latest?.accel_z}
            />
          </>
        ) : (
          <>
            <CurrentValue
              label="X"
              value={latest?.gyro_x}
            />

            <CurrentValue
              label="Y"
              value={latest?.gyro_y}
            />

            <CurrentValue
              label="Z"
              value={latest?.gyro_z}
            />
          </>
        )}

      </div>
    </div>
  );
}

/* ==============================================================
   CURRENT VALUE
============================================================== */

function CurrentValue({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  return (
    <div className="rounded-md border border-slate-800 bg-[#0a141b] p-2">

      <p className="text-[9px] text-slate-500">
        {label} AXIS
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
        {typeof value === "number"
          ? value.toFixed(2)
          : "--"}
      </p>

    </div>
  );
}

/* ==============================================================
   MINE MAP
============================================================== */

function MineMap() {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-slate-800 bg-black sm:min-h-[500px] xl:min-h-[620px]">

      {/* IMAGE */}

      <Image
        src={MINE_MAP_IMAGE}
        alt="3D Mine Tunnel Network"
        fill
        priority
        className="object-contain"
        sizes="(max-width: 1280px) 100vw, calc(100vw - 360px)"
      />

      {/* SUBTLE OVERLAY */}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

      {/* TITLE */}

      <div className="absolute left-3 top-3 z-10 rounded-md border border-slate-700 bg-black/75 px-3 py-2 text-xs font-semibold backdrop-blur sm:left-4 sm:top-4 sm:text-sm">
        3D Mine Map – Real Time View
      </div>

      {/* LEGEND */}

      <div className="absolute right-3 top-3 z-10 hidden flex-wrap justify-end gap-2 rounded-md border border-slate-700 bg-black/75 px-3 py-2 text-[9px] backdrop-blur sm:flex sm:right-4 sm:top-4">

        <span className="text-green-400">
          ● Online
        </span>

        <span className="text-red-400">
          ● Alert
        </span>

        <span className="text-blue-400">
          ● Checkpoint
        </span>

        <span className="text-slate-400">
          ● Offline
        </span>

      </div>

      {/* MOBILE LEGEND */}

      <div className="absolute bottom-3 right-3 z-10 flex gap-2 rounded-md border border-slate-700 bg-black/75 px-2 py-1.5 text-[8px] backdrop-blur sm:hidden">

        <span className="text-green-400">
          ● Online
        </span>

        <span className="text-red-400">
          ● Alert
        </span>

      </div>

      {/* 3D INDICATOR */}

      <div className="absolute bottom-4 left-4 z-10 rounded-md border border-slate-700 bg-black/80 px-3 py-2 text-xs font-semibold">
        3D
      </div>

    </div>
  );
}

/* ==============================================================
   FORMAT UPTIME
============================================================== */

function formatUptime(seconds: number | null) {
  if (seconds === null) return "--";

  const h = Math.floor(seconds / 3600);

  const m = Math.floor(
    (seconds % 3600) / 60
  );

  const s = seconds % 60;

  return `${String(h).padStart(2, "0")}:${String(
    m
  ).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}