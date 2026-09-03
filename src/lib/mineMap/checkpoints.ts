export type CheckpointStatus = "ACTIVE" | "ALERT" | "OFFLINE";
export interface Checkpoint { id: string; name: string; x: number; y: number; z?: number; status: CheckpointStatus; description?: string; }
export const CHECKPOINTS: Checkpoint[] = [
  { id: "CP-01", name: "CHECKPOINT 1", x: 18, y: 72, status: "ACTIVE", description: "Mine entrance checkpoint" },
  { id: "CP-02", name: "CHECKPOINT 2", x: 35, y: 58, status: "ACTIVE", description: "Primary tunnel checkpoint" },
  { id: "CP-03", name: "CHECKPOINT 3", x: 52, y: 43, status: "ACTIVE", description: "Central tunnel checkpoint" },
  { id: "CP-04", name: "CHECKPOINT 4", x: 69, y: 55, status: "ACTIVE", description: "North tunnel checkpoint" },
  { id: "CP-05", name: "CHECKPOINT 5", x: 84, y: 38, status: "ACTIVE", description: "Deep mine checkpoint" },
];
function normalizeCheckpointId(value: string) { const raw=value.trim().toUpperCase(); const match=raw.match(/(?:CP[-_ ]?0*|CHECKPOINT[-_ ]?)(\d+)/); return match ? `CP-${match[1].padStart(2,"0")}` : raw; }
export function findCheckpoint(value: string | null | undefined) { if (!value) return undefined; const normalized=normalizeCheckpointId(value); return CHECKPOINTS.find(c=>c.id===normalized); }
export function getWorkerCoveragePosition(currentCheckpointId: string, checkpoints: Checkpoint[] = CHECKPOINTS) {
  const index=checkpoints.findIndex(c=>c.id===normalizeCheckpointId(currentCheckpointId)); if(index<0) return null;
  const current=checkpoints[index], next=checkpoints[index+1];
  if(!next) return {x:current.x,y:current.y,z:current.z,from:current,to:null};
  return {x:(current.x+next.x)/2,y:(current.y+next.y)/2,z:current.z!==undefined&&next.z!==undefined?(current.z+next.z)/2:undefined,from:current,to:next};
}
