// ABOUTME: Custom react-hook-form resolver using @cfworker/json-schema for CSP-compatible validation.
// ABOUTME: Replaces AJV which requires unsafe-eval due to its use of new Function().

import { toNestError } from "@hookform/resolvers";
import { Validator } from "@cfworker/json-schema";
import type { FieldError, FieldValues, ResolverOptions, ResolverResult } from "react-hook-form";
import type { OutputUnit } from "@cfworker/json-schema";

function stripEmpty(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(stripEmpty);
	}
	if (value !== null && typeof value === "object") {
		const result: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(value)) {
			if (val !== undefined && val !== "") {
				result[key] = stripEmpty(val);
			}
		}
		return result;
	}
	return value;
}

// Parent-level keywords that just cascade from child errors and don't
// provide useful field-level information.
const PARENT_KEYWORDS = new Set([
	"properties",
	"additionalProperties",
	"false",
]);

function parseErrors(errors: OutputUnit[]): Record<string, FieldError> {
	const result: Record<string, FieldError> = {};

	for (const error of errors) {
		if (PARENT_KEYWORDS.has(error.keyword)) {
			continue;
		}

		// instanceLocation is a JSON pointer like "#/vals/field/nested"
		// Convert to dot path: "vals.field.nested"
		let path = error.instanceLocation
			.replace(/^#\//, "")
			.replace(/\//g, ".");

		// For "required" errors, the location points to the parent object.
		// Extract the property name and append it so the error maps to the field.
		if (error.keyword === "required") {
			const match = error.error.match(/\"([^"]+)\"/);
			if (match?.[1]) {
				path = path ? `${path}.${match[1]}` : match[1];
				error.error = "This field is required.";
			}
		}

		if (!path || result[path]) {
			continue;
		}

		result[path] = {
			message: error.error,
			type: error.keyword ?? "validation",
		};
	}

	return result;
}

export function jsonSchemaResolver(
	schema: Record<string, unknown>,
) {
	const validator = new Validator(schema as any, "7", false);

	return async <TFieldValues extends FieldValues>(
		values: TFieldValues,
		_context: unknown,
		options: ResolverOptions<TFieldValues>,
	): Promise<ResolverResult<TFieldValues>> => {
		const { valid, errors } = validator.validate(stripEmpty(values));

		if (valid) {
			return { values, errors: {} };
		}

		return {
			values: {},
			errors: toNestError(parseErrors(errors), options),
		};
	};
}
