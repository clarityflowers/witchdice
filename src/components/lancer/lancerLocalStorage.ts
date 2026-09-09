import {
  loadLocalData,
  saveLocalData,
  getStorageName,
} from '../../localstorage.js';

import type { Encounter } from './types';
import { parseCompconPilot } from './domain/parsePilot';
import { parseCompconNpc } from './domain/parseNpc';
import type { DomainPilot, DomainNpc } from './domain/schema';

export const MODEL_TAG = 'domain-v1';

export const PILOT_PREFIX = 'pilot';
export const ENCOUNTER_PREFIX = 'encounter';
export const STORAGE_ID_LENGTH = 6;
export const NPC_LIBRARY_NAME = 'lancer-npcs'
export const SELECTED_CHARACTER_KEY = "lancer-selected-character"
export const LANCER_SQUAD_MECH_KEY = 'lancer-squad-mech'

const LEGACY_LCP_PREFIX = 'lcp-';

export function purgeLegacyLcpData() {
  const staleKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LEGACY_LCP_PREFIX)) staleKeys.push(key);
  }
  staleKeys.forEach(key => localStorage.removeItem(key));
  return staleKeys.length;
}

export function savePilotData(pilot: DomainPilot) {
  const tagged = { ...pilot, _model: MODEL_TAG };
  saveLocalData(PILOT_PREFIX, pilot.id.slice(0,STORAGE_ID_LENGTH), pilot.name, tagged);
}

export function loadPilotData(pilotID: string): DomainPilot | null {
  const raw: any = loadLocalData(PILOT_PREFIX, pilotID.slice(0,STORAGE_ID_LENGTH));
  if (!raw) return null;
  if (raw._model === MODEL_TAG) return raw as DomainPilot;
  try {
    const domain = parseCompconPilot(raw);
    savePilotData(domain);
    return { ...domain, _model: MODEL_TAG } as DomainPilot;
  } catch (e) {
    console.error('Failed to migrate stored pilot to domain model; using raw as-is', e);
    return raw as DomainPilot;
  }
}

export function deletePilotData(pilotID: string, pilotName: string) {
  const storageName = getStorageName(PILOT_PREFIX, pilotID.slice(0,STORAGE_ID_LENGTH), pilotName);
  localStorage.removeItem(storageName);
}


export function saveNpcLibrary(library: Record<string, any>) {
  const tagged: Record<string, any> = {};
  for (const id of Object.keys(library)) {
    tagged[id] = { ...library[id], _model: MODEL_TAG };
  }
  localStorage.setItem(NPC_LIBRARY_NAME, JSON.stringify(tagged));
}

export function loadNpcLibrary(): Record<string, DomainNpc> {
  const stored = localStorage.getItem(NPC_LIBRARY_NAME);
  if (!stored) return {};
  const raw = JSON.parse(stored);
  const out: Record<string, any> = {};
  let migrated = false;
  for (const id of Object.keys(raw)) {
    const npc = raw[id];
    if (npc && npc._model === MODEL_TAG) {
      out[id] = npc;
      continue;
    }
    try {
      out[id] = { ...parseCompconNpc(npc), _model: MODEL_TAG };
      migrated = true;
    } catch (e) {
      console.error('Failed to migrate stored NPC to domain model; using raw as-is', id, e);
      out[id] = npc;
    }
  }
  if (migrated) saveNpcLibrary(out);
  return out;
}

export function saveEncounterData(encounter: Encounter) {
  saveLocalData(ENCOUNTER_PREFIX, encounter.id.slice(0,STORAGE_ID_LENGTH), encounter.name, encounter);
}

export function loadEncounterData(encounterID: string): Encounter | null {
  return loadLocalData(ENCOUNTER_PREFIX, encounterID.slice(0,STORAGE_ID_LENGTH));
}

export function deleteEncounterData(encounter: Encounter) {
  const storageName = getStorageName(ENCOUNTER_PREFIX, encounter.id.slice(0,STORAGE_ID_LENGTH), encounter.name);
  localStorage.removeItem(storageName);
}
