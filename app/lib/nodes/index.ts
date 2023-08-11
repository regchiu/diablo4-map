import { alchemists } from "./alchemists";
import { altars } from "./altars";
import { cellars } from "./cellars";
import { dungeons } from "./dungeons";
import { healers } from "./healers";
import { jewelers } from "./jewelers";
import { occultists } from "./occultists";
import { stableMasters } from "./stableMasters";
import { waypoints } from "./waypoints";

const nodes = {
  alchemists,
  altars,
  cellars,
  dungeons,
  healers,
  jewelers,
  occultists,
  stableMasters,
  waypoints,
} as const;

export default nodes;

export type NODE_TYPE = keyof typeof nodes;
export type NODE = (typeof nodes)[NODE_TYPE][number];

export function getID(node: NODE, type: NODE_TYPE) {
  return `${type}:${node.name}${node.x},${node.y}`;
}
