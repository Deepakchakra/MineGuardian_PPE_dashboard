"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Gauge, Maximize2, Thermometer, Wifi, X } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HelmetData } from "@/hooks/useHelmetData";

function value(v: number | null, unit = "") {
  return v === null ? "N/A" : `${v}${unit}`;
}

function SensorCard({
  title,
  valueText,
  status,
  icon,
}: {
  title: string;
  valueText: string;
  status?: string | null;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#071118] p-3">
      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-white">{valueText}</p>
      {status && (
        <p className="mt-1 text-[9px] uppercase tracking-wide text-slate-500">
          {status}
        </p>
      )}
    </div>
  );
}

function CurrentAxisValues({
  values,
}: {
  values: [number | null, number | null, number | null];
  expanded?: boolean;
  onExpand?: () => void;
}) {
  const axes = [
    { label: "X", value: values[0], className: "text-red-400", dot: "bg-red-400" },
    { label: "Y", value: values[1], className: "text-blue-400", dot: "bg-blue-400" },
    { label: "Z", value: values[2], className: "text-green-400", dot: "bg-green-400" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {axes.map((axis) => (
        <div key={axis.label} className="flex items-center gap-1.5 text-[10px]">
          <span className={`h-1.5 w-1.5 rounded-full ${axis.dot}`} />
          <span className={axis.className}>{axis.label}</span>
          <span className="font-semibold text-white">
            {axis.value === null ? "N/A" : axis.value.toFixed(3)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ScalarChart({
  title,
  unit,
  current,
  data,
  stroke,
  yDomain,
  referenceLines,
  expanded = false,
  onExpand,
}: {
  title: string;
  unit: string;
  current: number | null;
  data: { timestamp: number; value: number | null }[];
  stroke: string;
  yDomain?: [number, number];
  referenceLines?: { value: number; stroke: string; label: string }[];
  expanded?: boolean;
  onExpand?: () => void;
}) {
  const hasData = data.some((point) => point.value !== null);

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-[#071118] p-3 ${onExpand ? "cursor-pointer transition-colors hover:border-slate-600" : ""}`}
      onClick={onExpand}
      role={onExpand ? "button" : undefined}
      tabIndex={onExpand ? 0 : undefined}
      onKeyDown={(event) => {
        if (onExpand && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onExpand();
        }
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-[9px] text-slate-600">Live trend</p>
        </div>
        <div className="flex items-start gap-2 text-right">
          <div>
            <p className="text-base font-semibold text-white">
            {current === null ? "N/A" : `${current}${unit}`}
            </p>
            <p className="text-[9px] text-slate-600">Current</p>
          </div>
          {onExpand && <Maximize2 className="mt-1 h-3.5 w-3.5 text-slate-600" />}
        </div>
      </div>

      <div className={`${expanded ? "h-[460px]" : "h-40"} w-full`}>
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-600">
            Waiting for live sensor data…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 2, bottom: 18 }}>
              <CartesianGrid stroke="#16232d" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tick={{ fill: "#64748b", fontSize: 8 }}
                axisLine={{ stroke: "#24333e" }}
                tickLine={false}
                minTickGap={30}
                interval="preserveStartEnd"
                tickFormatter={(timestamp) => new Date(Number(timestamp)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              />
              <YAxis
                domain={yDomain ?? ["auto", "auto"]}
                tick={{ fill: "#475569", fontSize: 8 }}
                axisLine={false}
                tickLine={false}
                width={50}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "#050b10",
                  border: "1px solid #1e293b",
                  borderRadius: 8,
                  fontSize: 10,
                }}
                labelStyle={{ color: "#94a3b8" }}
                labelFormatter={(timestamp) => new Date(Number(timestamp)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                formatter={(v) => [
                  v === null || v === undefined ? "N/A" : `${v}${unit}`,
                  title,
                ]}
              />
              {(referenceLines ?? []).map((line) => (
                <ReferenceLine key={`${title}-${line.value}`} y={line.value} stroke={line.stroke} strokeWidth={1.2} strokeDasharray="4 4" label={{ value: line.label, position: "insideTopRight", fill: line.stroke, fontSize: 8 }} />
              ))}
              <Line
                type="linear"
                dataKey="value"
                connectNulls
                stroke={stroke}
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function AxisChart({
  title,
  data,
  values,
  expanded = false,
  onExpand,
}: {
  title: string;
  data: { timestamp: number; x: number | null; y: number | null; z: number | null }[];
  values: [number | null, number | null, number | null];
  expanded?: boolean;
  onExpand?: () => void;
}) {
  const hasData = data.some(
    (point) => point.x !== null || point.y !== null || point.z !== null,
  );

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-[#071118] p-3 ${onExpand ? "cursor-pointer transition-colors hover:border-slate-600" : ""}`}
      onClick={onExpand}
      role={onExpand ? "button" : undefined}
      tabIndex={onExpand ? 0 : undefined}
      onKeyDown={(event) => {
        if (onExpand && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onExpand();
        }
      }}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {title}
          </p>
          <div className="mt-1 flex items-center gap-3 text-[9px]">
            <span className="text-red-400">● X</span>
            <span className="text-blue-400">● Y</span>
            <span className="text-green-400">● Z</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CurrentAxisValues values={values} />
          {onExpand && <Maximize2 className="h-3.5 w-3.5 text-slate-600" />}
        </div>
      </div>

      <div className={`${expanded ? "h-[460px]" : "h-52"} w-full`}>
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-600">
            Waiting for live sensor data…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 2, bottom: 18 }}>
              <CartesianGrid stroke="#16232d" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tick={{ fill: "#64748b", fontSize: 8 }}
                axisLine={{ stroke: "#24333e" }}
                tickLine={false}
                minTickGap={30}
                interval="preserveStartEnd"
                tickFormatter={(timestamp) => new Date(Number(timestamp)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              />
              <YAxis
                domain={title.toLowerCase().startsWith("accelerometer") ? [-20, 20] : [-30, 30]}
                ticks={title.toLowerCase().startsWith("accelerometer") ? [-20, -10, 0, 10, 20] : [-30, -15, 0, 15, 30]}
                tick={{ fill: "#475569", fontSize: 8 }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: "#050b10",
                  border: "1px solid #1e293b",
                  borderRadius: 8,
                  fontSize: 10,
                }}
                labelStyle={{ color: "#94a3b8" }}
                labelFormatter={(timestamp) => new Date(Number(timestamp)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                formatter={(v, name) => [
                  v === null || v === undefined ? "N/A" : Number(v).toFixed(3),
                  String(name).toUpperCase(),
                ]}
              />
              <Line
                type="linear"
                dataKey="x"
                name="X"
                connectNulls
                stroke="#f87171"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3.5 }}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="y"
                name="Y"
                connectNulls
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3.5 }}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="z"
                name="Z"
                connectNulls
                stroke="#4ade80"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3.5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default function HelmetSensorPanel({ helmet }: { helmet: HelmetData | null }) {
  const [history, setHistory] = useState<
    { timestamp: number; temperature: number | null; mq2: number | null; mq7: number | null; accelX: number | null; accelY: number | null; accelZ: number | null; gyroX: number | null; gyroY: number | null; gyroZ: number | null }[]
  >([]);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  useEffect(() => {
    if (!helmet) {
      setHistory([]);
      return;
    }

    const timestamp = Date.now();

    setHistory((previous) => {
      const sample = {
        timestamp,
        temperature: helmet.temperature,
        mq2: helmet.mq2.raw,
        mq7: helmet.mq7.raw,
        accelX: helmet.mpu6050.accel_x,
        accelY: helmet.mpu6050.accel_y,
        accelZ: helmet.mpu6050.accel_z,
        gyroX: helmet.mpu6050.gyro_x,
        gyroY: helmet.mpu6050.gyro_y,
        gyroZ: helmet.mpu6050.gyro_z,
      };

      // Firebase can update the complete helmet object several times
      // per second. Keep one chart sample per ~900 ms so duplicate
      // timestamps do not create artificial vertical jumps.
      const last = previous[previous.length - 1];
      if (last && timestamp - last.timestamp < 900) {
        return [...previous.slice(0, -1), sample];
      }

      return [...previous, sample].slice(-40);
    });
  }, [helmet]);

  const temperatureHistory = useMemo(
    () => history.map((point) => ({ timestamp: point.timestamp, value: point.temperature })),
    [history],
  );
  const mq2History = useMemo(
    () => history.map((point) => ({ timestamp: point.timestamp, value: point.mq2 })),
    [history],
  );
  const mq7History = useMemo(
    () => history.map((point) => ({ timestamp: point.timestamp, value: point.mq7 })),
    [history],
  );
  const accelerometerHistory = useMemo(
    () => history.map((point) => ({ timestamp: point.timestamp, x: point.accelX, y: point.accelY, z: point.accelZ })),
    [history],
  );
  const gyroscopeHistory = useMemo(
    () => history.map((point) => ({ timestamp: point.timestamp, x: point.gyroX, y: point.gyroY, z: point.gyroZ })),
    [history],
  );

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

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        <SensorCard title="Temperature" valueText={value(helmet.temperature, " °C")} icon={<Thermometer className="h-3.5 w-3.5" />} />
        <SensorCard title="Humidity" valueText={value(helmet.humidity, " %")} icon={<Gauge className="h-3.5 w-3.5" />} />
        <SensorCard title="Methane" valueText={value(helmet.mq2.raw, " PPM")} status={helmet.mq2.status} icon={<span className="text-[9px] font-bold">CH4</span>} />
        <SensorCard title="Carbon Monoxide" valueText={value(helmet.mq7.raw, " PPM")} status={helmet.mq7.status} icon={<span className="text-[9px] font-bold">CO</span>} />
        <SensorCard title="Wi-Fi Signal" valueText={value(helmet.wifi_rssi, " dBm")} icon={<Wifi className="h-3.5 w-3.5" />} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <ScalarChart
          title="Temperature"
          unit=" °C"
          current={helmet.temperature}
          data={temperatureHistory}
          stroke="#f59e0b"
          yDomain={[0, 100]}
          referenceLines={[
            { value: 40, stroke: "#4ade80", label: "40 °C" },
            { value: 60, stroke: "#facc15", label: "60 °C" },
            { value: 80, stroke: "#ef4444", label: "80 °C" },
          ]}
          onExpand={() => setExpandedChart("temperature")}
        />
        <ScalarChart title="Methane" unit=" PPM" current={helmet.mq2.raw} data={mq2History} stroke="#ef4444" yDomain={[0, 1100]} referenceLines={[{ value: 150, stroke: "#4ade80", label: "150 PPM" }, { value: 200, stroke: "#facc15", label: "200 PPM" }, { value: 1000, stroke: "#ef4444", label: "1000 PPM" }]} onExpand={() => setExpandedChart("methane")} />
        <ScalarChart title="Carbon Monoxide" unit=" PPM" current={helmet.mq7.raw} data={mq7History} stroke="#38bdf8" yDomain={[0, 600]} referenceLines={[{ value: 80, stroke: "#4ade80", label: "80 PPM" }, { value: 100, stroke: "#facc15", label: "100 PPM" }, { value: 500, stroke: "#ef4444", label: "500 PPM" }]} onExpand={() => setExpandedChart("co")} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        <AxisChart
          title="Accelerometer — X / Y / Z"
          data={accelerometerHistory}
          values={[helmet.mpu6050.accel_x, helmet.mpu6050.accel_y, helmet.mpu6050.accel_z]}
          onExpand={() => setExpandedChart("accelerometer")}
        />
        <AxisChart
          title="Gyroscope — X / Y / Z"
          data={gyroscopeHistory}
          values={[helmet.mpu6050.gyro_x, helmet.mpu6050.gyro_y, helmet.mpu6050.gyro_z]}
          onExpand={() => setExpandedChart("gyroscope")}
        />
      </div>

      {expandedChart && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setExpandedChart(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded sensor graph"
        >
          <div
            className="relative w-full max-w-6xl rounded-2xl border border-slate-700 bg-[#050b10] p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setExpandedChart(null)}
              className="absolute right-4 top-4 z-10 rounded-lg border border-slate-700 bg-[#071118] p-2 text-slate-400 transition hover:border-slate-500 hover:text-white"
              aria-label="Close expanded graph"
            >
              <X className="h-4 w-4" />
            </button>

            {expandedChart === "temperature" && (
              <ScalarChart
                title="Temperature"
                unit=" °C"
                current={helmet.temperature}
                data={temperatureHistory}
                stroke="#f59e0b"
                yDomain={[0, 100]}
                referenceLines={[
                  { value: 40, stroke: "#4ade80", label: "40 °C" },
                  { value: 60, stroke: "#facc15", label: "60 °C" },
                  { value: 80, stroke: "#ef4444", label: "80 °C" },
                ]}
                expanded
              />
            )}
            {expandedChart === "methane" && (
              <ScalarChart
                title="Methane"
                unit=" PPM"
                current={helmet.mq2.raw}
                data={mq2History}
                stroke="#ef4444"
                yDomain={[0, 1100]}
                referenceLines={[
                  { value: 150, stroke: "#4ade80", label: "150 PPM" },
                  { value: 200, stroke: "#facc15", label: "200 PPM" },
                  { value: 1000, stroke: "#ef4444", label: "1000 PPM" },
                ]}
                expanded
              />
            )}
            {expandedChart === "co" && (
              <ScalarChart
                title="Carbon Monoxide"
                unit=" PPM"
                current={helmet.mq7.raw}
                data={mq7History}
                stroke="#38bdf8"
                yDomain={[0, 600]}
                referenceLines={[
                  { value: 80, stroke: "#4ade80", label: "80 PPM" },
                  { value: 100, stroke: "#facc15", label: "100 PPM" },
                  { value: 500, stroke: "#ef4444", label: "500 PPM" },
                ]}
                expanded
              />
            )}
            {expandedChart === "accelerometer" && (
              <AxisChart
                title="Accelerometer — X / Y / Z"
                data={accelerometerHistory}
                values={[helmet.mpu6050.accel_x, helmet.mpu6050.accel_y, helmet.mpu6050.accel_z]}
                expanded
              />
            )}
            {expandedChart === "gyroscope" && (
              <AxisChart
                title="Gyroscope — X / Y / Z"
                data={gyroscopeHistory}
                values={[helmet.mpu6050.gyro_x, helmet.mpu6050.gyro_y, helmet.mpu6050.gyro_z]}
                expanded
              />
            )}
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <SensorCard title="Acceleration Magnitude" valueText={value(helmet.mpu6050.acceleration_magnitude)} icon={<span className="text-[9px] font-bold">ACC</span>} />
        <SensorCard title="Rotation Magnitude" valueText={value(helmet.mpu6050.rotation_magnitude)} icon={<span className="text-[9px] font-bold">ROT</span>} />
        <SensorCard title="Uptime" valueText={value(helmet.uptime, " s")} icon={<span className="text-[9px] font-bold">UP</span>} />
      </div>
    </section>
  );
}
