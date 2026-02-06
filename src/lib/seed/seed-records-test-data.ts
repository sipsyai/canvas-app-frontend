/**
 * Records Test Data Seeder
 *
 * API üzerinden test verisi oluşturur.
 * Kullanım: Bu dosyayı import edip seedTestData() fonksiyonunu çağır
 *
 * Oluşturacakları:
 * 1. Fields: full_name (text), email (email), phone (phone), notes (textarea)
 * 2. Object: Contact
 * 3. Object-Field bağlantıları
 * 4. Records: 5 adet örnek kayıt
 */

import { fieldsAPI } from '@/lib/api/fields.api';
import { objectsAPI } from '@/lib/api/objects.api';
import { objectFieldsApi } from '@/lib/api/object-fields.api';
import { recordsAPI } from '@/lib/api/records.api';
import type { Field } from '@/types/field.types';
import type { Object } from '@/types/object.types';

// Seed sonucu
export interface SeedResult {
  fields: Field[];
  object: Object;
  objectFieldIds: string[];
  recordIds: string[];
}

// Field tanımları
const FIELD_DEFINITIONS = [
  { name: 'full_name', label: 'Full Name', type: 'text' as const, category: 'contact' },
  { name: 'email', label: 'Email', type: 'email' as const, category: 'contact' },
  { name: 'phone', label: 'Phone', type: 'phone' as const, category: 'contact' },
  { name: 'notes', label: 'Notes', type: 'textarea' as const, category: 'contact' },
];

// Object tanımı
const OBJECT_DEFINITION = {
  name: 'contact',
  label: 'Contact',
  plural_name: 'Contacts',
  description: 'Contact records for testing',
  icon: 'users',
};

// Örnek kayıtlar (field_id'ler dinamik olarak atanacak)
const SAMPLE_RECORDS = [
  { full_name: 'John Doe', email: 'john@example.com', phone: '+1 555 123 4567', notes: 'VIP customer' },
  { full_name: 'Jane Smith', email: 'jane@example.com', phone: '+1 555 234 5678', notes: 'New lead' },
  { full_name: 'Bob Wilson', email: 'bob@example.com', phone: '+1 555 345 6789', notes: 'Partner contact' },
  { full_name: 'Alice Brown', email: 'alice@example.com', phone: '+1 555 456 7890', notes: 'Support case' },
  { full_name: 'Charlie Davis', email: 'charlie@example.com', phone: '+1 555 567 8901', notes: 'Prospect' },
];

/**
 * Test verisi oluşturur
 */
export async function seedTestData(): Promise<SeedResult> {
  console.log('🌱 Starting seed process...');

  // 1. Fields oluştur
  console.log('📝 Creating fields...');
  const fields: Field[] = [];
  for (const fieldDef of FIELD_DEFINITIONS) {
    try {
      const field = await fieldsAPI.create(fieldDef);
      fields.push(field);
      console.log(`  ✅ Field created: ${field.name} (${field.id})`);
    } catch (error: any) {
      // Field zaten varsa, listeden bul
      if (error.response?.status === 400 || error.response?.status === 409) {
        console.log(`  ⚠️ Field might exist: ${fieldDef.name}, fetching...`);
        const existingFields = await fieldsAPI.list({ category: 'contact' });
        const existing = existingFields.find(f => f.name === fieldDef.name);
        if (existing) {
          fields.push(existing);
          console.log(`  ✅ Found existing field: ${existing.name} (${existing.id})`);
        }
      } else {
        throw error;
      }
    }
  }

  // 2. Object oluştur
  console.log('📦 Creating object...');
  let object: Object;
  try {
    object = await objectsAPI.create(OBJECT_DEFINITION);
    console.log(`  ✅ Object created: ${object.name} (${object.id})`);
  } catch (error: any) {
    // Object zaten varsa, listeden bul
    if (error.response?.status === 400 || error.response?.status === 409) {
      console.log(`  ⚠️ Object might exist: ${OBJECT_DEFINITION.name}, fetching...`);
      const existingObjects = await objectsAPI.list();
      const existing = existingObjects.find(o => o.name === OBJECT_DEFINITION.name);
      if (existing) {
        object = existing;
        console.log(`  ✅ Found existing object: ${existing.name} (${existing.id})`);
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  // 3. Object-Field bağlantıları oluştur
  console.log('🔗 Creating object-field relationships...');
  const objectFieldIds: string[] = [];
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    try {
      const objectField = await objectFieldsApi.create({
        object_id: object.id,
        field_id: field.id,
        is_required: i < 2, // full_name ve email required
        is_visible: true,
        display_order: i,
      });
      objectFieldIds.push(objectField.id);
      console.log(`  ✅ Object-field created: ${field.name} -> ${object.name}`);
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 409) {
        console.log(`  ⚠️ Object-field might exist: ${field.name} -> ${object.name}`);
      } else {
        throw error;
      }
    }
  }

  // 4. Field name -> field id mapping oluştur
  const fieldNameToId: Record<string, string> = {};
  for (const field of fields) {
    fieldNameToId[field.name] = field.id;
  }

  // 5. Records oluştur
  console.log('📄 Creating records...');
  const recordIds: string[] = [];
  for (const recordData of SAMPLE_RECORDS) {
    // Record data'yı field_id'lerle eşleştir
    const data: Record<string, any> = {};
    for (const [fieldName, value] of Object.entries(recordData)) {
      const fieldId = fieldNameToId[fieldName];
      if (fieldId) {
        data[fieldId] = value;
      }
    }

    try {
      const record = await recordsAPI.create({
        object_id: object.id,
        data,
      });
      recordIds.push(record.id);
      console.log(`  ✅ Record created: ${recordData.full_name} (${record.id})`);
    } catch (error: any) {
      console.error(`  ❌ Failed to create record: ${recordData.full_name}`, error.response?.data || error.message);
    }
  }

  console.log('🎉 Seed completed!');
  console.log(`   Fields: ${fields.length}`);
  console.log(`   Object: ${object.name} (${object.id})`);
  console.log(`   Records: ${recordIds.length}`);

  return {
    fields,
    object,
    objectFieldIds,
    recordIds,
  };
}

/**
 * Oluşturulan test verilerini siler
 */
export async function cleanupTestData(seedResult: SeedResult): Promise<void> {
  console.log('🧹 Cleaning up test data...');

  // Records sil
  for (const recordId of seedResult.recordIds) {
    try {
      await recordsAPI.delete(recordId);
      console.log(`  ✅ Record deleted: ${recordId}`);
    } catch {
      console.log(`  ⚠️ Could not delete record: ${recordId}`);
    }
  }

  // Object sil (cascade olarak object-fields de silinir)
  try {
    await objectsAPI.delete(seedResult.object.id);
    console.log(`  ✅ Object deleted: ${seedResult.object.id}`);
  } catch {
    console.log(`  ⚠️ Could not delete object: ${seedResult.object.id}`);
  }

  // Fields sil
  for (const field of seedResult.fields) {
    try {
      await fieldsAPI.delete(field.id);
      console.log(`  ✅ Field deleted: ${field.id}`);
    } catch {
      console.log(`  ⚠️ Could not delete field: ${field.id}`);
    }
  }

  console.log('🎉 Cleanup completed!');
}
