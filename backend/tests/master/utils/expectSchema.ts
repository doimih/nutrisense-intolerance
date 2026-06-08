/**
 * expectSchema.ts
 * Lightweight JSON schema assertion utilities.
 * Validates that objects have the expected structure, types and values.
 */

import assert from 'node:assert/strict';

export type SchemaShape = {
  [key: string]:
    | 'string'
    | 'number'
    | 'boolean'
    | 'array'
    | 'object'
    | 'null'
    | 'any'
    | SchemaShape;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function typeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

// ─── Core assertion ───────────────────────────────────────────────────────────

/**
 * Asserts that `actual` contains all keys defined in `shape` with matching types.
 * Nested SchemaShape objects trigger recursive assertion.
 */
export function expectSchema(
  actual: unknown,
  shape: SchemaShape,
  path = 'root',
): void {
  assert.ok(
    actual !== null && typeof actual === 'object' && !Array.isArray(actual),
    `${path}: expected an object, got ${typeOf(actual)}`,
  );

  const obj = actual as Record<string, unknown>;

  for (const [key, expectedType] of Object.entries(shape)) {
    const fullPath = `${path}.${key}`;

    assert.ok(
      key in obj,
      `${fullPath}: key is missing`,
    );

    const value = obj[key];

    if (typeof expectedType === 'object') {
      expectSchema(value, expectedType, fullPath);
      continue;
    }

    if (expectedType === 'any') continue;

    const actual_type = typeOf(value);
    assert.equal(
      actual_type,
      expectedType,
      `${fullPath}: expected type "${expectedType}", got "${actual_type}"`,
    );
  }
}

/**
 * Asserts the standard worker output protocol shape.
 */
export function expectWorkerOutputShape(output: unknown): void {
  expectSchema(output, {
    worker: 'string',
    status: 'string',
    data: 'object',
    notes: 'array',
  });
}

/**
 * Asserts that `status` is one of the valid values.
 */
export function expectValidStatus(output: Record<string, unknown>): void {
  assert.ok(
    ['success', 'warning', 'error'].includes(String(output['status'])),
    `Invalid status value: "${String(output['status'])}"`,
  );
}

/**
 * Asserts that a string field contains a disclaimer.
 */
export function expectDisclaimer(obj: Record<string, unknown>, fieldPath = 'data.disclaimer'): void {
  const parts = fieldPath.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) {
      assert.fail(`${fieldPath}: path not found`);
    }
    current = (current as Record<string, unknown>)[part];
  }
  assert.ok(
    typeof current === 'string' && current.length > 0,
    `${fieldPath}: expected a non-empty disclaimer string`,
  );
}

/**
 * Asserts that a value is a non-empty array.
 */
export function expectNonEmptyArray(value: unknown, label: string): void {
  assert.ok(Array.isArray(value), `${label}: expected an array`);
  assert.ok((value as unknown[]).length > 0, `${label}: expected a non-empty array`);
}
