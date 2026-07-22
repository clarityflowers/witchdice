import fs from 'fs';
import path from 'path';
import {
  savePilotData, loadPilotData, MODEL_TAG,
  saveNpcLibrary, loadNpcLibrary,
} from '../lancerLocalStorage';
import { parseCompconPilot } from './parsePilot';
import { parseCompconNpc } from './parseNpc';
import { applyUpdatesToPlayer } from '../LancerPlayerMode/playerUtils';

const EXAMPLES = path.resolve(process.cwd(), 'examples');
const hasExamples = fs.existsSync(EXAMPLES);

function firstJson(sub: string): any {
  const dir = path.join(EXAMPLES, sub);
  if (!fs.existsSync(dir)) return null;
  const file = fs.readdirSync(dir).find(f => f.endsWith('.json'));
  return file ? JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) : null;
}

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

if (!hasExamples) {
  it.skip('examples/ fixtures not present — skipping storage round-trip tests', () => {});
} else {
  describe('pilot storage round-trip', () => {
    it('saves a domain pilot tagged with the model version and loads it back', () => {
      const domain = parseCompconPilot(firstJson('old v2 format PCs'));
      savePilotData(domain);
      const loaded = loadPilotData(domain.id) as any;
      expect(loaded).toBeTruthy();
      expect(loaded._model).toBe(MODEL_TAG);
      expect(loaded.id).toBe(domain.id);
    });

    it('migrates a raw COMP/CON pilot placed directly in storage (V2 and V3)', () => {
      for (const sub of ['old v2 format PCs', 'new v3 format PCs']) {
        (globalThis as any).localStorage.clear();
        const raw = firstJson(sub);
        // simulate a pre-migration pilot: unwrap V3 envelope, write raw under its key
        const rawPilot = (raw.EXPORT_TYPE === 'Save Pilot' && raw.data) ? raw.data : raw;
        (globalThis as any).localStorage.setItem(
          `pilot-${rawPilot.id.slice(0, 6)}-${rawPilot.name}`,
          JSON.stringify(rawPilot),
        );
        const loaded = loadPilotData(rawPilot.id) as any;
        expect(loaded, sub).toBeTruthy();
        expect(loaded._model, sub).toBe(MODEL_TAG);
        expect(typeof loaded.mechs[0].current_hp, sub).toBe('number');
        expect(Number.isNaN(loaded.mechs[0].current_hp), sub).toBe(false);
      }
    });

    it('round-trips a mutation through applyUpdatesToPlayer + save + reload', () => {
      const domain = parseCompconPilot(firstJson('old v2 format PCs'));
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
      const v2 = firstJson('old v2 format NPCs');
      const v3 = firstJson('new v3 format NPCs');
      const rawLib: Record<string, any> = {};
      if (v2) rawLib[v2.id] = v2;
      if (v3) rawLib[v3.id] = v3;
      (globalThis as any).localStorage.setItem('lancer-npcs', JSON.stringify(rawLib));

      const lib = loadNpcLibrary();
      Object.values(lib).forEach((npc: any) => {
        expect(npc._model).toBe(MODEL_TAG);
        expect(typeof npc.class).toBe('string');
        expect(typeof (npc.stats as any).hp).toBe('number');
      });
    });
  });
}
