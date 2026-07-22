import fs from 'fs';
import path from 'path';
import { parseCompconPilot } from './parsePilot';
import { parseCompconNpc } from './parseNpc';

const EXAMPLES = path.resolve(process.cwd(), 'examples');
const hasExamples = fs.existsSync(EXAMPLES);

interface Fixture {
  name: string;
  json: any;
}

function loadDir(sub: string): Fixture[] {
  const dir = path.join(EXAMPLES, sub);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({ name: f, json: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
}

if (!hasExamples) {
  it.skip('examples/ fixtures not present — skipping parser fixture tests', () => {});
} else {
  const v2pcs = loadDir('old v2 format PCs');
  const v3pcs = loadDir('new v3 format PCs');
  const v2npcs = loadDir('old v2 format NPCs');
  const v3npcs = loadDir('new v3 format NPCs');

  describe('parseCompconPilot', () => {
    it.each([...v2pcs, ...v3pcs])('parses $name to a valid domain pilot', ({ json }) => {
      const pilot = parseCompconPilot(json);
      expect(pilot.id).toBeTruthy();
      expect(pilot.mechs.length).toBeGreaterThan(0);
      expect(pilot.state.per_round_uses).toBeDefined();
      pilot.mechs.forEach(mech => {
        for (const key of [
          'current_hp', 'current_heat', 'current_structure', 'current_stress',
          'current_repairs', 'current_overcharge', 'current_core_energy',
          'overshield', 'burn',
        ] as const) {
          expect(typeof (mech as any)[key], `${key}`).toBe('number');
          expect(Number.isNaN((mech as any)[key]), `${key} NaN`).toBe(false);
        }
        expect(Array.isArray(mech.conditions)).toBe(true);
        expect(typeof mech.frame).toBe('string');
      });
    });

    it('normalizes V3 mech stats (stats.current + corePower + statuses) to flat V2 shape', () => {
      const v3 = v3pcs[0];
      expect(v3, 'need at least one V3 pilot fixture').toBeTruthy();
      const pilot = parseCompconPilot(v3.json);
      const mech = pilot.mechs[0];
      expect(typeof mech.current_hp).toBe('number');
      expect([0, 1]).toContain(mech.current_core_energy);
    });
  });

  describe('parseCompconNpc', () => {
    it.each([...v2npcs, ...v3npcs])('parses $name to a valid domain npc', ({ json }) => {
      const npc = parseCompconNpc(json);
      expect(npc.id).toBeTruthy();
      expect(typeof npc.class).toBe('string');
      expect(Array.isArray(npc.templates)).toBe(true);
      npc.templates.forEach(t => expect(typeof t).toBe('string'));
      expect(typeof (npc.stats as any).hp).toBe('number');
    });

    it('remaps V3 combat_data stat names to V2 keys (evasion->evade, saveTarget->save, etc.)', () => {
      const v3 = v3npcs[0];
      expect(v3, 'need at least one V3 npc fixture').toBeTruthy();
      const npc = parseCompconNpc(v3.json);
      const raw = v3.json.combat_data.stats.max;
      expect((npc.stats as any).evade).toBe(raw.evasion);
      expect((npc.stats as any).save).toBe(raw.saveTarget);
      expect((npc.stats as any).sensor).toBe(raw.sensorRange);
      expect((npc.stats as any).systems).toBe(raw.sys);
    });
  });
}
