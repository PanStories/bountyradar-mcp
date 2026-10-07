// core/validate.mjs — minimal zero-dependency JSON-Schema (Draft 2020-12 subset) validator.
// Driven by schemas/bounty.schema.json so the schema stays the single source of truth.
// CI may run a strict `ajv` build; this local fallback covers required/type/enum/min-max/
// minLength/maxLength/format(uri,date-time)/additionalProperties:false/array items.
import schema from '../../schemas/bounty.schema.json' with { type: 'json' };

/**
 * Validate one object against the bounty schema.
 * @param {any} obj
 * @returns {{valid:true}|{valid:false, errors:string[]}}
 */
export function validateBounty(obj) {
  const errors = [];
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return { valid: false, errors: ['root must be an object'] };
  }
  // additionalProperties:false
  const allowed = new Set(Object.keys(schema.properties));
  for (const k of Object.keys(obj)) {
    if (!allowed.has(k)) errors.push(`unknown property "${k}"`);
  }
  // required
  for (const r of schema.required) {
    if (!(r in obj)) errors.push(`missing required "${r}"`);
  }
  // properties
  for (const [key, def] of Object.entries(schema.properties)) {
    const v = obj[key];
    if (v === undefined) continue;
    validateProp(key, v, def, errors);
  }
  return errors.length ? { valid: false, errors } : { valid: true };
}

function validateProp(key, v, def, errors) {
  const typeOk = checkType(v, def.type);
  if (!typeOk) { errors.push(`${key}: expected ${def.type}, got ${typeof v}`); return; }
  if (def.enum && !def.enum.includes(v)) errors.push(`${key}: "${v}" not in enum`);
  if (def.type === 'string') {
    if (def.minLength != null && v.length < def.minLength) errors.push(`${key}: too short`);
    if (def.maxLength != null && v.length > def.maxLength) errors.push(`${key}: too long`);
    if (def.format === 'uri' && !/^https?:\/\/.+/.test(v)) errors.push(`${key}: not a uri`);
    if (def.format === 'date-time' && isNaN(Date.parse(v))) errors.push(`${key}: not date-time`);
    if (def.pattern && !new RegExp(def.pattern).test(v)) errors.push(`${key}: pattern mismatch`);
  }
  if (def.type === 'number' || def.type === 'integer') {
    if (def.minimum != null && v < def.minimum) errors.push(`${key}: < minimum`);
    if (def.maximum != null && v > def.maximum) errors.push(`${key}: > maximum`);
    if (def.type === 'integer' && !Number.isInteger(v)) errors.push(`${key}: not integer`);
  }
  if (def.type === 'array') {
    if (!Array.isArray(v)) { errors.push(`${key}: not array`); return; }
    if (def.maxItems != null && v.length > def.maxItems) errors.push(`${key}: too many items`);
    if (def.items) for (const it of v) validateProp(`${key}[]`, it, def.items, errors);
  }
}

function checkType(v, type) {
  if (type === 'array') return Array.isArray(v);
  if (type === 'integer') return typeof v === 'number' && Number.isInteger(v);
  if (type === 'number') return typeof v === 'number' && !Number.isNaN(v);
  if (type === 'string') return typeof v === 'string';
  if (type === 'boolean') return typeof v === 'boolean';
  return true;
}

export { schema };
