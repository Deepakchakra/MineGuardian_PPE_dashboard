"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Billboard,
  Center,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

import type { HelmetData } from "@/hooks/useHelmetData";

type Checkpoint = {
  id: string;
  name: string;
  position: [number, number, number];
};

/* ============================================================
   CHECKPOINT LOCATIONS
   ============================================================ */

const CHECKPOINTS: Checkpoint[] = [
  {
    id: "01",
    name: "CHECKPOINT 1",
    position: [0, -0.85, 42],
  },
  {
    id: "02",
    name: "CHECKPOINT 2",
    position: [-4.8, -4.65, 0.5],
  },
  {
    id: "03",
    name: "CHECKPOINT 3",
    position: [4.8, -5.15, -7.5],
  },
  {
    id: "04",
    name: "CHECKPOINT 4",
    position: [-17, -5.35, -7],
  },
  {
    id: "05",
    name: "CHECKPOINT 5",
    position: [0, -7.15, -34],
  },
];

/* ============================================================
   HELMET MARKER COLORS
   ============================================================ */

const HELMET_MARKER_COLORS = [
  {
    color: "#ef4444",
    glow: "rgba(239,68,68,0.85)",
  },
  {
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.85)",
  },
  {
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.85)",
  },
  {
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.85)",
  },
  {
    color: "#34d399",
    glow: "rgba(52,211,153,0.85)",
  },
  {
    color: "#f472b6",
    glow: "rgba(244,114,182,0.85)",
  },
  {
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.85)",
  },
  {
    color: "#fb923c",
    glow: "rgba(251,146,60,0.85)",
  },
] as const;

function getHelmetMarkerColor(helmetId: string) {
  const match = helmetId.match(/\d+/);
  const number = match ? Number(match[0]) : 1;
  return HELMET_MARKER_COLORS[(Math.max(1, number) - 1) % HELMET_MARKER_COLORS.length];
}

/* ============================================================
   CHECKPOINT MARKER
   ============================================================ */

function CheckpointMarker({
  checkpoint,
}: {
  checkpoint: Checkpoint;
}) {
  return (
    <group position={checkpoint.position}>
      {/* Floor glow */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
      >
        <circleGeometry args={[0.65, 32]} />

        <meshBasicMaterial
          color="#1683ff"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floor ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.08, 0]}
      >
        <ringGeometry args={[0.38, 0.52, 32]} />

        <meshBasicMaterial
          color="#1683ff"
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry
          args={[0.045, 0.055, 1.1, 16]}
        />

        <meshStandardMaterial
          color="#1683ff"
          emissive="#0066ff"
          emissiveIntensity={2}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Beacon */}
      <mesh position={[0, 1.12, 0]}>
        <sphereGeometry args={[0.15, 20, 20]} />

        <meshStandardMaterial
          color="#1683ff"
          emissive="#0066ff"
          emissiveIntensity={5}
          metalness={0.2}
          roughness={0.2}
        />
      </mesh>

      {/* Beacon light */}
      <pointLight
        position={[0, 1.12, 0]}
        color="#1683ff"
        intensity={1.5}
        distance={4}
        decay={2}
      />

      {/* Label */}
      <Billboard
        follow
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Html
          center
          position={[0, 1.65, 0]}
          distanceFactor={8}
          transform
          sprite
        >
          <div className="pointer-events-none flex flex-col items-center">
            <div
              className="
                flex h-8 w-8
                items-center justify-center
                rounded-full
                border-2 border-white
                bg-blue-600
                text-[10px]
                font-bold
                text-white
                shadow-[0_0_18px_rgba(0,102,255,0.9)]
              "
            >
              {checkpoint.id}
            </div>

            <div
              className="
                mt-1
                whitespace-nowrap
                rounded-md
                border border-blue-400/40
                bg-black/90
                px-2 py-1
                text-[8px]
                font-bold
                tracking-wider
                text-blue-100
                shadow-lg
              "
            >
              {checkpoint.name}
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

