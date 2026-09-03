"use client";

import Image from "next/image";
import {
  Activity,
  Bell,
  ChevronDown,
  CircleAlert,
  Cloud,
  Gauge,
  HardHat,
  Home as HomeIcon,
  Map,
  Radio,
  Settings,
  ShieldAlert,
  Signal,
  Thermometer,
  User,
  Wifi,
  Wind,
  Zap,
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

  const [motionHistory, setMotionHistory] = useState<
    MotionPoint[]
  >([]);

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

      // Keep only the latest 30 readings
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

  const temperature = data.temperature;
  const humidity = data.humidity;
  const mq2 = data.mq2?.raw;
  const mq7 = data.mq7?.raw;

  const vibration = data.mpu6050?.acceleration_magnitude;
  const rotation = data.mpu6050?.rotation_magnitude;

  const motionStatus = data.mpu6050?.motion_status;

  const temperatureDanger =
    temperature !== null && temperature >= 38;

  const gasDanger =
    data.gas_status === "DANGER" ||
    data.mq2?.status === "DANGER" ||
    data.mq7?.status === "DANGER";

  const motionDanger =
    motionStatus !== null &&
    motionStatus.toUpperCase() !== "NORMAL";

  const emergency =
    temperatureDanger || gasDanger || motionDanger;

  return (
    <main className="min-h-screen bg-[#02070b] text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-[235px] shrink-0 border-r border-slate-800 bg-[#050b10] lg:block">

          {/* Logo */}
          <div className="flex h-[82px] items-center gap-3 border-b border-slate-800 px-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-600/40 bg-red-600/10">
              <ShieldAlert className="h-7 w-7 text-red-500" />
            </div>

            <div>
              <h1 className="text-[18px] font-bold">
                MineGuardian
              </h1>

              <p className="text-[11px] text-slate-500">
                Mining Safety System
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 p-3">

            <NavItem
              icon={<HomeIcon size={18} />}
              label="Dashboard"
              active
            />

            <NavItem
              icon={<Activity size={18} />}
              label="Live Monitoring"
            />

            <NavItem
              icon={<HardHat size={18} />}
              label="Helmets"
            />

            <NavItem
              icon={<CircleAlert size={18} />}
              label="Alerts"
              badge="3"
            />

            <NavItem
              icon={<Radio size={18} />}
              label="Commands"
            />

            <NavItem
              icon={<Activity size={18} />}
              label="History & Logs"
            />

            <NavItem
              icon={<Map size={18} />}
              label="Map View"
            />

            <NavItem
              icon={<Gauge size={18} />}
              label="Reports"
            />

            <NavItem
              icon={<Settings size={18} />}
              label="Settings"
            />
          </nav>

          {/* Helmet */}
          <div className="absolute bottom-4 left-3 right-auto w-[211px] rounded-lg border border-slate-800 bg-[#081118] p-4">

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                HELMET-01
              </span>

              <span className="flex items-center gap-1 text-[9px] text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                CONNECTED
              </span>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <HardHat className="h-20 w-20 text-slate-300" />
            </div>

            <div className="mt-4 space-y-4 text-xs">

              <div>
                <p className="text-slate-500">
                  Signal Strength
                </p>

                <p className="mt-1 font-medium">
                  {data.wifi_rssi ?? "--"} dBm
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Uptime
                </p>

                <p className="mt-1 font-medium">
                  {formatUptime(data.uptime)}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Worker ID
                </p>

                <p className="mt-1 font-medium">
                  WORKER-07
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Location
                </p>

                <p className="mt-1 font-medium">
                  Checkpoint 3
                </p>
              </div>

            </div>
          </div>
        </aside>

        {/* MAIN */}
        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="flex h-[72px] items-center justify-between border-b border-slate-800 bg-[#050b10] px-5">

            <div className="flex items-center gap-3">

              <div
                className={`flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold ${
                  emergency
                    ? "border-red-900/70 bg-red-950/40 text-red-400"
                    : "border-green-900/50 bg-green-950/20 text-green-400"
                }`}
              >
                <CircleAlert size={15} />

                {emergency
                  ? "EMERGENCY"
                  : "SYSTEM NORMAL"}
              </div>

              <span className="hidden text-xs text-slate-400 md:block">
                {emergency
                  ? "Possible safety condition detected"
                  : "All monitored systems operating normally"}
              </span>

            </div>

            <div className="flex items-center gap-5">

              <div className="hidden text-right md:block">
                <p className="text-sm font-medium">
                  {new Date().toLocaleTimeString()}
                </p>

                <p className="text-[10px] text-slate-500">
                  {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="relative">
                <Bell size={19} className="text-slate-300" />

                {emergency && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px]">
                    3
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800">
                  <User size={16} />
                </div>

                <div className="hidden sm:block">
                  <p className="text-xs">
                    Operator
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Control Room
                  </p>
                </div>

                <ChevronDown size={14} />
              </div>

            </div>
          </header>

          <div className="space-y-4 p-4">

            {/* TOP GRID */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[216px_1fr]">

              {/* ALERT */}
              <div
                className={`rounded-lg border p-4 ${
                  emergency
                    ? "border-red-600 bg-red-950/20"
                    : "border-slate-800 bg-[#071016]"
                }`}
              >

                <h2
                  className={`text-sm font-bold ${
                    emergency
                      ? "text-red-500"
                      : "text-slate-200"
                  }`}
                >
                  {emergency
                    ? "EMERGENCY ALERT"
                    : "SYSTEM STATUS"}
                </h2>

                <div className="mt-5 flex justify-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full border ${
                      emergency
                        ? "border-red-500 bg-red-500/10"
                        : "border-green-500 bg-green-500/10"
                    }`}
                  >
                    <CircleAlert
                      className={
                        emergency
                          ? "text-red-500"
                          : "text-green-500"
                      }
                      size={34}
                    />
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-xs">

                  <div>
                    <span className="text-slate-500">
                      HELMET
                    </span>

                    <p className="mt-1">
                      HELMET-01
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500">
                      CONDITION
                    </span>

                    <p
                      className={`mt-1 ${
                        emergency
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {emergency
                        ? "POSSIBLE SAFETY EVENT"
                        : "NORMAL"}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500">
                      STATUS
                    </span>

                    <p
                      className={`mt-1 font-semibold ${
                        emergency
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {emergency
                        ? "CRITICAL"
                        : "NORMAL"}
                    </p>
                  </div>

                </div>

                <button className="mt-5 w-full rounded-md bg-red-700 py-3 text-xs font-semibold transition hover:bg-red-600">
                  ACTIVATE HELMET ALERT
                </button>

              </div>

              {/* SENSOR OVERVIEW */}
              <div className="min-w-0 rounded-lg border border-slate-800 bg-[#071016] p-3">

                <h2 className="mb-3 text-sm font-semibold">
                  Live Sensor Overview
                </h2>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-7">

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
                      mq2 !== null
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
                      mq7 !== null
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
                      vibration !== null
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

            </div>

            {/* MINE MAP + RIGHT PANEL */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">

              {/* MINE MAP */}
              <MineMap />

              {/* RIGHT PANEL */}
              <div className="space-y-4">

                {/* COMMAND */}
                <div className="rounded-lg border border-slate-800 bg-[#071016] p-4">

                  <h2 className="text-sm font-semibold">
                    Helmet Alert Command
                  </h2>

                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-red-700 py-3 text-xs font-semibold hover:bg-red-600">
                    <Bell size={15} />
                    ACTIVATE HELMET ALERT
                  </button>

                  <p className="mt-3 text-[10px] text-slate-500">
                    Send audible alert command to the helmet.
                  </p>

                  <label className="mt-4 block text-[10px] text-slate-400">
                    Duration (Seconds)
                  </label>

                  <select className="mt-2 w-full rounded-md border border-slate-700 bg-[#0a131a] px-3 py-2 text-xs outline-none">
                    <option>10 Seconds</option>
                    <option>20 Seconds</option>
                    <option>30 Seconds</option>
                  </select>

                  <label className="mt-4 block text-[10px] text-slate-400">
                    Message
                  </label>

                  <input
                    className="mt-2 w-full rounded-md border border-slate-700 bg-[#0a131a] px-3 py-2 text-xs outline-none"
                    placeholder="Return to safe zone immediately."
                  />

                </div>

                {/* HELMET INFO */}
                <div className="rounded-lg border border-slate-800 bg-[#071016] p-4">

                  <h2 className="text-sm font-semibold">
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

            {/* MPU SECTION */}
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

            {/* ERROR */}
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

/* ---------------- COMPONENTS ---------------- */

function NavItem({
  icon,
  label,
  active = false,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-3 text-sm ${
        active
          ? "border border-red-900/60 bg-red-950/30 text-red-400"
          : "text-slate-400 hover:bg-slate-900 hover:text-white"
      }`}
    >
      {icon}

      <span className="flex-1">
        {label}
      </span>

      {badge && (
        <span className="rounded-full bg-red-700 px-2 py-0.5 text-[9px] text-white">
          {badge}
        </span>
      )}
    </div>
  );
}

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
    <div className="min-w-0 rounded-md border border-slate-800 bg-[#0a141b] p-3">

      <div className="flex items-center gap-2 text-xs text-slate-300">
        {icon}
        <span className="truncate">
          {title}
        </span>
      </div>

      <p
        className={`mt-4 text-lg font-bold ${
          danger
            ? "text-red-500"
            : "text-white"
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-2 text-[9px] font-semibold ${
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
    <div className="flex items-center justify-between border-b border-slate-800/70 pb-2">

      <span className="text-slate-500">
        {label}
      </span>

      <span
        className={
          green
            ? "font-medium text-green-400"
            : "text-slate-200"
        }
      >
        {green && "● "}
        {value}
      </span>

    </div>
  );
}

function MotionGraph({
  title,
  data,
  type,
}: {
  title: string;
  data: MotionPoint[];
  type: "acceleration" | "gyroscope";
}) {
  const isAcceleration = type === "acceleration";

  return (
    <div className="rounded-lg border border-slate-800 bg-[#071016] p-4">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">

        <div>
          <h2 className="text-sm font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-[10px] text-slate-500">
            Real-time sensor data
          </p>
        </div>

        <div className="flex items-center gap-2">

          <span className="flex items-center gap-1 text-[9px] text-green-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            LIVE
          </span>

          <span className="rounded border border-slate-700 px-2 py-1 text-[9px] text-slate-400">
            {isAcceleration ? "g" : "°/s"}
          </span>

        </div>
      </div>

      {/* Graph */}
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
                    activeDot={{
                      r: 4,
                    }}
                    connectNulls
                  />

                  <Line
                    type="monotone"
                    dataKey="accel_y"
                    name="Y Axis"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                    }}
                    connectNulls
                  />

                  <Line
                    type="monotone"
                    dataKey="accel_z"
                    name="Z Axis"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                    }}
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
                    activeDot={{
                      r: 4,
                    }}
                    connectNulls
                  />

                  <Line
                    type="monotone"
                    dataKey="gyro_y"
                    name="Y Axis"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                    }}
                    connectNulls
                  />

                  <Line
                    type="monotone"
                    dataKey="gyro_z"
                    name="Z Axis"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                    }}
                    connectNulls
                  />
                </>
              )}

            </LineChart>
          </ResponsiveContainer>
        )}

      </div>

      {/* Current values */}
      <div className="mt-4 grid grid-cols-3 gap-2">

        {isAcceleration ? (
          <>
            <CurrentValue
              label="X"
              value={data[data.length - 1]?.accel_x}
            />

            <CurrentValue
              label="Y"
              value={data[data.length - 1]?.accel_y}
            />

            <CurrentValue
              label="Z"
              value={data[data.length - 1]?.accel_z}
            />
          </>
        ) : (
          <>
            <CurrentValue
              label="X"
              value={data[data.length - 1]?.gyro_x}
            />

            <CurrentValue
              label="Y"
              value={data[data.length - 1]?.gyro_y}
            />

            <CurrentValue
              label="Z"
              value={data[data.length - 1]?.gyro_z}
            />
          </>
        )}

      </div>

    </div>
  );
}

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

/* ---------------- MINE MAP ---------------- */

function MineMap() {
  return (
    <div className="relative min-h-[500px] overflow-hidden rounded-lg border border-slate-800 bg-black">

      {/* IMAGE */}
      <Image
        src={MINE_MAP_IMAGE}
        alt="3D Mine Tunnel Network"
        fill
        priority
        className="object-contain"
        sizes="(max-width: 1280px) 100vw, 75vw"
      />

      {/* TOP TITLE */}
      <div className="absolute left-4 top-3 z-10 rounded-md border border-slate-700 bg-black/70 px-3 py-2 text-sm font-semibold backdrop-blur">
        3D Mine Map – Real Time View
      </div>

      {/* LEGEND */}
      <div className="absolute right-4 top-3 z-10 flex gap-3 rounded-md border border-slate-700 bg-black/75 px-3 py-2 text-[9px] backdrop-blur">

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

      {/* 3D BUTTON */}
      <div className="absolute bottom-4 left-4 z-10 rounded-md border border-slate-700 bg-black/80 px-3 py-2 text-xs">
        3D
      </div>

    </div>
  );
}

function formatUptime(seconds: number | null) {
  if (seconds === null) return "--";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(
    2,
    "0"
  )}:${String(s).padStart(2, "0")}`;
}