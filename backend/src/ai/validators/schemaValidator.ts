/**
 * Schema Validator
 * Pure, side-effect-free validation of worker output structure.
 * Builds on the existing REQUIRED_OUTPUT_FIELDS / VALID_STATUS_VALUES constants
 * and adds per-worker field type checking using WorkerSchema definitions.
 */

import type { JsonObject } from '@/lib/server/superadmin/workerDiagnosticTypes';
import {
  REQUIRED_OUTPUT_FIELDS,
  VALID_STATUS_VALUES,
} from '@/lib/server/superadmin/workerDiagnosticTypes';
import type { FieldDefinition, FieldType, WorkerSchema } from '@/ai/schemas/workerSchemas';
import { getWorkerSchema } from '@/ai/schemas/workerSchemas';

export type SchemaValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Resolves dotted paths like "data.kcal" against the output object.
 * Returns `undefined` when the path does not exist.
 */
function resolvePath(obj: JsonObject, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (!isPlainObject(current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function checkType(value: unknown, expected: FieldType, nullable: boolean): boolean {
  if (value === null || value === undefined) return nullable;
  switch (expected) {
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'boolean': return typeof value === 'boolean';
    case 'array': return Array.isArray(value);
    case 'object': return isPlainObject(value);
  }
}

// ─── Core validation ──────────────────────────────────────────────────────────

/** Validates the universal worker protocol fields (worker, status, data, notes). */
function validateProtocolFields(output: JsonObject): string[] {
  const errors: string[] = [];

  for (const field of REQUIRED_OUTPUT_FIELDS) {
    if (!(field in output)) {
      errors.push(`Missing required protocol field: "${field}".`);
    }
  }

  const status = output['status'];
  if (status !== undefined && !VALID_STATUS_VALUES.includes(String(status))) {
    errors.push(
      `Invalid "status" value: "${String(status)}". Allowed: ${VALID_STATUS_VALUES.join(' | ')}.`,
    );
  }

  const workerField = output['worker'];
  if (workerField !== undefined && typeof workerField !== 'string') {
    errors.push(`Field "worker" must be a string, got ${typeof workerField}.`);
  }

  const notes = output['notes'];
  if (notes !== undefined && !Array.isArray(notes)) {
    errors.push(`Field "notes" must be an array, got ${typeof notes}.`);
  }

  return errors;
}

/** Validates required fields declared in the WorkerSchema. */
function validateRequiredFields(output: JsonObject, schema: WorkerSchema): string[] {
  const errors: string[] = [];
  for (const field of schema.required) {
    const value = resolvePath(output, field);
    if (value === undefined || value === null) {
      errors.push(`Schema requires field "${field}" but it is missing or null.`);
    }
  }
  return errors;
}

/** Type-checks every field definition against the actual output. */
function validateFieldTypes(
  output: JsonObject,
  fieldDefs: Record<string, FieldDefinition>,
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [path, def] of Object.entries(fieldDefs)) {
    const value = resolvePath(output, path);

    if (value === undefined) {
      if (!def.optional) {
        errors.push(`Required field "${path}" is missing.`);
      }
      continue;
    }

    const nullable = def.nullable ?? false;
    if (!checkType(value, def.type, nullable)) {
      const msg = `Field "${path}": expected ${def.type}${nullable ? '|null' : ''}, got ${typeof value}${Array.isArray(value) ? '(array)' : ''}.`;
      if (def.optional) {
        warnings.push(msg);
      } else {
        errors.push(msg);
      }
    }
  }

  return { errors, warnings };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validates a worker output against:
 * 1. Universal protocol fields
 * 2. Worker-specific required fields
 * 3. Worker-specific field types
 *
 * When no schema is registered for `workerId` only protocol fields are checked.
 */
export function validateWorkerSchema(
  workerId: string,
  output: JsonObject,
): SchemaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Protocol
  errors.push(...validateProtocolFields(output));

  // 2. Worker-specific
  const schema = getWorkerSchema(workerId);
  if (schema) {
    errors.push(...validateRequiredFields(output, schema));
    const typeCheck = validateFieldTypes(output, schema.fields);
    errors.push(...typeCheck.errors);
    warnings.push(...typeCheck.warnings);
  } else {
    warnings.push(
      `No registered schema found for worker "${workerId}". Only protocol fields were validated.`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

/** Convenience re-export so callers can import everything from one place. */
export { getWorkerSchema };
