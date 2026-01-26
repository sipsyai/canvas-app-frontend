#!/bin/bash
#
# Records Test Data Seeder
#
# Kullanım:
#   ./scripts/seed-test-data.sh <AUTH_TOKEN>
#
# Token'ı almak için:
#   1. Tarayıcıda login ol
#   2. DevTools > Application > Local Storage > access_token
#

set -e

API_URL="${API_URL:-http://localhost:8000}"
TOKEN="${1:-$AUTH_TOKEN}"

if [ -z "$TOKEN" ]; then
  echo "❌ AUTH_TOKEN gerekli!"
  echo ""
  echo "Kullanım:"
  echo "  ./scripts/seed-test-data.sh <token>"
  echo ""
  echo "veya:"
  echo "  AUTH_TOKEN=<token> ./scripts/seed-test-data.sh"
  exit 1
fi

echo "🌱 Records Test Data Seeder"
echo "============================"
echo ""
echo "API URL: $API_URL"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Test authentication
echo "🔐 Testing authentication..."
ME=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/auth/me")
EMAIL=$(echo "$ME" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
if [ -z "$EMAIL" ]; then
  echo "❌ Authentication failed!"
  echo "$ME"
  exit 1
fi
echo "   ✅ Logged in as: $EMAIL"
echo ""

# Create fields
echo "📝 Creating fields..."

create_field() {
  local name=$1
  local label=$2
  local type=$3

  RESULT=$(curl -s -X POST "$API_URL/api/fields" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\",\"label\":\"$label\",\"type\":\"$type\",\"category\":\"contact\"}")

  ID=$(echo "$RESULT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -n "$ID" ]; then
    echo "   ✅ Created: $name ($ID)"
    echo "$ID"
  else
    # Field might exist, try to find it
    FIELDS=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/fields")
    ID=$(echo "$FIELDS" | grep -o "\"id\":\"[^\"]*\",\"name\":\"$name\"" | grep -o 'fld_[^"]*' | head -1)
    if [ -n "$ID" ]; then
      echo "   ⚠️ Exists: $name ($ID)"
      echo "$ID"
    else
      echo "   ❌ Failed: $name"
      echo ""
    fi
  fi
}

FIELD_FULL_NAME=$(create_field "full_name" "Full Name" "text")
FIELD_EMAIL=$(create_field "email" "Email" "email")
FIELD_PHONE=$(create_field "phone" "Phone" "phone")
FIELD_COMPANY=$(create_field "company" "Company" "text")
FIELD_NOTES=$(create_field "notes" "Notes" "textarea")
echo ""

# Create object
echo "📦 Creating object..."
OBJECT_RESULT=$(curl -s -X POST "$API_URL/api/objects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"test_contact","label":"Test Contact","plural_name":"Test Contacts","description":"Contact records for E2E testing","icon":"users"}')

OBJECT_ID=$(echo "$OBJECT_RESULT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$OBJECT_ID" ]; then
  # Object might exist
  OBJECTS=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/objects")
  OBJECT_ID=$(echo "$OBJECTS" | grep -o '"id":"[^"]*","name":"test_contact"' | grep -o 'obj_[^"]*' | head -1)
  if [ -n "$OBJECT_ID" ]; then
    echo "   ⚠️ Exists: test_contact ($OBJECT_ID)"
  else
    echo "   ❌ Failed to create object"
    exit 1
  fi
else
  echo "   ✅ Created: test_contact ($OBJECT_ID)"
fi
echo ""

# Create object-field relationships
echo "🔗 Creating object-field relationships..."

link_field() {
  local field_id=$1
  local field_name=$2
  local is_required=$3
  local is_primary=$4
  local order=$5

  if [ -z "$field_id" ]; then
    echo "   ⚠️ Skipping $field_name (no ID)"
    return
  fi

  RESULT=$(curl -s -X POST "$API_URL/api/object-fields" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"object_id\":\"$OBJECT_ID\",\"field_id\":\"$field_id\",\"is_required\":$is_required,\"is_visible\":true,\"is_primary\":$is_primary,\"display_order\":$order}")

  if echo "$RESULT" | grep -q '"id"'; then
    echo "   ✅ Linked: $field_name"
  else
    echo "   ⚠️ Already linked or failed: $field_name"
  fi
}

link_field "$FIELD_FULL_NAME" "full_name" "true" "true" "0"
link_field "$FIELD_EMAIL" "email" "true" "false" "1"
link_field "$FIELD_PHONE" "phone" "false" "false" "2"
link_field "$FIELD_COMPANY" "company" "false" "false" "3"
link_field "$FIELD_NOTES" "notes" "false" "false" "4"
echo ""

# Create records
echo "📄 Creating records..."

create_record() {
  local full_name=$1
  local email=$2
  local phone=$3
  local company=$4
  local notes=$5

  DATA="{\"object_id\":\"$OBJECT_ID\",\"data\":{"
  [ -n "$FIELD_FULL_NAME" ] && DATA+="\"$FIELD_FULL_NAME\":\"$full_name\","
  [ -n "$FIELD_EMAIL" ] && DATA+="\"$FIELD_EMAIL\":\"$email\","
  [ -n "$FIELD_PHONE" ] && DATA+="\"$FIELD_PHONE\":\"$phone\","
  [ -n "$FIELD_COMPANY" ] && DATA+="\"$FIELD_COMPANY\":\"$company\","
  [ -n "$FIELD_NOTES" ] && DATA+="\"$FIELD_NOTES\":\"$notes\""
  DATA+="}}"

  # Remove trailing comma if present
  DATA=$(echo "$DATA" | sed 's/,}/}/g')

  RESULT=$(curl -s -X POST "$API_URL/api/records" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$DATA")

  REC_ID=$(echo "$RESULT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -n "$REC_ID" ]; then
    echo "   ✅ Created: $full_name ($REC_ID)"
  else
    echo "   ❌ Failed: $full_name"
  fi
}

create_record "John Doe" "john@example.com" "+1 555 123 4567" "Acme Inc" "VIP customer"
create_record "Jane Smith" "jane@example.com" "+1 555 234 5678" "TechCorp" "New lead"
create_record "Bob Wilson" "bob@example.com" "+1 555 345 6789" "StartupXYZ" "Partner contact"
create_record "Alice Brown" "alice@example.com" "+1 555 456 7890" "BigCo" "Support case"
create_record "Charlie Davis" "charlie@example.com" "+1 555 567 8901" "SmallBiz" "Prospect"
echo ""

# Summary
echo "============================"
echo "🎉 Seed completed!"
echo ""
echo "   Object ID: $OBJECT_ID"
echo ""
echo "📋 Test URL:"
echo "   http://localhost:5173/objects/$OBJECT_ID/records"
echo ""
