export interface MechSystem {
  id: string;
  destroyed?: boolean;
  uses?: number;
}

export interface Loadout {
  systems: MechSystem[];
  integratedSystems: MechSystem[];
  [key: string]: any;
}

export interface Mech {
  id: string;
  name: string;
  frame: string;
  loadouts: Loadout[];
  overshield: number;
  current_hp: number;
  current_heat: number;
  burn: number;
  current_overcharge: number;
  current_core_energy: number;
  current_repairs: number;
  current_structure: number;
  current_stress: number;
  conditions?: string[];
  cloud_portrait?: string;
  active?: boolean;
}

export interface PilotTalent {
  id: string;
  rank: number;
}

export interface PilotLicense {
  id: string;
  rank: number;
}

export interface Counter {
  id: string;
  name: string;
  val?: number;
}

export interface Pilot {
  id: string;
  name: string;
  callsign?: string;
  mechs: Mech[];
  mechSkills: [hull: number, agility: number, systems: number, engineering: number];
  talents: PilotTalent[];
  core_bonuses: string[];
  licenses: PilotLicense[];
  custom_counters?: Counter[];
  counter_data?: Counter[];
  state?: any;
  cloud_portrait?: string;
}

export interface Lcp {
  id: string;
  active?: boolean;
  manifest: {
    name: string;
    author?: string;
    version?: string;
  };
  data?: unknown;
}

export interface Encounter {
  id: string;
  name: string;
}
