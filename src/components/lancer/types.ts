export interface Mech {
  id: string;
  name: string;
  frame: string;
  loadouts: unknown[];
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

export interface Pilot {
  id: string;
  name: string;
  callsign?: string;
  mechs: Mech[];
  mechSkills: [hull: number, agility: number, systems: number, engineering: number];
  talents: unknown[];
  core_bonuses: unknown[];
  licenses: unknown[];
  cloud_portrait?: string;
}