/* ============================================================
   WORKER MARKER
   ============================================================ */

function WorkerMarker({
  helmet,
  helmets,
  selected,
  onSelect,
}: {
  helmet: HelmetData;
  helmets: HelmetData[];
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const where =
    helmet.checkpoint?.where?.trim().toUpperCase() ?? "";

  const checkpointNumber = where.match(/\d+/)?.[0];

  if (!checkpointNumber) {
    return null;
  }

  const currentIndex = Number(checkpointNumber) - 1;

  if (
    currentIndex < 0 ||
    currentIndex >= CHECKPOINTS.length
  ) {
    return null;
  }

  const current = CHECKPOINTS[currentIndex];

  const next =
    CHECKPOINTS[currentIndex + 1] ?? null;

  /*
   * Base position = midpoint between the last RFID checkpoint and
   * the next checkpoint. When multiple helmets are on the same
   * checkpoint-to-checkpoint segment, do NOT place them at exactly
   * the same coordinates. Instead, spread them into parallel lanes
   * beside the route using a stable offset derived from helmet ID.
   */
  const segmentKey = `${current.id}-${next?.id ?? current.id}`;

  const helmetsOnSameSegment = helmets
    .filter((item) => {
      const itemWhere = item.checkpoint?.where?.trim().toUpperCase() ?? "";
      const itemNumber = itemWhere.match(/\d+/)?.[0];

      if (!itemNumber) return false;

      const itemIndex = Number(itemNumber) - 1;
      if (itemIndex < 0 || itemIndex >= CHECKPOINTS.length) return false;

      const itemNext = CHECKPOINTS[itemIndex + 1] ?? null;
      const itemSegmentKey = `${CHECKPOINTS[itemIndex].id}-${itemNext?.id ?? CHECKPOINTS[itemIndex].id}`;

      return itemSegmentKey === segmentKey;
    })
    .sort((a, b) => {
      const aNumber = Number(a.helmetId.match(/\d+/)?.[0] ?? 0);
      const bNumber = Number(b.helmetId.match(/\d+/)?.[0] ?? 0);

      if (aNumber !== bNumber) return aNumber - bNumber;
      return a.helmetId.localeCompare(b.helmetId);
    });

  const laneIndex = Math.max(
    0,
    helmetsOnSameSegment.findIndex(
      (item) => item.helmetId === helmet.helmetId,
    ),
  );

  /*
   * Center the helmets around the route:
   *   1 helmet  -> 0
   *   2 helmets -> -0.7, +0.7
   *   3 helmets -> -1.4, 0, +1.4
   *   4 helmets -> -2.1, -0.7, +0.7, +2.1
   *
   * This keeps helmets close to their real route while preventing
   * markers from visually overwriting each other.
   */
  const laneSpacing = 1.4;
  const centeredLane = laneIndex - (helmetsOnSameSegment.length - 1) / 2;
  const lateralOffset = centeredLane * laneSpacing;

  const basePosition: [number, number, number] = next
    ? [
        (current.position[0] + next.position[0]) / 2,
        (current.position[1] + next.position[1]) / 2 + 0.4,
        (current.position[2] + next.position[2]) / 2,
      ]
    : [
        current.position[0],
        current.position[1] + 0.4,
        current.position[2],
      ];

  /*
   * Calculate a perpendicular direction in the X/Z plane so the
   * offset moves markers beside the mine route rather than along it.
   */
  let position: [number, number, number] = basePosition;

  if (next) {
    const dx = next.position[0] - current.position[0];
    const dz = next.position[2] - current.position[2];
    const length = Math.hypot(dx, dz);

    if (length > 0.001) {
      const perpendicularX = -dz / length;
      const perpendicularZ = dx / length;

      position = [
        basePosition[0] + perpendicularX * lateralOffset,
        basePosition[1],
        basePosition[2] + perpendicularZ * lateralOffset,
      ];
    }
  }

  /*
   * Keep HELMET-01 red, while every additional RFID helmet receives
   * its own stable color based on its helmet number.
   */
  const marker = getHelmetMarkerColor(helmet.helmetId);

  return (
    <group position={position}>
      {/* Worker beacon */}
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(helmet.helmetId);
        }}
      >
        <sphereGeometry args={[0.25, 20, 20]} />

        <meshStandardMaterial
          color={marker.color}
          emissive={marker.color}
          emissiveIntensity={selected ? 5 : 3}
        />
      </mesh>

      {/* Worker light */}
      <pointLight
        color={marker.color}
        intensity={selected ? 2 : 1}
        distance={4}
        decay={2}
      />

      {/* Worker label */}
      <Billboard
        follow
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Html
          center
          position={[0, 0.7, 0]}
          distanceFactor={8}
          transform
          sprite
        >
          <div className="pointer-events-none flex flex-col items-center">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[9px] font-bold text-white"
              style={{
                borderColor: selected ? "#ffffff" : marker.color,
                backgroundColor: marker.color,
                boxShadow: `0 0 18px ${marker.glow}`,
              }}
            >
              ●
            </div>

            <div
              className="
                mt-1
                whitespace-nowrap
                rounded
                bg-black/90
                px-1.5 py-0.5
                text-[8px]
                font-semibold
                text-white
              "
            >
              {helmet.helmetId
                .replace("_", "-")
                .toUpperCase()}
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

/* ============================================================
   MINE MODEL
   ============================================================ */

function MineModel() {
  const { scene } = useGLTF("/3d/mine.glb");

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
}

/* ============================================================
   MINE SCENE
   ============================================================ */

function MineScene({
  helmets,
  selectedId,
  onSelectHelmet,
}: {
  helmets: HelmetData[];
  selectedId: string | null;
  onSelectHelmet: (id: string) => void;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={1.15} />

      <directionalLight
        position={[20, 30, 15]}
        intensity={1.8}
        castShadow
      />

      <pointLight
        position={[0, 5, 0]}
        intensity={2}
        distance={100}
        decay={2}
      />

      {/* Mine + checkpoints + workers */}
      <Center>
        <group>
          {/* Mine */}
          <Suspense fallback={null}>
            <MineModel />
          </Suspense>

          {/* Checkpoints */}
          {CHECKPOINTS.map((checkpoint) => (
            <CheckpointMarker
              key={checkpoint.id}
              checkpoint={checkpoint}
            />
          ))}

          {/* Workers / RFID helmet positions */}
          {helmets.map((helmet) => (
            <WorkerMarker
              key={helmet.helmetId}
              helmet={helmet}
              helmets={helmets}
              selected={helmet.helmetId === selectedId}
              onSelect={onSelectHelmet}
            />
          ))}
        </group>
      </Center>
    </>
  );
}

/* ============================================================
   MAIN VIEWER
   ============================================================ */

interface Mine3DViewerProps {
  helmets?: HelmetData[];
  selectedId?: string | null;
  onSelectHelmet?: (id: string) => void;
}

export default function Mine3DViewer({
  helmets = [],
  selectedId = null,
  onSelectHelmet = () => {},
}: Mine3DViewerProps) {
  return (
    <div className="h-full w-full bg-black">
      <Canvas
        shadows
        camera={{
          position: [105, 90, 115],
          fov: 45,
          near: 0.1,
          far: 5000,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <color
          attach="background"
          args={["#020609"]}
        />

        <MineScene
          helmets={helmets}
          selectedId={selectedId}
          onSelectHelmet={onSelectHelmet}
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          enablePan
          enableZoom
          rotateSpeed={0.7}
          zoomSpeed={0.8}
          minDistance={15}
          maxDistance={500}
          target={[0, -3, -20]}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/3d/mine.glb");