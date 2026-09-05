export type CheckpointStatus = "ACTIVE" | "ALERT" | "OFFLINE";

export interface Checkpoint {
  id: string;
  name: string;

  // 3D position used by the mine map
  position: [number, number, number];

  // Kept for compatibility with existing 2D/map components
  x: number;
  y: number;
  z?: number;

  status: CheckpointStatus;
  description?: string;
}

/*
 * Mine checkpoint coordinates
 *
 * IMPORTANT:
 * The checkpoints are intentionally ordered as:
 *
 * CHECKPOINT 1 → CHECKPOINT 2 → CHECKPOINT 3
 *                    ↓
 *              CHECKPOINT 4 → CHECKPOINT 5
 *
 * This order is used by getWorkerCoveragePosition()
 * to determine the worker's position between checkpoints.
 */
export const CHECKPOINTS: Checkpoint[] = [
  {
    id: "CP-01",
    name: "CHECKPOINT 1",

    position: [0, -0.63, 20.0],

    // Compatibility coordinates
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

    // Compatibility coordinates
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

    // Compatibility coordinates
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

    // Compatibility coordinates
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

    // Compatibility coordinates
    x: -30.5,
    y: -4.56,
    z: -9.0,

    status: "ACTIVE",
    description: "Deep mine crossing",
  },
];

/*
 * Direct 3D checkpoint list.
 *
 * Use this in the Three.js / React Three Fiber
 * mine map when you need the exact coordinates.
 */
export const MINE_CHECKPOINTS_3D = [
  {
    id: "01",
    name: "CHECKPOINT 1",
    position: [0, -0.63, 20.0] as [number, number, number],
  },
  {
    id: "02",
    name: "CHECKPOINT 2",
    position: [15.0, -5.59, -11.5] as [number, number, number],
  },
  {
    id: "03",
    name: "CHECKPOINT 3",
    position: [0, -3.13, -20.5] as [number, number, number],
  },
  {
    id: "04",
    name: "CHECKPOINT 4",
    position: [-21.0, -5.70, -20.4] as [number, number, number],
  },
  {
    id: "05",
    name: "CHECKPOINT 5",
    position: [-30.5, -4.56, -9.0] as [number, number, number],
  },
] as const;

/*
 * Normalize Firebase checkpoint values.
 *
 * Supports:
 * CHECKPOINT 1
 * CHECKPOINT-1
 * CHECKPOINT_1
 * CP-01
 * CP-1
 * cp01
 * 01
 */
function normalizeCheckpointId(value: string) {
  const raw = value.trim().toUpperCase();

  // CHECKPOINT 1 / CHECKPOINT-1 / CHECKPOINT_1
  const checkpointMatch = raw.match(
    /^CHECKPOINT[-_ ]?0*(\d+)$/,
  );

  if (checkpointMatch) {
    return `CP-${checkpointMatch[1].padStart(2, "0")}`;
  }

  // CP-01 / CP-1 / CP_01 / CP01
  const cpMatch = raw.match(
    /^CP[-_ ]?0*(\d+)$/,
  );

  if (cpMatch) {
    return `CP-${cpMatch[1].padStart(2, "0")}`;
  }

  // Just "1", "01", etc.
  const numberMatch = raw.match(/^0*(\d+)$/);

  if (numberMatch) {
    return `CP-${numberMatch[1].padStart(2, "0")}`;
  }

  return raw;
}

/*
 * Find a checkpoint from Firebase "where" value.
 */
export function findCheckpoint(
  value: string | null | undefined,
) {
  if (!value) return undefined;

  const normalized = normalizeCheckpointId(value);

  return CHECKPOINTS.find(
    (checkpoint) => checkpoint.id === normalized,
  );
}

/*
 * Find the next checkpoint according to the mine route.
 */
export function getNextCheckpoint(
  currentCheckpointId: string,
  checkpoints: Checkpoint[] = CHECKPOINTS,
) {
  const index = checkpoints.findIndex(
    (checkpoint) =>
      checkpoint.id === normalizeCheckpointId(currentCheckpointId),
  );

  if (index < 0) {
    return undefined;
  }

  return checkpoints[index + 1];
}

/*
 * Calculate the helmet/worker position between the
 * current RFID checkpoint and the next checkpoint.
 *
 * Example:
 *
 * Firebase:
 * where = "CHECKPOINT 1"
 *
 * Worker position:
 * halfway between CP1 and CP2
 *
 * When Firebase changes to:
 * where = "CHECKPOINT 2"
 *
 * Worker position:
 * halfway between CP2 and CP3
 */
export function getWorkerCoveragePosition(
  currentCheckpointId: string,
  checkpoints: Checkpoint[] = CHECKPOINTS,
) {
  const index = checkpoints.findIndex(
    (checkpoint) =>
      checkpoint.id === normalizeCheckpointId(currentCheckpointId),
  );

  if (index < 0) {
    return null;
  }

  const current = checkpoints[index];
  const next = checkpoints[index + 1];

  // Last checkpoint:
  // keep the helmet directly at that checkpoint.
  if (!next) {
    return {
      x: current.position[0],
      y: current.position[1],
      z: current.position[2],

      position: [
        current.position[0],
        current.position[1],
        current.position[2],
      ] as [number, number, number],

      from: current,
      to: null,
    };
  }

  // Place helmet exactly halfway between
  // current and next checkpoint.
  const x =
    (current.position[0] + next.position[0]) / 2;

  const y =
    (current.position[1] + next.position[1]) / 2;

  const z =
    (current.position[2] + next.position[2]) / 2;

  return {
    x,
    y,
    z,

    position: [
      x,
      y,
      z,
    ] as [number, number, number],

    from: current,
    to: next,
  };
}

/*
 * Get the exact 3D position of a checkpoint.
 */
export function getCheckpoint3DPosition(
  checkpointId: string,
) {
  const checkpoint = findCheckpoint(checkpointId);

  if (!checkpoint) {
    return null;
  }

  return checkpoint.position;
}

/*
 * Get checkpoint by numeric ID.
 *
 * Example:
 * getCheckpointByNumber("01")
 * getCheckpointByNumber("1")
 * getCheckpointByNumber("CP-01")
 * getCheckpointByNumber("CHECKPOINT 1")
 */
export function getCheckpointByNumber(
  value: string,
) {
  return findCheckpoint(value);
}