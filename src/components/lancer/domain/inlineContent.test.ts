import { parseCompconPilot } from './parsePilot';
import { registerPilotInlineContent, findSkillData } from '../lancerData';
import { loadFixture, INLINE_LCP_PILOT } from './__fixtures__/fixtures';

beforeEach(() => {
  (globalThis as any).localStorage = {
    length: 0,
    key: () => null,
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
});

describe('inline content registry resolves V3 self-contained content', () => {
  it('resolves LCP skills carried inline in the export (not just bundled content)', () => {
    const pilot = parseCompconPilot(loadFixture('v3-pilots', INLINE_LCP_PILOT));

    expect(findSkillData('igfa1_sk_jury_rig').name).toBe('UNKNOWN SKILL');

    registerPilotInlineContent(pilot);

    expect(findSkillData('igfa1_sk_jury_rig').name).not.toBe('UNKNOWN SKILL');
    expect(findSkillData('sk_push_boundaries').name).not.toBe('UNKNOWN SKILL');
  });
});
