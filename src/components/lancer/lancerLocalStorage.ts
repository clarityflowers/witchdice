import {
  loadLocalData,
  saveLocalData,
  getStorageName,
} from '../../localstorage.js';

import type { Pilot, Lcp, Encounter } from './types';

export const PILOT_PREFIX = 'pilot';
export const LCP_PREFIX = 'lcp';
export const ENCOUNTER_PREFIX = 'encounter';
export const STORAGE_ID_LENGTH = 6;
export const NPC_LIBRARY_NAME = 'lancer-npcs'
export const SELECTED_CHARACTER_KEY = "lancer-selected-character"
export const LANCER_SQUAD_MECH_KEY = 'lancer-squad-mech'

export function saveLcpData(contentPack: Lcp) {
  saveLocalData(LCP_PREFIX, contentPack.id.slice(0,STORAGE_ID_LENGTH), contentPack.manifest.name, contentPack);
}

export function loadLcpData(lcpID: string): Lcp | null {
  return loadLocalData(LCP_PREFIX, lcpID.slice(0,STORAGE_ID_LENGTH));
}

export function deleteLcpData(lcpID: string, lcpName: string) {
  const storageName = getStorageName(LCP_PREFIX, lcpID.slice(0,STORAGE_ID_LENGTH), lcpName);
  localStorage.removeItem(storageName);
}



export function savePilotData(pilot: Pilot) {
  saveLocalData(PILOT_PREFIX, pilot.id.slice(0,STORAGE_ID_LENGTH), pilot.name, pilot);
}

export function loadPilotData(pilotID: string): Pilot | null {
  return loadLocalData(PILOT_PREFIX, pilotID.slice(0,STORAGE_ID_LENGTH));
}

export function deletePilotData(pilotID: string, pilotName: string) {
  const storageName = getStorageName(PILOT_PREFIX, pilotID.slice(0,STORAGE_ID_LENGTH), pilotName);
  localStorage.removeItem(storageName);
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
