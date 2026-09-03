"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase/config";

export interface HelmetData {
  temperature: number | null;
  humidity: number | null;

  gas_raw: number | null;
  gas_status: string | null;

  mq2: {
    raw: number | null;
    status: string | null;
  };

  mq7: {
    raw: number | null;
    status: string | null;
  };

  wifi_rssi: number | null;
  uptime: number | null;

  mpu6050: {
    accel_x: number | null;
    accel_y: number | null;
    accel_z: number | null;

    gyro_x: number | null;
    gyro_y: number | null;
    gyro_z: number | null;

    temperature: number | null;

    acceleration_magnitude: number | null;
    rotation_magnitude: number | null;

    motion_status: string | null;
  };
}

const defaultData: HelmetData = {
  temperature: null,
  humidity: null,

  gas_raw: null,
  gas_status: null,

  mq2: {
    raw: null,
    status: null,
  },

  mq7: {
    raw: null,
    status: null,
  },

  wifi_rssi: null,
  uptime: null,

  mpu6050: {
    accel_x: null,
    accel_y: null,
    accel_z: null,

    gyro_x: null,
    gyro_y: null,
    gyro_z: null,

    temperature: null,

    acceleration_magnitude: null,
    rotation_magnitude: null,

    motion_status: null,
  },
};

export function useHelmetData(helmetId = "helmet_01") {
  const [data, setData] = useState<HelmetData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const helmetRef = ref(
      database,
      `/MineGuardian/${helmetId}`
    );

    const unsubscribe = onValue(
      helmetRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setData(defaultData);
          setError("Helmet data not found.");
          setLoading(false);
          return;
        }

        const value = snapshot.val();

        setData({
          temperature:
            typeof value.temperature === "number"
              ? value.temperature
              : null,

          humidity:
            typeof value.humidity === "number"
              ? value.humidity
              : null,

          gas_raw:
            typeof value.gas_raw === "number"
              ? value.gas_raw
              : null,

          gas_status:
            typeof value.gas_status === "string"
              ? value.gas_status
              : null,

          mq2: {
            raw:
              typeof value.mq2?.raw === "number"
                ? value.mq2.raw
                : null,

            status:
              typeof value.mq2?.status === "string"
                ? value.mq2.status
                : null,
          },

          mq7: {
            raw:
              typeof value.mq7?.raw === "number"
                ? value.mq7.raw
                : null,

            status:
              typeof value.mq7?.status === "string"
                ? value.mq7.status
                : null,
          },

          wifi_rssi:
            typeof value.wifi_rssi === "number"
              ? value.wifi_rssi
              : null,

          uptime:
            typeof value.uptime === "number"
              ? value.uptime
              : null,

          mpu6050: {
            accel_x:
              typeof value.mpu6050?.accel_x === "number"
                ? value.mpu6050.accel_x
                : null,

            accel_y:
              typeof value.mpu6050?.accel_y === "number"
                ? value.mpu6050.accel_y
                : null,

            accel_z:
              typeof value.mpu6050?.accel_z === "number"
                ? value.mpu6050.accel_z
                : null,

            gyro_x:
              typeof value.mpu6050?.gyro_x === "number"
                ? value.mpu6050.gyro_x
                : null,

            gyro_y:
              typeof value.mpu6050?.gyro_y === "number"
                ? value.mpu6050.gyro_y
                : null,

            gyro_z:
              typeof value.mpu6050?.gyro_z === "number"
                ? value.mpu6050.gyro_z
                : null,

            temperature:
              typeof value.mpu6050?.temperature === "number"
                ? value.mpu6050.temperature
                : null,

            acceleration_magnitude:
              typeof value.mpu6050?.acceleration_magnitude === "number"
                ? value.mpu6050.acceleration_magnitude
                : null,

            rotation_magnitude:
              typeof value.mpu6050?.rotation_magnitude === "number"
                ? value.mpu6050.rotation_magnitude
                : null,

            motion_status:
              typeof value.mpu6050?.motion_status === "string"
                ? value.mpu6050.motion_status
                : null,
          },
        });

        setLastUpdated(new Date());
        setError(null);
        setLoading(false);
      },

      (firebaseError) => {
        console.error("Firebase error:", firebaseError);
        setError(firebaseError.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [helmetId]);

  return {
    data,
    loading,
    error,
    lastUpdated,
  };
}