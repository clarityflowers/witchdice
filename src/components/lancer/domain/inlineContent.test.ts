import fs from 'fs';
import path from 'path';
import { parseCompconPilot } from './parsePilot';
import { registerPilotInlineContent, findSkillData } from '../lancerData';

const FIXTURE = path.resolve(process.cwd(), 'examples/new v3 format PCs/EVILNOESHOTGUN.json');
const hasFixture = fs.existsSync(FIXTURE);

beforeEach(() => {
  (globalThis as any).localStorage = {
    length: 0,
    key: () => null,
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
});

if (!hasFixture) {
  it.skip('EVILNOESHOTGUN fixture not present — skipping inline-content test', () => {});
} else {
  describe('inline content registry resolves V3 self-contained content', () => {
    it('resolves LCP skills carried inline in the export (not just bundled content)', () => {
      const pilot = parseCompconPilot(JSON.parse(fs.readFileSync(FIXTURE, 'utf8')));

      // these skills are from a supplement, absent from bundled @massif data
      expect(findSkillData('igfa1_sk_jury_rig').name).toBe('UNKNOWN SKILL');

      registerPilotInlineContent(pilot);

      expect(findSkillData('igfa1_sk_jury_rig').name).not.toBe('UNKNOWN SKILL');
      expect(findSkillData('sk_push_boundaries').name).not.toBe('UNKNOWN SKILL');
    });
  });
}
