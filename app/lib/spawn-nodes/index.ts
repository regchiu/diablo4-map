import { additionalMonsters } from "./additionalMonsters";
import { chestsAny } from "./chests_any";
import { chestsT1 } from "./chests_t1";
import { chestsT2 } from "./chests_t2";
import { chestsT3 } from "./chests_t3";
import { harbingers } from "./harbingers";
import { highValueTargets } from "./high_value_targets";

const spawnNodes = {
  additionalMonsters,
  chestsAny,
  chestsT1,
  chestsT2,
  chestsT3,
  harbingers,
  highValueTargets,
} as const;
export default spawnNodes;
