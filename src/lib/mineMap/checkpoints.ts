export type CheckpointStatus = "ACTIVE" | "ALERT" | "OFFLINE";

export interface Checkpoint {
  id: string;
  name: string;
  position: [number, number, number];
  /** Local direction the worker moves after crossing this checkpoint. */
  forward: [number, number, number];
  // Compatibility coordinates for existing dashboard consumers.
  x: number;
  y: number;
  z?: number;
  status: CheckpointStatus;
  description?: string;
}

/**
 * IMPORTANT:
 * Checkpoints are independent RFID locations.
 * There is NO route such as CP1 -> CP2 -> CP3.
 *
 * `forward` belongs to each checkpoint and defines the local direction in
 * which a helmet is displayed after that checkpoint is crossed.
 */
export const CHECKPOINTS: Checkpoint[] = [
  {
    id: "CP-01",
    name: "CHECKPOINT 1",
    position: [0, -0.63, 20.0],
    forward: [0, 0, -1],
    x: 0,
    y: -0.63,
    z: 20.0,
    status: "ACTIVE",
    description: "Main entrance checkpoint",
  },
  {
    id: "CP-02",
    name: "CHECKPOINT 2",
    position: [15.0, -5.59, -11.5],
    forward: [1, 0, 0.15],
    x: 15.0,
    y: -5.59,
    z: -11.5,
    status: "ACTIVE",
    description: "Upper tunnel crossing",
  },
  {
    id: "CP-03",
    name: "CHECKPOINT 3",
    position: [0, -3.13, -20.5],
    forward: [0, 0, -1],
    x: 0,
    y: -3.13,
    z: -20.5,
    status: "ACTIVE",
    description: "East tunnel crossing",
  },
  {
    id: "CP-04",
    name: "CHECKPOINT 4",
    position: [-21.0, -5.70, -20.4],
    forward: [-1, 0, 0],
    x: -21.0,
    y: -5.70,
    z: -20.4,
    status: "ACTIVE",
    description: "Lower tunnel crossing",
  },
  {
    id: "CP-05",
    name: "CHECKPOINT 5",
    position: [-30.5, -4.56, -9.0],
    forward: [0, 0, 1],
    x: -30.5,
    y: -4.56,
    z: -9.0,
    status: "ACTIVE",
    description: "Deep mine crossing",
  },
];

/** Exact checkpoint coordinates for the supplied mine.glb. */
export const MINE_CHECKPOINTS_3D = [
  { id: "01", name: "CHECKPOINT 1", position: [0, -0.63, 20.0] as [number, number, number] },
  { id: "05", name: "CHECKPOINT 5", position: [-30.5, -4.56, -9.0] as [number, number, number] },
  { id: "03", name: "CHECKPOINT 3", position: [0, -3.13, -20.5] as [number, number, number] },
  { id: "02", name: "CHECKPOINT 2", position: [15.0, -5.59, -11.5] as [number, number, number] },
  { id: "04", name: "CHECKPOINT 4", position: [-21.0, -5.70, -20.4] as [number, number, number] },
] as const;

function normalizeCheckpointId(value: string) {
  const raw = value.trim().toUpperCase();
  const checkpointMatch = raw.match(/^CHECKPOINT[-_ ]?0*(\d+)$/);
  if (checkpointMatch) return `CP-${checkpointMatch[1].padStart(2, "0")}`;
  const cpMatch = raw.match(/^CP[-_ ]?0*(\d+)$/);
  if (cpMatch) return `CP-${cpMatch[1].padStart(2, "0")}`;
  const numberMatch = raw.match(/^0*(\d+)$/);
  if (numberMatch) return `CP-${numberMatch[1].padStart(2, "0")}`;
  return raw;
}

export function findCheckpoint(value: string | null | undefined) {
  if (!value) return undefined;
  const normalized = normalizeCheckpointId(value);
  return CHECKPOINTS.find((checkpoint) => checkpoint.id === normalized);
}

/**
 * Compatibility helper. It returns ONLY the current checkpoint.
 * It deliberately does not calculate a position between checkpoints.
 */
export function getWorkerCoveragePosition(
  currentCheckpointId: string,
  checkpoints: Checkpoint[] = CHECKPOINTS,
) {
  const normalized = normalizeCheckpointId(currentCheckpointId);
  const current = checkpoints.find((checkpoint) => checkpoint.id === normalized);
  if (!current) return null;

  return {
    x: current.position[0],
    y: current.position[1],
    z: current.position[2],
    position: [...current.position] as [number, number, number],
    from: current,
    to: null,
  };
}

/**
 * Place a helmet a fixed distance forward of the checkpoint it just crossed.
 * No other checkpoint is consulted.
 */
export function getHelmetForwardPosition(
  currentCheckpointId: string,
  checkpoints: Checkpoint[] = CHECKPOINTS,
  distance = 3.5,
) {
  const normalized = normalizeCheckpointId(currentCheckpointId);
  const checkpoint = checkpoints.find((item) => item.id === normalized);
  if (!checkpoint) return null;

  const [fx, fy, fz] = checkpoint.forward;
  const length = Math.hypot(fx, fy, fz);

  if (length < 0.001) {
    return [
      checkpoint.position[0],
      checkpoint.position[1] + 0.9,
      checkpoint.position[2],
    ] as [number, number, number];
  }

  const nx = fx / length;
  const ny = fy / length;
  const nz = fz / length;

  return [
    checkpoint.position[0] + nx * distance,
    checkpoint.position[1] + ny * distance + 0.9,
    checkpoint.position[2] + nz * distance,
  ] as [number, number, number];
}

export function getCheckpoint3DPosition(checkpointId: string) {
  return findCheckpoint(checkpointId)?.position ?? null;
}

export function getCheckpointByNumber(value: string) {
  return findCheckpoint(value);
}
