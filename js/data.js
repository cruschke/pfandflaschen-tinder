const REQUIRED_FIELDS = [
  'id', 'filename', 'sourceUrl', 'containerType',
  'brand', 'description', 'isReturnable', 'hints',
  'license', 'attribution',
];
const VALID_TYPES = ['glass_bottle', 'plastic_bottle', 'screw_jar', 'aluminium_can'];
const MIN_ITEMS = 20;

export function validateBottles(items) {
  if (!items || items.length === 0) {
    throw new Error('bottles: items array is empty');
  }
  const ids = new Set();
  const urls = new Set();
  for (const item of items) {
    for (const field of REQUIRED_FIELDS) {
      if (item[field] === undefined || item[field] === null) {
        throw new Error(`bottles: missing required field "${field}" on item "${item.id}"`);
      }
    }
    if (!VALID_TYPES.includes(item.containerType)) {
      throw new Error(`bottles: invalid containerType "${item.containerType}"`);
    }
    if (!Array.isArray(item.hints) || item.hints.length === 0) {
      throw new Error(`bottles: hints must be a non-empty array on item "${item.id}"`);
    }
    if (ids.has(item.id)) {
      throw new Error(`bottles: duplicate id "${item.id}"`);
    }
    if (urls.has(item.sourceUrl)) {
      throw new Error(`bottles: duplicate sourceUrl "${item.sourceUrl}"`);
    }
    ids.add(item.id);
    urls.add(item.sourceUrl);
  }
}

export function mergeItems(existing, incoming) {
  const knownUrls = new Set(existing.map(i => i.sourceUrl));
  const toAdd = incoming.filter(i => !knownUrls.has(i.sourceUrl));
  return [...existing, ...toAdd];
}

export async function loadBottles() {
  const isTest = typeof process !== 'undefined' && process.env.DATA_FIXTURE === '1';
  const path = isTest ? 'assets/data/bottles-fixture.json' : 'assets/data/bottles.json';
  const res = await fetch(path);
  if (!res.ok) throw new Error(`bottles: failed to fetch ${path} (${res.status})`);
  const manifest = await res.json();
  const items = manifest.items ?? [];
  if (!isTest && items.length < MIN_ITEMS) {
    throw new Error(`bottles: library has ${items.length} items, minimum is ${MIN_ITEMS}`);
  }
  validateBottles(items);
  return Object.freeze(items.map(i => Object.freeze({ ...i })));
}
