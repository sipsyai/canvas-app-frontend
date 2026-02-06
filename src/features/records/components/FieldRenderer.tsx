/**
 * FieldRenderer Component
 *
 * Renders field values based on field type
 * Provides type-specific formatting and display
 */

import { Check, X } from 'lucide-react';
import {
  formatDate,
  formatDateTime,
  formatPhoneNumber,
  formatCurrency,
  formatNumber,
  truncateText,
  formatUrlForDisplay,
} from '../utils/formatters';

interface FieldRendererProps {
  type: string;
  value: any;
  field: {
    id: string;
    name: string;
    type: string;
    is_primary_field?: boolean;
    config?: { [key: string]: any };
  };
}

export const FieldRenderer = ({ type, value, field }: FieldRendererProps) => {
  // Handle null/undefined values
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">-</span>;
  }

  switch (type) {
    case 'text':
      return (
        <span
          className={
            field.is_primary_field
              ? 'font-semibold text-gray-900'
              : 'text-gray-700'
          }
        >
          {value}
        </span>
      );

    case 'email':
      return (
        <a
          href={`mailto:${value}`}
          className="text-blue-600 hover:text-blue-700 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
      );

    case 'phone': {
      const formattedPhone = formatPhoneNumber(value);
      return (
        <a
          href={`tel:${value.replace(/\s/g, '')}`}
          className="text-blue-600 hover:text-blue-700 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {formattedPhone}
        </a>
      );
    }

    case 'url': {
      const displayUrl = formatUrlForDisplay(value);
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {displayUrl}
        </a>
      );
    }

    case 'checkbox':
      return (
        <span className="inline-flex items-center">
          {value ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
        </span>
      );

    case 'date':
      return <span className="text-gray-700">{formatDate(value)}</span>;

    case 'datetime':
      return <span className="text-gray-700">{formatDateTime(value)}</span>;

    case 'select':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      );

    case 'multiselect':
      if (!Array.isArray(value)) return <span className="text-gray-400">-</span>;
      return (
        <div className="flex gap-1 flex-wrap">
          {value.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {item}
            </span>
          ))}
        </div>
      );

    case 'number':
      return (
        <span className="text-gray-700 font-mono tabular-nums">
          {formatNumber(value)}
        </span>
      );

    case 'currency': {
      const currency = field.config?.currency || 'USD';
      return (
        <span className="text-gray-700 font-mono tabular-nums">
          {formatCurrency(value, currency)}
        </span>
      );
    }

    case 'textarea': {
      const truncated = truncateText(value, 50);
      return (
        <span className="text-gray-700" title={value}>
          {truncated}
        </span>
      );
    }

    case 'percentage':
      return (
        <span className="text-gray-700 font-mono tabular-nums">
          {formatNumber(value)}%
        </span>
      );

    default:
      return <span className="text-gray-700">{String(value)}</span>;
  }
};
