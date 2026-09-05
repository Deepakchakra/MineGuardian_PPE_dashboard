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

import { CHECKPOINTS, findCheckpoint, getHelmetForwardPosition, type Checkpoint } from "@/lib/mineMap/checkpoints";

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
        <circleGeometry args={[1.35, 32]} />

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
        <ringGeometry args={[0.78, 1.02, 32]} />

        <meshBasicMaterial
          color="#1683ff"
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry
          args={[0.08, 0.095, 1.65, 16]}
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
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.30, 24, 24]} />

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
        position={[0, 1.65, 0]}
        color="#1683ff"
        intensity={1.5}
        distance={6}
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
          position={[0, 2.35, 0]}
          distanceFactor={6}
          transform
          sprite
        >
          <div className="pointer-events-none flex flex-col items-center">
            <div
              className="
                flex h-14 w-14
                items-center justify-center
                rounded-full
                border-2 border-white
                bg-blue-600
                text-[14px]
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
                px-3 py-2
                text-[11px]
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
  const checkpoint = findCheckpoint(helmet.checkpoint?.where);
  if (!checkpoint) return null;

  // NEW MODEL: the helmet is positioned only from the checkpoint it crossed.
  // There is NO relationship between CP1, CP2, CP3, CP4, or CP5.
  const basePosition = getHelmetForwardPosition(checkpoint.id, CHECKPOINTS, 3.5);
  if (!basePosition) return null;

  // Multiple helmets at the same checkpoint get a small visual lane offset.
  const helmetsAtCheckpoint = helmets
    .filter((item) => findCheckpoint(item.checkpoint?.where)?.id === checkpoint.id)
    .sort((a, b) =>
      a.helmetId.localeCompare(b.helmetId, undefined, { numeric: true }),
    );

  const laneIndex = Math.max(
    0,
    helmetsAtCheckpoint.findIndex((item) => item.helmetId === helmet.helmetId),
  );
  const centeredLane = laneIndex - (helmetsAtCheckpoint.length - 1) / 2;
  const laneOffset = centeredLane * 1.15;

  const [fx, , fz] = checkpoint.forward;
  const forwardLength = Math.hypot(fx, fz);

  let position = basePosition;
  if (forwardLength > 0.001 && Math.abs(laneOffset) > 0.001) {
    const perpendicularX = -fz / forwardLength;
    const perpendicularZ = fx / forwardLength;
    position = [
      basePosition[0] + perpendicularX * laneOffset,
      basePosition[1],
      basePosition[2] + perpendicularZ * laneOffset,
    ];
  }

  const marker = getHelmetMarkerColor(helmet.helmetId);

  return (
    <group position={position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(helmet.helmetId);
        }}
      >
        <sphereGeometry args={[0.72, 32, 32]} />
        <meshStandardMaterial
          color={marker.color}
          emissive={marker.color}
          emissiveIntensity={selected ? 5 : 3}
        />
      </mesh>

      <pointLight
        color={marker.color}
        intensity={selected ? 2 : 1}
        distance={6}
        decay={2}
      />

      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Html center position={[0, 1.55, 0]} distanceFactor={6} transform sprite>
          <div className="pointer-events-none flex flex-col items-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-3 text-[13px] font-extrabold text-white"
              style={{
                borderColor: selected ? "#ffffff" : marker.color,
                backgroundColor: marker.color,
                boxShadow: `0 0 22px ${marker.glow}`,
              }}
            >
              ⛑
            </div>
            <div className="mt-1 whitespace-nowrap rounded-md border border-white/25 bg-black/95 px-3 py-1.5 text-[11px] font-bold tracking-wide text-white shadow-lg">
              {helmet.helmetId.replace("_", "-").toUpperCase()}
            </div>
            <div className="mt-1 whitespace-nowrap rounded border border-blue-400/30 bg-blue-950/80 px-2 py-1 text-[9px] font-semibold text-blue-200">
              {checkpoint.name}
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