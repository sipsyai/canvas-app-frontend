import {
  Type,
  Mail,
  Phone,
  Hash,
  Calendar,
  Clock,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  Circle,
  Link2,
} from 'lucide-react';
import { FieldType } from '@/types/field.types';

interface FieldTypeIconProps {
  type: FieldType;
  className?: string;
}

export const FieldTypeIcon = ({ type, className = 'w-4 h-4 text-gray-600' }: FieldTypeIconProps) => {
  switch (type) {
    case 'text':
      return <Type className={className} />;
    case 'email':
      return <Mail className={className} />;
    case 'phone':
      return <Phone className={className} />;
    case 'number':
      return <Hash className={className} />;
    case 'date':
      return <Calendar className={className} />;
    case 'datetime':
      return <Clock className={className} />;
    case 'textarea':
      return <AlignLeft className={className} />;
    case 'select':
    case 'multiselect':
      return <ChevronDown className={className} />;
    case 'checkbox':
      return <CheckSquare className={className} />;
    case 'radio':
      return <Circle className={className} />;
    case 'url':
      return <Link2 className={className} />;
    default:
      return <Type className={className} />;
  }
};
