/**
 * CRM Seed Runner Script
 *
 * Usage: npx tsx scripts/run-seed.ts
 *
 * Requires: Valid JWT token in AUTH_TOKEN env variable
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (!AUTH_TOKEN) {
  console.error('❌ AUTH_TOKEN environment variable is required');
  console.error('   Get token by logging in to the app and copying from localStorage');
  console.error('   Usage: AUTH_TOKEN=your_token npx tsx scripts/run-seed.ts');
  process.exit(1);
}

// Create axios client with auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AUTH_TOKEN}`,
  },
});

// ============================================================
// API FUNCTIONS
// ============================================================

const objectsAPI = {
  create: async (data: any) => (await apiClient.post('/api/objects', data)).data,
  list: async () => (await apiClient.get('/api/objects')).data,
  update: async (id: string, data: any) => (await apiClient.patch(`/api/objects/${id}`, data)).data,
  delete: async (id: string) => await apiClient.delete(`/api/objects/${id}`),
};

const fieldsAPI = {
  create: async (data: any) => (await apiClient.post('/api/fields', data)).data,
  list: async (params?: any) => (await apiClient.get('/api/fields', { params })).data,
  delete: async (id: string) => await apiClient.delete(`/api/fields/${id}`),
};

const objectFieldsApi = {
  create: async (data: any) => (await apiClient.post('/api/object-fields', data)).data,
};

const recordsAPI = {
  create: async (data: any) => (await apiClient.post('/api/records', data)).data,
};

const relationshipsAPI = {
  create: async (data: any) => (await apiClient.post('/api/relationships', data)).data,
  getByObject: async (objectId: string) =>
    (await apiClient.get(`/api/relationships/objects/${objectId}`)).data,
  delete: async (id: string) => await apiClient.delete(`/api/relationships/${id}`),
};

const relationshipRecordsAPI = {
  create: async (data: any) => (await apiClient.post('/api/relationship-records', data)).data,
};

// ============================================================
// OBJECT & FIELD DEFINITIONS
// ============================================================

interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  config?: Record<string, unknown>;
  is_required?: boolean;
  display_order: number;
}

interface ObjectDefinition {
  name: string;
  label: string;
  plural_name: string;
  icon: string;
  color: string;
  fields: FieldDefinition[];
}

const OBJECT_DEFINITIONS: ObjectDefinition[] = [
  // USER
  {
    name: 'crm_user',
    label: 'User',
    plural_name: 'Users',
    icon: 'users',
    color: '#10B981',
    fields: [
      { name: 'user_email', label: 'Email', type: 'email', display_order: 0, is_required: true },
      { name: 'user_first_name', label: 'First Name', type: 'text', display_order: 1, is_required: true },
      { name: 'user_last_name', label: 'Last Name', type: 'text', display_order: 2, is_required: true },
      {
        name: 'user_role',
        label: 'Role',
        type: 'select',
        display_order: 3,
        is_required: true,
        config: {
          options: [
            { label: 'Admin', value: 'Admin' },
            { label: 'Sales Manager', value: 'Sales Manager' },
            { label: 'Sales Rep', value: 'Sales Rep' },
            { label: 'Support', value: 'Support' },
          ],
        },
      },
      { name: 'user_active', label: 'Active', type: 'checkbox', display_order: 4 },
    ],
  },

  // COMPANY
  {
    name: 'company',
    label: 'Company',
    plural_name: 'Companies',
    icon: 'building',
    color: '#8B5CF6',
    fields: [
      { name: 'company_name', label: 'Company Name', type: 'text', display_order: 0, is_required: true },
      { name: 'company_website', label: 'Website', type: 'url', display_order: 1 },
      {
        name: 'company_industry',
        label: 'Industry',
        type: 'select',
        display_order: 2,
        config: {
          options: [
            { label: 'Technology', value: 'Technology' },
            { label: 'Finance', value: 'Finance' },
            { label: 'Healthcare', value: 'Healthcare' },
            { label: 'Retail', value: 'Retail' },
            { label: 'Manufacturing', value: 'Manufacturing' },
            { label: 'Other', value: 'Other' },
          ],
        },
      },
      {
        name: 'company_size',
        label: 'Company Size',
        type: 'select',
        display_order: 3,
        config: {
          options: [
            { label: '1-10', value: '1-10' },
            { label: '11-50', value: '11-50' },
            { label: '51-200', value: '51-200' },
            { label: '201-500', value: '201-500' },
            { label: '500+', value: '500+' },
          ],
        },
      },
      { name: 'company_address', label: 'Address', type: 'textarea', display_order: 4 },
      { name: 'company_phone', label: 'Phone', type: 'phone', display_order: 5 },
      { name: 'company_logo', label: 'Logo URL', type: 'url', display_order: 6 },
    ],
  },

  // CONTACT
  {
    name: 'contact',
    label: 'Contact',
    plural_name: 'Contacts',
    icon: 'user',
    color: '#3B82F6',
    fields: [
      { name: 'contact_email', label: 'Email', type: 'email', display_order: 0, is_required: true },
      { name: 'contact_first_name', label: 'First Name', type: 'text', display_order: 1, is_required: true },
      { name: 'contact_last_name', label: 'Last Name', type: 'text', display_order: 2, is_required: true },
      { name: 'contact_phone', label: 'Phone', type: 'phone', display_order: 3 },
      { name: 'contact_title', label: 'Title', type: 'text', display_order: 4 },
      { name: 'contact_department', label: 'Department', type: 'text', display_order: 5 },
      { name: 'contact_linkedin', label: 'LinkedIn', type: 'url', display_order: 6 },
    ],
  },

  // LEAD
  {
    name: 'lead',
    label: 'Lead',
    plural_name: 'Leads',
    icon: 'target',
    color: '#EF4444',
    fields: [
      { name: 'lead_email', label: 'Email', type: 'email', display_order: 0, is_required: true },
      { name: 'lead_first_name', label: 'First Name', type: 'text', display_order: 1, is_required: true },
      { name: 'lead_last_name', label: 'Last Name', type: 'text', display_order: 2, is_required: true },
      { name: 'lead_phone', label: 'Phone', type: 'phone', display_order: 3 },
      { name: 'lead_company', label: 'Company', type: 'text', display_order: 4 },
      {
        name: 'lead_status',
        label: 'Status',
        type: 'select',
        display_order: 5,
        is_required: true,
        config: {
          options: [
            { label: 'New', value: 'New' },
            { label: 'Contacted', value: 'Contacted' },
            { label: 'Qualified', value: 'Qualified' },
            { label: 'Converted', value: 'Converted' },
            { label: 'Lost', value: 'Lost' },
          ],
        },
      },
      {
        name: 'lead_source',
        label: 'Source',
        type: 'select',
        display_order: 6,
        config: {
          options: [
            { label: 'Website', value: 'Website' },
            { label: 'Referral', value: 'Referral' },
            { label: 'Email', value: 'Email' },
            { label: 'Phone', value: 'Phone' },
            { label: 'Social Media', value: 'Social Media' },
            { label: 'Advertisement', value: 'Advertisement' },
          ],
        },
      },
      { name: 'lead_expected_value', label: 'Expected Value', type: 'number', display_order: 7, config: { prefix: '$', decimal_places: 2 } },
      { name: 'lead_notes', label: 'Notes', type: 'textarea', display_order: 8 },
    ],
  },
];

// ============================================================
// SAMPLE DATA
// ============================================================

const SAMPLE_USERS = [
  { email: 'ali.veli@crm.com', first_name: 'Ali', last_name: 'Veli', role: 'Admin', active: true },
  { email: 'ayse.yilmaz@crm.com', first_name: 'Ayse', last_name: 'Yilmaz', role: 'Sales Manager', active: true },
  { email: 'mehmet.kaya@crm.com', first_name: 'Mehmet', last_name: 'Kaya', role: 'Sales Rep', active: true },
];

const SAMPLE_COMPANIES = [
  { name: 'Acme Corp', website: 'https://acme.com', industry: 'Technology', size: '51-200', address: '123 Tech Street, San Francisco, CA 94102', phone: '+1-555-100-1000' },
  { name: 'TechStart Inc', website: 'https://techstart.io', industry: 'Technology', size: '11-50', address: '456 Startup Ave, Austin, TX 78701', phone: '+1-555-200-2000' },
  { name: 'Global Finance', website: 'https://globalfinance.com', industry: 'Finance', size: '500+', address: '789 Wall Street, New York, NY 10005', phone: '+1-555-300-3000' },
];

const SAMPLE_CONTACTS = [
  { email: 'john@acme.com', first_name: 'John', last_name: 'Smith', phone: '+1-555-101-1001', title: 'CEO', department: 'Executive', linkedin: 'https://linkedin.com/in/johnsmith', company_name: 'Acme Corp' },
  { email: 'jane@acme.com', first_name: 'Jane', last_name: 'Doe', phone: '+1-555-101-1002', title: 'CTO', department: 'Technology', linkedin: 'https://linkedin.com/in/janedoe', company_name: 'Acme Corp' },
  { email: 'bob@techstart.com', first_name: 'Bob', last_name: 'Wilson', phone: '+1-555-201-2001', title: 'Founder', department: 'Executive', linkedin: 'https://linkedin.com/in/bobwilson', company_name: 'TechStart Inc' },
  { email: 'sarah@globalfinance.com', first_name: 'Sarah', last_name: 'Johnson', phone: '+1-555-301-3001', title: 'VP Sales', department: 'Sales', linkedin: 'https://linkedin.com/in/sarahjohnson', company_name: 'Global Finance' },
  { email: 'mike@globalfinance.com', first_name: 'Mike', last_name: 'Brown', phone: '+1-555-301-3002', title: 'IT Director', department: 'IT', linkedin: 'https://linkedin.com/in/mikebrown', company_name: 'Global Finance' },
];

const SAMPLE_LEADS = [
  { email: 'lead1@example.com', first_name: 'Alex', last_name: 'Turner', phone: '+1-555-401-4001', company: 'NewTech Solutions', status: 'New', source: 'Website', expected_value: 15000, notes: 'Interested in enterprise plan.' },
  { email: 'lead2@example.com', first_name: 'Emma', last_name: 'Davis', phone: '+1-555-402-4002', company: 'Creative Studios', status: 'Contacted', source: 'Referral', expected_value: 8000, notes: 'Referred by John Smith.' },
  { email: 'lead3@example.com', first_name: 'Chris', last_name: 'Martin', phone: '+1-555-403-4003', company: 'DataDriven Inc', status: 'Qualified', source: 'Email', expected_value: 25000, notes: 'High potential.' },
  { email: 'lead4@example.com', first_name: 'Lisa', last_name: 'Anderson', phone: '+1-555-404-4004', company: 'StartupX', status: 'New', source: 'Social Media', expected_value: 5000, notes: 'Small startup.' },
  { email: 'lead5@example.com', first_name: 'David', last_name: 'Lee', phone: '+1-555-405-4005', company: 'Enterprise Corp', status: 'Converted', source: 'Phone', expected_value: 50000, notes: 'Deal closed.' },
];

// ============================================================
// SEED FUNCTION
// ============================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function seedCRM() {
  console.log('🌱 Starting CRM seed...\n');

  const fieldIdMap: Record<string, string> = {};
  const objectIdMap: Record<string, string> = {};
  const recordIdMap: Record<string, string> = {};

  try {
    // STEP 1: Create Fields & Objects
    console.log('📦 Creating objects and fields...');

    for (const objDef of OBJECT_DEFINITIONS) {
      const fieldIds: Array<{ field_id: string; display_order: number; is_required: boolean }> = [];

      for (const fieldDef of objDef.fields) {
        console.log(`  Creating field: ${fieldDef.name}`);
        const field = await fieldsAPI.create({
          name: fieldDef.name,
          label: fieldDef.label,
          type: fieldDef.type,
          config: fieldDef.config || {},
          category: 'crm',
        });
        fieldIdMap[field.name] = field.id;
        fieldIds.push({
          field_id: field.id,
          display_order: fieldDef.display_order,
          is_required: fieldDef.is_required ?? false,
        });
        await delay(50);
      }

      console.log(`  Creating object: ${objDef.name}`);
      const obj = await objectsAPI.create({
        name: objDef.name,
        label: objDef.label,
        plural_name: objDef.plural_name,
        description: `CRM ${objDef.label} object`,
        icon: objDef.icon,
      });
      await objectsAPI.update(obj.id, { color: objDef.color });
      objectIdMap[obj.name] = obj.id;

      console.log(`  Attaching ${fieldIds.length} fields to ${objDef.name}...`);
      for (const fieldRef of fieldIds) {
        await objectFieldsApi.create({
          object_id: obj.id,
          field_id: fieldRef.field_id,
          display_order: fieldRef.display_order,
          is_required: fieldRef.is_required,
          is_visible: true,
          is_readonly: false,
        });
        await delay(50);
      }

      console.log(`  ✅ ${objDef.name} created with ${fieldIds.length} fields\n`);
    }

    // STEP 2: Create Relationships
    console.log('🔗 Creating relationships...');

    const contactCompanyRel = await relationshipsAPI.create({
      name: 'contact_company',
      from_object_id: objectIdMap['company'],
      to_object_id: objectIdMap['contact'],
      type: '1:N',
      from_label: 'Company',
      to_label: 'Contacts',
    });
    console.log('  ✅ contact_company');

    await delay(100);

    await relationshipsAPI.create({
      name: 'lead_contact',
      from_object_id: objectIdMap['lead'],
      to_object_id: objectIdMap['contact'],
      type: '1:N',
      from_label: 'Lead',
      to_label: 'Converted Contact',
    });
    console.log('  ✅ lead_contact');

    await delay(100);

    const leadOwnerRel = await relationshipsAPI.create({
      name: 'lead_owner',
      from_object_id: objectIdMap['crm_user'],
      to_object_id: objectIdMap['lead'],
      type: '1:N',
      from_label: 'Owner',
      to_label: 'Owned Leads',
    });
    console.log('  ✅ lead_owner');

    await delay(100);

    const contactOwnerRel = await relationshipsAPI.create({
      name: 'contact_owner',
      from_object_id: objectIdMap['crm_user'],
      to_object_id: objectIdMap['contact'],
      type: '1:N',
      from_label: 'Owner',
      to_label: 'Owned Contacts',
    });
    console.log('  ✅ contact_owner');

    await delay(100);

    const companyOwnerRel = await relationshipsAPI.create({
      name: 'company_owner',
      from_object_id: objectIdMap['crm_user'],
      to_object_id: objectIdMap['company'],
      type: '1:N',
      from_label: 'Owner',
      to_label: 'Owned Companies',
    });
    console.log('  ✅ company_owner\n');

    // STEP 3: Create Sample Records
    console.log('📝 Creating sample records...');

    // Users
    console.log('  Creating users...');
    for (const user of SAMPLE_USERS) {
      const record = await recordsAPI.create({
        object_id: objectIdMap['crm_user'],
        data: {
          [fieldIdMap['user_email']]: user.email,
          [fieldIdMap['user_first_name']]: user.first_name,
          [fieldIdMap['user_last_name']]: user.last_name,
          [fieldIdMap['user_role']]: user.role,
          [fieldIdMap['user_active']]: user.active,
        },
      });
      recordIdMap[`user_${user.email}`] = record.id;
      console.log(`    ✅ ${user.first_name} ${user.last_name}`);
      await delay(50);
    }

    // Companies
    console.log('  Creating companies...');
    for (const company of SAMPLE_COMPANIES) {
      const record = await recordsAPI.create({
        object_id: objectIdMap['company'],
        data: {
          [fieldIdMap['company_name']]: company.name,
          [fieldIdMap['company_website']]: company.website,
          [fieldIdMap['company_industry']]: company.industry,
          [fieldIdMap['company_size']]: company.size,
          [fieldIdMap['company_address']]: company.address,
          [fieldIdMap['company_phone']]: company.phone,
        },
      });
      recordIdMap[`company_${company.name}`] = record.id;
      console.log(`    ✅ ${company.name}`);
      await delay(50);
    }

    // Contacts
    console.log('  Creating contacts...');
    for (const contact of SAMPLE_CONTACTS) {
      const record = await recordsAPI.create({
        object_id: objectIdMap['contact'],
        data: {
          [fieldIdMap['contact_email']]: contact.email,
          [fieldIdMap['contact_first_name']]: contact.first_name,
          [fieldIdMap['contact_last_name']]: contact.last_name,
          [fieldIdMap['contact_phone']]: contact.phone,
          [fieldIdMap['contact_title']]: contact.title,
          [fieldIdMap['contact_department']]: contact.department,
          [fieldIdMap['contact_linkedin']]: contact.linkedin,
        },
      });
      recordIdMap[`contact_${contact.email}`] = record.id;
      console.log(`    ✅ ${contact.first_name} ${contact.last_name}`);
      await delay(50);
    }

    // Leads
    console.log('  Creating leads...');
    for (const lead of SAMPLE_LEADS) {
      const record = await recordsAPI.create({
        object_id: objectIdMap['lead'],
        data: {
          [fieldIdMap['lead_email']]: lead.email,
          [fieldIdMap['lead_first_name']]: lead.first_name,
          [fieldIdMap['lead_last_name']]: lead.last_name,
          [fieldIdMap['lead_phone']]: lead.phone,
          [fieldIdMap['lead_company']]: lead.company,
          [fieldIdMap['lead_status']]: lead.status,
          [fieldIdMap['lead_source']]: lead.source,
          [fieldIdMap['lead_expected_value']]: lead.expected_value,
          [fieldIdMap['lead_notes']]: lead.notes,
        },
      });
      recordIdMap[`lead_${lead.email}`] = record.id;
      console.log(`    ✅ ${lead.first_name} ${lead.last_name}`);
      await delay(50);
    }

    // STEP 4: Link Records
    console.log('\n🔗 Linking records...');

    // Link Contacts to Companies
    console.log('  Linking contacts to companies...');
    for (const contact of SAMPLE_CONTACTS) {
      const contactId = recordIdMap[`contact_${contact.email}`];
      const companyId = recordIdMap[`company_${contact.company_name}`];
      if (contactId && companyId) {
        await relationshipRecordsAPI.create({
          relationship_id: contactCompanyRel.id,
          from_record_id: companyId,
          to_record_id: contactId,
        });
        console.log(`    ✅ ${contact.first_name} → ${contact.company_name}`);
        await delay(50);
      }
    }

    // Link Leads to Owner
    console.log('  Assigning leads to sales rep...');
    const salesRepId = recordIdMap['user_mehmet.kaya@crm.com'];
    for (const lead of SAMPLE_LEADS) {
      const leadId = recordIdMap[`lead_${lead.email}`];
      if (leadId && salesRepId) {
        await relationshipRecordsAPI.create({
          relationship_id: leadOwnerRel.id,
          from_record_id: salesRepId,
          to_record_id: leadId,
        });
        console.log(`    ✅ ${lead.first_name} → Mehmet`);
        await delay(50);
      }
    }

    // Link Contacts to Owner
    console.log('  Assigning contacts to sales manager...');
    const salesManagerId = recordIdMap['user_ayse.yilmaz@crm.com'];
    for (const contact of SAMPLE_CONTACTS) {
      const contactId = recordIdMap[`contact_${contact.email}`];
      if (contactId && salesManagerId) {
        await relationshipRecordsAPI.create({
          relationship_id: contactOwnerRel.id,
          from_record_id: salesManagerId,
          to_record_id: contactId,
        });
        console.log(`    ✅ ${contact.first_name} → Ayse`);
        await delay(50);
      }
    }

    // Link Companies to Owner
    console.log('  Assigning companies to admin...');
    const adminId = recordIdMap['user_ali.veli@crm.com'];
    for (const company of SAMPLE_COMPANIES) {
      const companyId = recordIdMap[`company_${company.name}`];
      if (companyId && adminId) {
        await relationshipRecordsAPI.create({
          relationship_id: companyOwnerRel.id,
          from_record_id: adminId,
          to_record_id: companyId,
        });
        console.log(`    ✅ ${company.name} → Ali`);
        await delay(50);
      }
    }

    console.log('\n✅ CRM seed completed successfully!');
    console.log(`   Objects: 4`);
    console.log(`   Fields: 28`);
    console.log(`   Records: 16`);
    console.log(`   Relationships: 5`);
  } catch (error: any) {
    console.error('\n❌ CRM seed failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

seedCRM();
