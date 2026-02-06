/**
 * generateZodSchema Utility
 *
 * Converts object-field validation rules to Zod schema
 */

import { z } from 'zod';

export const generateZodSchema = (
  fieldType: string,
  validation: { [key: string]: any } = {},
  isRequired: boolean,
  label: string
): z.ZodTypeAny => {
  let schema: z.ZodTypeAny;

  // Base schemas by type
  switch (fieldType) {
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
    case 'textarea':
      schema = z.string();

      // Email validation
      if (fieldType === 'email') {
        schema = (schema as z.ZodString).email('Enter a valid email address');
      }

      // URL validation
      if (fieldType === 'url') {
        schema = (schema as z.ZodString).url('Enter a valid URL');
      }

      // Phone validation (basic)
      if (fieldType === 'phone') {
        schema = (schema as z.ZodString).regex(
          /^[\d\s+\-()]+$/,
          'Enter a valid phone number'
        );
      }

      // Length validation
      if (validation.minLength) {
        schema = (schema as z.ZodString).min(
          validation.minLength,
          `Must be at least ${validation.minLength} characters`
        );
      }
      if (validation.maxLength) {
        schema = (schema as z.ZodString).max(
          validation.maxLength,
          `Must be at most ${validation.maxLength} characters`
        );
      }

      // Regex validation
      if (validation.regex) {
        schema = (schema as z.ZodString).regex(
          new RegExp(validation.regex),
          validation.regexMessage || 'Invalid format'
        );
      }

      // Required validation
      if (isRequired) {
        schema = (schema as z.ZodString).min(1, `${label} is required`);
      }
      break;

    case 'number':
    case 'currency':
    case 'percentage':
      schema = z.number({
        invalid_type_error: 'Enter a valid number',
      });

      if (validation.min !== undefined) {
        schema = (schema as z.ZodNumber).min(
          validation.min,
          `Must be at least ${validation.min}`
        );
      }
      if (validation.max !== undefined) {
        schema = (schema as z.ZodNumber).max(
          validation.max,
          `Must be at most ${validation.max}`
        );
      }

      if (!isRequired) {
        schema = schema.optional().nullable();
      }
      break;

    case 'date':
    case 'datetime':
      schema = z.string().or(z.date());
      if (!isRequired) {
        schema = schema.optional().nullable();
      }
      break;

    case 'checkbox':
      schema = z.boolean().default(false);
      break;

    case 'select':
    case 'radio':
      schema = z.string();
      if (validation.options?.length) {
        const enumValues = validation.options.map((opt: any) => opt.value);
        schema = z.enum(enumValues as [string, ...string[]], {
          errorMap: () => ({ message: 'Select a valid option' }),
        });
      }
      if (!isRequired) {
        schema = schema.optional().nullable();
      } else {
        schema = (schema as z.ZodString).min(1, `${label} is required`);
      }
      break;

    case 'multiselect':
      schema = z.array(z.string());
      if (validation.minItems) {
        schema = (schema as z.ZodArray<any>).min(
          validation.minItems,
          `Select at least ${validation.minItems} options`
        );
      }
      if (validation.maxItems) {
        schema = (schema as z.ZodArray<any>).max(
          validation.maxItems,
          `Select at most ${validation.maxItems} options`
        );
      }
      if (!isRequired) {
        schema = schema.optional().default([]);
      }
      break;

    case 'lookup':
      // Lookup field (foreign key reference)
      schema = z.string();
      if (!isRequired) {
        schema = schema.optional().nullable();
      } else {
        schema = (schema as z.ZodString).min(1, `${label} is required`);
      }
      break;

    default:
      // Fallback for unknown types
      schema = z.any();
      if (!isRequired) {
        schema = schema.optional();
      }
  }

  return schema;
};
