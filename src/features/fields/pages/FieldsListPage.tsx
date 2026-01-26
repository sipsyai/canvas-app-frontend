import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  ToggleLeft,
  List,
  Type,
  Hash,
  Link as LinkIcon,
  AlignLeft,
  CircleDot,
  CheckSquare,
  User,
  Briefcase,
  Settings2,
  ShoppingCart,
  LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigationStore } from '@/stores/navigationStore';
import { useFields } from '../hooks/useFields';
import { FieldCard } from '../components/FieldCard';
import { FilterChips } from '../components/FilterChips';
import { FieldsTableSkeleton } from '../components/FieldsTableSkeleton';
import { FieldsTableEmpty } from '../components/FieldsTableEmpty';
import type { FieldType } from '@/types/field.types';

// Icon mapping for field types
const typeIcons: Record<FieldType, LucideIcon> = {
  text: Type,
  email: Mail,
  phone: Phone,
  number: Hash,
  date: Calendar,
  datetime: Clock,
  textarea: AlignLeft,
  select: List,
  multiselect: CheckSquare,
  checkbox: ToggleLeft,
  radio: CircleDot,
  url: LinkIcon,
};

// Color mapping for field types
const typeColors: Record<FieldType, { bg: string; text: string }> = {
  text: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300' },
  email: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-primary dark:text-blue-400' },
  phone: { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  number: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
  date: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
  datetime: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300' },
  textarea: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
  select: { bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
  multiselect: { bg: 'bg-cyan-50 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400' },
  checkbox: { bg: 'bg-pink-50 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
  radio: { bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400' },
  url: { bg: 'bg-sky-50 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
};

// Category variant mapping
const categoryVariants: Record<string, 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal' | 'indigo' | 'gray'> = {
  'Contact Info': 'blue',
  'Business': 'green',
  'System': 'gray',
  'E-commerce': 'indigo',
  'Address': 'orange',
};

// Filter chips config
const filterChips = [
  { id: 'all', label: 'All Fields' },
  { id: 'Contact Info', label: 'Contact Info', icon: User },
  { id: 'Business', label: 'Business', icon: Briefcase },
  { id: 'System', label: 'System', icon: Settings2 },
  { id: 'E-commerce', label: 'E-commerce', icon: ShoppingCart },
];

export const FieldsListPage = () => {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigationStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { data: fields, isLoading, isError, error } = useFields({
    category: categoryFilter,
  });

  useEffect(() => {
    setBreadcrumbs([{ label: 'Field Library' }]);
  }, [setBreadcrumbs]);

  // Client-side filtering for search
  const filteredFields = fields?.filter((field) => {
    const matchesSearch =
      !search ||
      field.name.toLowerCase().includes(search.toLowerCase()) ||
      field.label.toLowerCase().includes(search.toLowerCase()) ||
      (field.description?.toLowerCase().includes(search.toLowerCase()) ?? false);

    return matchesSearch;
  }) ?? [];

  if (isLoading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Field Library
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
              Manage and organize your data fields across your projects.
            </p>
          </div>
          <Button disabled>
            <Plus className="h-5 w-5" />
            New Field
          </Button>
        </div>
        <FieldsTableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {(error as Error)?.message || 'Failed to load fields'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-6">
      {/* Page Heading & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
            Field Library
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
            Manage and organize your data fields across your projects. Standardize your data structure with reusable field definitions.
          </p>
        </div>
        <Button onClick={() => navigate('/fields/create')}>
          <Plus className="h-5 w-5" />
          New Field
        </Button>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        {/* Search */}
        <div className="w-full lg:w-1/3 min-w-[300px]">
          <div className="flex w-full items-center rounded-lg h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary overflow-hidden transition-all shadow-sm">
            <div className="pl-3 flex items-center justify-center text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search fields by name, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-full bg-transparent border-none focus:ring-0 focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 px-3 text-sm"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <FilterChips
          chips={filterChips}
          activeChip={categoryFilter}
          onChipClick={setCategoryFilter}
        />
      </div>

      {/* Field Grid */}
      {filteredFields.length === 0 ? (
        <FieldsTableEmpty onCreateClick={() => navigate('/fields/create')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFields.map((field) => {
            const Icon = typeIcons[field.type] || Type;
            const colors = typeColors[field.type] || typeColors.text;
            const categoryVariant = field.category ? categoryVariants[field.category] || 'gray' : undefined;

            return (
              <FieldCard
                key={field.id}
                name={field.label}
                description={field.description || undefined}
                type={field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                category={field.category || undefined}
                icon={Icon}
                iconBgColor={colors.bg}
                iconColor={colors.text}
                categoryVariant={categoryVariant}
                onClick={() => {
                  // Navigate to field detail/edit
                }}
              />
            );
          })}
        </div>
      )}

      {/* Load More */}
      {filteredFields.length > 0 && filteredFields.length >= 8 && (
        <div className="flex justify-center mt-6">
          <button className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
            Load more fields
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
