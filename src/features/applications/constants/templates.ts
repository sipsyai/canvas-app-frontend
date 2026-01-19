// Application Templates
export interface ApplicationTemplate {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  config: {
    suggestedObjects?: string[];
    features?: string[];
    [key: string]: any;
  };
  category: 'crm' | 'itsm' | 'hr' | 'custom';
}

export const APPLICATION_TEMPLATES: ApplicationTemplate[] = [
  {
    id: 'blank',
    name: 'blank',
    label: 'Blank Application',
    description: 'Start from scratch with an empty application',
    icon: '📄',
    config: {},
    category: 'custom',
  },
  {
    id: 'crm',
    name: 'crm',
    label: 'CRM (Customer Relationship Management)',
    description: 'Manage customers, contacts, and sales opportunities',
    icon: '🤝',
    config: {
      suggestedObjects: ['contact', 'company', 'opportunity', 'deal'],
      features: ['contacts', 'companies', 'deals', 'reports'],
    },
    category: 'crm',
  },
  {
    id: 'itsm',
    name: 'itsm',
    label: 'ITSM (IT Service Management)',
    description: 'Track tickets, incidents, and service requests',
    icon: '🎫',
    config: {
      suggestedObjects: ['ticket', 'incident', 'service_request', 'asset'],
      features: ['ticketing', 'incident_management', 'asset_tracking'],
    },
    category: 'itsm',
  },
  {
    id: 'hr',
    name: 'hr',
    label: 'HR Management',
    description: 'Manage employees, recruitment, and time off',
    icon: '👥',
    config: {
      suggestedObjects: ['employee', 'candidate', 'time_off', 'department'],
      features: ['employee_directory', 'recruitment', 'time_off_tracking'],
    },
    category: 'hr',
  },
  {
    id: 'project',
    name: 'project',
    label: 'Project Management',
    description: 'Organize projects, tasks, and team collaboration',
    icon: '📊',
    config: {
      suggestedObjects: ['project', 'task', 'milestone', 'team'],
      features: ['projects', 'tasks', 'gantt_chart', 'time_tracking'],
    },
    category: 'custom',
  },
  {
    id: 'inventory',
    name: 'inventory',
    label: 'Inventory Management',
    description: 'Track products, stock levels, and warehouses',
    icon: '📦',
    config: {
      suggestedObjects: ['product', 'stock', 'warehouse', 'supplier'],
      features: ['products', 'stock_tracking', 'warehouse_management'],
    },
    category: 'custom',
  },
];

export const getTemplateById = (id: string): ApplicationTemplate | undefined => {
  return APPLICATION_TEMPLATES.find((t) => t.id === id);
};

export const getTemplatesByCategory = (category: ApplicationTemplate['category']): ApplicationTemplate[] => {
  return APPLICATION_TEMPLATES.filter((t) => t.category === category);
};
