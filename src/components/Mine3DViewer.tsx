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

import { CHECKPOINTS, type Checkpoint } from "@/lib/mineMap/checkpoints";

/*
 * ============================================================
 * CHECKPOINT MARKER
 * ============================================================
 */

 function CheckpointMarker({
  checkpoint,
  }: {
    checkpoint: Checkpoint;
  }) {
    return (
      <group position={checkpoint.position}>

        {/* Large floor glow */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.06, 0]}
        >
          <circleGeometry args={[1.8, 48]} />
          <meshBasicMaterial
            color="#1683ff"
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Outer floor ring */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.09, 0]}
        >
          <ringGeometry args={[1.05, 1.35, 96]} />
          <meshBasicMaterial
            color="#1683ff"
            transparent
            opacity={1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Inner floor ring */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.1, 0]}
        >
          <ringGeometry args={[0.55, 0.7, 96]} />
          <meshBasicMaterial
            color="#4da3ff"
            transparent
            opacity={0.95}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Large vertical pole */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.11, 0.14, 2.2, 40]} />
          <meshStandardMaterial
            color="#1683ff"
            emissive="#0066ff"
            emissiveIntensity={3}
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>

        {/* Large blue beacon */}
        <mesh position={[0, 2.15, 0]}>
          <sphereGeometry args={[0.42, 64, 64]} />
          <meshStandardMaterial
            color="#1683ff"
            emissive="#0066ff"
            emissiveIntensity={6}
            metalness={0.2}
            roughness={0.15}
          />
        </mesh>

        {/* Beacon glow */}
        <pointLight
          position={[0, 2.15, 0]}
          color="#1683ff"
          intensity={3}
          distance={7}
          decay={2}
        />

        {/* Label always faces camera */}
        <Billboard
          follow
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          <Html
            center
            position={[0, 2.65, 0]}
            distanceFactor={7}
            transform
            sprite
          >
            <div className="pointer-events-none flex flex-col items-center">

              {/* Large checkpoint number */}
              <div
                className="
                  flex h-12 w-12
                  items-center justify-center
                  rounded-full
                  border-[3px] border-white
                  bg-blue-600
                  text-sm
                  font-black
                  text-white
                  shadow-[0_0_25px_rgba(0,102,255,1)]
                "
              >
                {checkpoint.id}
              </div>

              {/* Checkpoint name */}
              <div
                className="
                  mt-1.5
                  whitespace-nowrap
                  rounded-lg
                  border-2 border-blue-400/60
                  bg-black/95
                  px-3
                  py-1.5
                  text-[11px]
                  font-black
                  tracking-wider
                  text-blue-100
                  shadow-[0_0_15px_rgba(0,102,255,0.55)]
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

/*
 * ============================================================
 * MINE MODEL
 * ============================================================
 */

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

/*
 * ============================================================
 * MINE SCENE
 * ============================================================
 */

function MineScene() {
  return (
    <>
      {/* Mine lighting */}
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

      {/*
       * IMPORTANT:
       *
       * Mine and checkpoints are inside the SAME Center.
       *
       * Therefore they use the exact same coordinate system
       * after the model is centered.
       */}
      <Center>
        <group>
          {/* Actual mine */}
          <Suspense fallback={null}>
            <MineModel />
          </Suspense>

          {/* Actual 3D checkpoints */}
          {CHECKPOINTS.map((checkpoint) => (
            <CheckpointMarker
              key={checkpoint.id}
              checkpoint={checkpoint}
            />
          ))}
        </group>
      </Center>
    </>
  );
}

/*
 * ============================================================
 * VIEWER
 * ============================================================
 */

export default function Mine3DViewer() {
  return (
    <div className="h-full w-full bg-black">
      <Canvas
        shadows
        camera={{
          position: [115, 95, 125],
          fov: 45,
          near: 0.1,
          far: 5000,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        {/* Dark mining environment */}
        <color
          attach="background"
          args={["#020609"]}
        />

        <MineScene />

        {/* 360° controls */}
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