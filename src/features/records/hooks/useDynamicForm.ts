import { useMemo } from 'react';
import { z } from 'zod';
import { useObjectFields } from './useObjectFields';
import { generateZodSchema } from '../utils/generateZodSchema';
import type { ObjectFieldWithDetails } from '@/types/object-field.types';

export const useDynamicForm = (objectId: string) => {
  const { data: objectFields, isLoading } = useObjectFields(objectId);

  const sortedFields = useMemo(() => {
    if (!objectFields) return [];
    return [...objectFields]
      .filter((f) => f.is_visible && f.field)
      .sort((a, b) => a.display_order - b.display_order) as ObjectFieldWithDetails[];
  }, [objectFields]);

  const schema = useMemo(() => {
    if (!sortedFields.length) return z.object({});

    const schemaFields: Record<string, z.ZodTypeAny> = {};

    sortedFields.forEach((field) => {
      if (!field.field) return;
      const fieldId = field.field_id;
      const fieldType = field.field.type;
      const validation = field.field_overrides?.validation || {};
      const isRequired = field.is_required;

      schemaFields[fieldId] = generateZodSchema(
        fieldType,
        validation,
        isRequired,
        field.field.label
      );
    });

    return z.object(schemaFields);
  }, [sortedFields]);

  const defaultValues = useMemo(() => {
    if (!sortedFields.length) return {};

    const defaults: Record<string, any> = {};

    sortedFields.forEach((field) => {
      const fieldId = field.field_id;
      const defaultValue = field.field_overrides?.default_value;

      if (defaultValue !== undefined && defaultValue !== null) {
        defaults[fieldId] = defaultValue;
      }
    });

    return defaults;
  }, [sortedFields]);

  return {
    schema,
    defaultValues,
    fields: sortedFields,
    isLoading,
  };
};
