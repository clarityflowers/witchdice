import { parseCompconPilot } from './parsePilot';
import { applyUpdatesToPlayer } from '../LancerPlayerMode/playerUtils';
import { loadFixture, INLINE_LCP_PILOT } from './__fixtures__/fixtures';

describe('full repair restores integrated-mount limited weapons', () => {
  it('restores mw_fuel_rod_gun and mw_prototype_1 (die-string limited) to a numeric max', () => {
    const pilot = parseCompconPilot(loadFixture('v3-pilots', INLINE_LCP_PILOT));
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
    expect(typeof prototype.uses).toBe('number');
    expect(prototype.uses).toBeGreaterThan(0);
  });
});
