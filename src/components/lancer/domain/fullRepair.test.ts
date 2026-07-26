import fs from 'fs';
import path from 'path';
import { parseCompconPilot } from './parsePilot';
import { applyUpdatesToPlayer } from '../LancerPlayerMode/playerUtils';

const FIXTURE = path.resolve(process.cwd(), 'examples/new v3 format PCs/EVILNOESHOTGUN.json');
const hasFixture = fs.existsSync(FIXTURE);

if (!hasFixture) {
  it.skip('EVILNOESHOTGUN fixture not present — skipping full-repair test', () => {});
} else {
  describe('full repair restores integrated-mount limited weapons', () => {
    it('restores mw_fuel_rod_gun and mw_prototype_1 (die-string limited) to a numeric max', () => {
      const pilot = parseCompconPilot(JSON.parse(fs.readFileSync(FIXTURE, 'utf8')));
      const mech = pilot.mechs[0];

      applyUpdatesToPlayer({ repairAllWeaponsAndSystems: true }, pilot as any, mech as any);

      const byId: Record<string, any> = {};
      ((mech.loadouts[0] as any).integratedMounts || []).forEach((slot: any) => {
        if (slot && slot.weapon) byId[slot.weapon.id] = slot.weapon;
      });

      const fuelRod = byId['mw_fuel_rod_gun'];
      expect(fuelRod, 'fuel rod gun present in integratedMounts').toBeTruthy();
      expect(typeof fuelRod.uses).toBe('number');
      expect(fuelRod.uses).toBeGreaterThan(0);

      const prototype = byId['mw_prototype_1'];
      expect(prototype, 'prototype weapon present in integratedMounts').toBeTruthy();
      // limited tag is a die string ("1d6+2") — must become a numeric max, not a concatenated string
      expect(typeof prototype.uses).toBe('number');
      expect(prototype.uses).toBeGreaterThan(0);
    });
  });
}
