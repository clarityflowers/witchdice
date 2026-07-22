import { deepCopy } from '../../../utils';
import { NpcSchema, type DomainNpc } from './schema';

function unwrapEnvelope(raw: any): any {
  if (raw && raw.data && !raw.class && raw.data.class) return raw.data;
  return raw;
}

const V2_STAT_KEYS = [
  'activations', 'armor', 'structure', 'stress', 'hp', 'evade', 'edef',
  'heatcap', 'speed', 'sensor', 'save', 'hull', 'agility', 'systems',
  'engineering', 'size',
];

const V2_TO_V3_STAT: Record<string, string> = {
  evade: 'evasion',
  sensor: 'sensorRange',
  save: 'saveTarget',
  agility: 'agi',
  systems: 'sys',
  engineering: 'eng',
};

function classId(cls: any): string {
  return (cls && typeof cls === 'object') ? cls.id : cls;
}

function templateIds(templates: any): string[] {
  return (templates || []).map((t: any) => (typeof t === 'string' ? t : t.id));
}

function statsFromV3(combatData: any) {
  const max = (combatData && combatData.stats && combatData.stats.max) || {};
  const stats: Record<string, any> = { bonuses: {}, overrides: {} };
  V2_STAT_KEYS.forEach(v2key => {
    const v3key = V2_TO_V3_STAT[v2key] || v2key;
    if (v3key in max) stats[v2key] = max[v3key];
  });
  return stats;
}

function itemsFromV3(features: any, tier: any) {
  return (features || []).map((f: any) => ({
    itemID: f.id,
    tier: tier,
    flavorName: (f.data && f.data.flavorName) || '',
    description: '',
    destroyed: !!(f.data && f.data.destroyed),
    charged: false,
    uses: 0,
  }));
}

export function parseCompconNpc(raw: any): DomainNpc {
  const src = deepCopy(unwrapEnvelope(raw));

  if (!src || !src.id || !src.class) {
    throw new Error('Invalid NPC file: missing id or class');
  }

  const isV3 = 'combat_data' in src;

  if (!isV3) {
    src.class = classId(src.class);
    src.templates = templateIds(src.templates);
    return NpcSchema.parse(src);
  }

  const npc = {
    ...src,
    class: classId(src.class),
    templates: templateIds(src.templates),
    labels: (src.narrative && src.narrative.labels) || [],
    stats: statsFromV3(src.combat_data),
    items: itemsFromV3(src.features, src.tier),
  };

  return NpcSchema.parse(npc);
}
