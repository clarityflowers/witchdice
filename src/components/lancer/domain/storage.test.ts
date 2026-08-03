import {
  savePilotData, loadPilotData, MODEL_TAG, loadNpcLibrary,
} from '../lancerLocalStorage';
import { parseCompconPilot } from './parsePilot';
import { applyUpdatesToPlayer } from '../LancerPlayerMode/playerUtils';
import { v2Pilots, v3Pilots, v2Npcs, v3Npcs } from './__fixtures__/fixtures';

class LocalStorageMock {
  store: Record<string, string> = {};
  get length() { return Object.keys(this.store).length; }
  key(i: number) { return Object.keys(this.store)[i] ?? null; }
  getItem(k: string) { return this.store[k] ?? null; }
  setItem(k: string, v: string) { this.store[k] = String(v); }
  removeItem(k: string) { delete this.store[k]; }
  clear() { this.store = {}; }
}

beforeEach(() => {
  (globalThis as any).localStorage = new LocalStorageMock();
});

describe('pilot storage round-trip', () => {
  it('saves a domain pilot tagged with the model version and loads it back', () => {
    const domain = parseCompconPilot(v2Pilots[0].json);
    savePilotData(domain);
    const loaded = loadPilotData(domain.id) as any;
    expect(loaded).toBeTruthy();
    expect(loaded._model).toBe(MODEL_TAG);
    expect(loaded.id).toBe(domain.id);
  });

  it('migrates a raw COMP/CON pilot placed directly in storage (V2 and V3)', () => {
    for (const { name, json } of [v2Pilots[0], v3Pilots[0]]) {
      (globalThis as any).localStorage.clear();
      const rawPilot = (json.EXPORT_TYPE === 'Save Pilot' && json.data) ? json.data : json;
      (globalThis as any).localStorage.setItem(
        `pilot-${rawPilot.id.slice(0, 6)}-${rawPilot.name}`,
        JSON.stringify(rawPilot),
      );
      const loaded = loadPilotData(rawPilot.id) as any;
      expect(loaded, name).toBeTruthy();
      expect(loaded._model, name).toBe(MODEL_TAG);
      expect(typeof loaded.mechs[0].current_hp, name).toBe('number');
      expect(Number.isNaN(loaded.mechs[0].current_hp), name).toBe(false);
    }
  });

  it('round-trips a mutation through applyUpdatesToPlayer + save + reload', () => {
    const domain = parseCompconPilot(v2Pilots[0].json);
    savePilotData(domain);
    const pilot = loadPilotData(domain.id) as any;
    const mech = pilot.mechs[0];
    applyUpdatesToPlayer({ current_hp: 3 }, pilot, mech);
    savePilotData(pilot);
    const reloaded = loadPilotData(domain.id) as any;
    expect(reloaded.mechs[0].current_hp).toBe(3);
    expect(reloaded._model).toBe(MODEL_TAG);
  });
});

describe('npc library storage round-trip', () => {
  it('migrates raw COMP/CON NPCs to the domain model on load (V2 and V3)', () => {
    const v2 = v2Npcs[0].json;
    const v3 = v3Npcs[0].json;
    const rawLib: Record<string, any> = { [v2.id]: v2, [v3.id]: v3 };
    (globalThis as any).localStorage.setItem('lancer-npcs', JSON.stringify(rawLib));

    const lib = loadNpcLibrary();
    expect(Object.keys(lib).length).toBe(2);
    Object.values(lib).forEach((npc: any) => {
      expect(npc._model).toBe(MODEL_TAG);
      expect(typeof npc.class).toBe('string');
      expect(typeof (npc.stats as any).hp).toBe('number');
    });
  });
});
