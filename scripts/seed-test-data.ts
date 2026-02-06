#!/usr/bin/env npx tsx
/**
 * Seed Test Data Script
 *
 * Kullanım:
 *   npx tsx scripts/seed-test-data.ts
 *
 * Gereksinimler:
 *   - Backend çalışıyor olmalı (http://localhost:8000)
 *   - Geçerli bir JWT token'ı olmalı
 *
 * Token'ı şu şekilde al:
 *   1. Tarayıcıda login ol
 *   2. DevTools > Application > Local Storage > access_token
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';

// Token'ı environment variable'dan veya argümandan al
const TOKEN = process.env.AUTH_TOKEN || process.argv[2];

if (!TOKEN) {
  console.error(`
❌ AUTH_TOKEN gerekli!

Kullanım:
  AUTH_TOKEN=<token> npx tsx scripts/seed-test-data.ts

veya:
  npx tsx scripts/seed-test-data.ts <token>

Token'ı almak için:
  1. Tarayıcıda http://localhost:5173/login adresine git
  2. Login ol
  3. DevTools > Application > Local Storage > access_token değerini kopyala
`);
  process.exit(1);
}

// Axios client oluştur
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Field tanımları
const FIELD_DEFINITIONS = [
  { name: 'full_name', label: 'Full Name', type: 'text', category: 'contact' },
  { name: 'email', label: 'Email', type: 'email', category: 'contact' },
  { name: 'phone', label: 'Phone', type: 'phone', category: 'contact' },
  { name: 'company', label: 'Company', type: 'text', category: 'contact' },
  { name: 'notes', label: 'Notes', type: 'textarea', category: 'contact' },
];

// Object tanımı
const OBJECT_DEFINITION = {
  name: 'test_contact',
  label: 'Test Contact',
  plural_name: 'Test Contacts',
  description: 'Contact records for E2E testing',
  icon: 'users',
};

// Örnek kayıtlar
const SAMPLE_RECORDS = [
  { full_name: 'John Doe', email: 'john@example.com', phone: '+1 555 123 4567', company: 'Acme Inc', notes: 'VIP customer' },
  { full_name: 'Jane Smith', email: 'jane@example.com', phone: '+1 555 234 5678', company: 'TechCorp', notes: 'New lead' },
  { full_name: 'Bob Wilson', email: 'bob@example.com', phone: '+1 555 345 6789', company: 'StartupXYZ', notes: 'Partner contact' },
  { full_name: 'Alice Brown', email: 'alice@example.com', phone: '+1 555 456 7890', company: 'BigCo', notes: 'Support case' },
  { full_name: 'Charlie Davis', email: 'charlie@example.com', phone: '+1 555 567 8901', company: 'SmallBiz', notes: 'Prospect' },
];

interface Field {
  id: string;
  name: string;
  label: string;
  type: string;
}

interface CustomObject {
  id: string;
  name: string;
  label: string;
}

async function main() {
  console.log('🌱 Records Test Data Seeder');
  console.log('============================\n');
  console.log(`API URL: ${API_BASE_URL}`);
  console.log(`Token: ${TOKEN.substring(0, 20)}...`);
  console.log('');

  try {
    // Token'ı test et
    console.log('🔐 Testing authentication...');
    const meResponse = await apiClient.get('/api/auth/me');
    console.log(`   ✅ Logged in as: ${meResponse.data.email}\n`);

    // 1. Fields oluştur
    console.log('📝 Creating fields...');
    const fields: Field[] = [];
    for (const fieldDef of FIELD_DEFINITIONS) {
      try {
        const response = await apiClient.post('/api/fields', fieldDef);
        fields.push(response.data);
        console.log(`   ✅ Created: ${fieldDef.name} (${response.data.id})`);
      } catch (error: any) {
        if (error.response?.status === 400 || error.response?.status === 409) {
          // Field zaten var, listeden bul
          const listResponse = await apiClient.get('/api/fields');
          const existing = listResponse.data.find((f: Field) => f.name === fieldDef.name);
          if (existing) {
            fields.push(existing);
            console.log(`   ⚠️ Exists: ${fieldDef.name} (${existing.id})`);
          }
        } else {
          throw error;
        }
      }
    }
    console.log('');

    // 2. Object oluştur
    console.log('📦 Creating object...');
    let object: CustomObject;
    try {
      const response = await apiClient.post('/api/objects', OBJECT_DEFINITION);
      object = response.data;
      console.log(`   ✅ Created: ${object.name} (${object.id})\n`);
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 409) {
        const listResponse = await apiClient.get('/api/objects');
        const existing = listResponse.data.find((o: CustomObject) => o.name === OBJECT_DEFINITION.name);
        if (existing) {
          object = existing;
          console.log(`   ⚠️ Exists: ${existing.name} (${existing.id})\n`);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    // 3. Object-Field bağlantıları
    console.log('🔗 Creating object-field relationships...');
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      try {
        await apiClient.post('/api/object-fields', {
          object_id: object.id,
          field_id: field.id,
          is_required: i < 2, // full_name ve email required
          is_visible: true,
          is_primary: i === 0, // full_name primary field
          display_order: i,
        });
        console.log(`   ✅ Linked: ${field.name} -> ${object.name}`);
      } catch (error: any) {
        if (error.response?.status === 400 || error.response?.status === 409) {
          console.log(`   ⚠️ Already linked: ${field.name} -> ${object.name}`);
        } else {
          console.log(`   ❌ Failed: ${field.name} - ${error.response?.data?.detail || error.message}`);
        }
      }
    }
    console.log('');

    // 4. Field name -> id mapping
    const fieldNameToId: Record<string, string> = {};
    for (const field of fields) {
      fieldNameToId[field.name] = field.id;
    }

    // 5. Records oluştur
    console.log('📄 Creating records...');
    const recordIds: string[] = [];
    for (const recordData of SAMPLE_RECORDS) {
      const data: Record<string, any> = {};
      for (const [fieldName, value] of Object.entries(recordData)) {
        const fieldId = fieldNameToId[fieldName];
        if (fieldId) {
          data[fieldId] = value;
        }
      }

      try {
        const response = await apiClient.post('/api/records', {
          object_id: object.id,
          data,
        });
        recordIds.push(response.data.id);
        console.log(`   ✅ Created: ${recordData.full_name} (${response.data.id})`);
      } catch (error: any) {
        console.log(`   ❌ Failed: ${recordData.full_name} - ${error.response?.data?.detail || error.message}`);
      }
    }
    console.log('');

    // Sonuç
    console.log('============================');
    console.log('🎉 Seed completed!\n');
    console.log(`   Object ID: ${object.id}`);
    console.log(`   Object Name: ${object.name}`);
    console.log(`   Fields: ${fields.length}`);
    console.log(`   Records: ${recordIds.length}`);
    console.log('');
    console.log('📋 Test URL:');
    console.log(`   http://localhost:5173/objects/${object.id}/records`);
    console.log('');

  } catch (error: any) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
