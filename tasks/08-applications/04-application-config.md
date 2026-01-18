# Task: Application Configuration

**Priority:** 🟡 Medium
**Estimated Time:** 2 gün
**Dependencies:** 02-create-application

---

## Objective

Application'ların konfigürasyonunu düzenlemek için config editor sayfası oluşturmak. Navigation menü, dashboard widget'ları, tema ayarları ve permission ayarlarını JSONB formatında saklamak.

---

## Backend API

### Endpoint
```
PATCH /api/applications/{app_id}
```

### Request Format
**Content-Type:** `application/json`

```typescript
interface UpdateApplicationRequest {
  config?: {
    navigation?: NavigationConfig;
    dashboard?: DashboardConfig;
    theme?: ThemeConfig;
    permissions?: PermissionConfig;
  };
}
```

### Navigation Config Structure
```typescript
interface NavigationConfig {
  enabled_objects: string[];        // ["obj_contact", "obj_company"]
  menu_order: string[];              // ["obj_contact", "obj_company", "obj_opportunity"]
  hidden_objects: string[];          // ["obj_internal_notes"]
  custom_labels?: {
    [objectId: string]: string;      // { "obj_contact": "Müşteriler" }
  };
}
```

### Dashboard Config Structure
```typescript
interface DashboardConfig {
  widgets: Array<{
    id: string;                      // "widget_1"
    type: 'chart' | 'list' | 'stats' | 'calendar';
    title: string;                   // "Son Eklenen Kayıtlar"
    object_id?: string;              // "obj_contact"
    size: 'small' | 'medium' | 'large';
    position: { x: number; y: number; w: number; h: number };
    config?: any;                    // Widget-specific config
  }>;
  layout: 'grid' | 'flex';
}
```

### Theme Config Structure
```typescript
interface ThemeConfig {
  primary_color: string;             // "#3B82F6"
  secondary_color?: string;          // "#8B5CF6"
  logo_url?: string;                 // "https://cdn.example.com/logo.png"
  favicon_url?: string;              // "https://cdn.example.com/favicon.ico"
  custom_css?: string;               // "body { font-family: 'Inter'; }"
}
```

### Permission Config Structure
```typescript
interface PermissionConfig {
  public: boolean;                   // true = herkese açık, false = invite-only
  allowed_users?: string[];          // ["user_123", "user_456"]
  allowed_roles?: string[];          // ["admin", "editor"]
  restricted_objects?: {
    [objectId: string]: string[];    // { "obj_salary": ["admin"] }
  };
}
```

### Response
```json
{
  "id": "app_abc12345",
  "name": "crm",
  "label": "CRM",
  "config": {
    "navigation": {
      "enabled_objects": ["obj_contact", "obj_company"],
      "menu_order": ["obj_contact", "obj_company"],
      "custom_labels": {
        "obj_contact": "Müşteriler"
      }
    },
    "dashboard": {
      "widgets": [
        {
          "id": "widget_1",
          "type": "stats",
          "title": "Toplam Kayıt",
          "object_id": "obj_contact",
          "size": "small",
          "position": { "x": 0, "y": 0, "w": 3, "h": 2 }
        }
      ],
      "layout": "grid"
    },
    "theme": {
      "primary_color": "#3B82F6",
      "logo_url": "https://cdn.example.com/logo.png"
    },
    "permissions": {
      "public": false,
      "allowed_users": ["user_123"]
    }
  },
  "updated_at": "2025-01-18T12:00:00Z"
}
```

### Error Responses
- `404 Not Found` - Application bulunamadı
- `403 Forbidden` - Permission yok (sadece creator düzenleyebilir)
- `422 Unprocessable Entity` - Validation hatası

**Backend Documentation:**
→ [PATCH /api/applications/{app_id}](../../backend-docs/api/08-applications/03-update-application.md)

---

## UI/UX Design

### Page Layout
```
┌─────────────────────────────────────────────────────┐
│  < Back to App          [Preview] [Save Changes]   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [Navigation] [Dashboard] [Theme] [Permissions]     │ ← Tabs
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  NAVIGATION CONFIG                             │ │
│  │                                                │ │
│  │  Enabled Objects:                              │ │
│  │  [x] Contacts (obj_contact)                    │ │
│  │  [x] Companies (obj_company)                   │ │
│  │  [ ] Opportunities (obj_opportunity)           │ │
│  │                                                │ │
│  │  Menu Order: (drag to reorder)                │ │
│  │  ≡ Contacts                                    │ │
│  │  ≡ Companies                                   │ │
│  │                                                │ │
│  │  Custom Labels:                                │ │
│  │  Contacts → [Müşteriler    ]                   │ │
│  │  Companies → [Firmalar     ]                   │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  LIVE PREVIEW                                  │ │
│  │  ┌──────────────────────┐                      │ │
│  │  │ • Müşteriler         │                      │ │
│  │  │ • Firmalar           │                      │ │
│  │  └──────────────────────┘                      │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Dashboard Config Tab
```
┌─────────────────────────────────────────────────────┐
│  DASHBOARD CONFIG                                    │
│                                                      │
│  Layout: (•) Grid  ( ) Flex                         │
│                                                      │
│  Widgets:                              [Add Widget] │
│  ┌────────────────────────────────────────────────┐ │
│  │ Widget 1: Toplam Kayıt                    [x]  │ │
│  │ Type: Stats | Object: Contacts | Size: Small  │ │
│  │ Position: x:0, y:0, w:3, h:2                  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ Widget 2: Son Eklenenler                  [x]  │ │
│  │ Type: List | Object: Contacts | Size: Medium  │ │
│  │ Position: x:3, y:0, w:6, h:4                  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  PREVIEW:                                            │
│  ┌─────┬──────────────────┐                        │
│  │ 120 │ Son Eklenenler   │                        │
│  │     │ • Ali Yılmaz     │                        │
│  │     │ • Ayşe Kaya      │                        │
│  └─────┴──────────────────┘                        │
└─────────────────────────────────────────────────────┘
```

### Theme Config Tab
```
┌─────────────────────────────────────────────────────┐
│  THEME CONFIG                                        │
│                                                      │
│  Primary Color:   [#3B82F6] ████                    │
│  Secondary Color: [#8B5CF6] ████                    │
│                                                      │
│  Logo:                                               │
│  [Upload Logo]  or  [Enter URL]                     │
│  https://cdn.example.com/logo.png                   │
│                                                      │
│  Favicon:                                            │
│  [Upload Icon]  or  [Enter URL]                     │
│  https://cdn.example.com/favicon.ico                │
│                                                      │
│  Custom CSS: (Advanced)                              │
│  ┌────────────────────────────────────────────────┐ │
│  │ body {                                         │ │
│  │   font-family: 'Inter', sans-serif;            │ │
│  │ }                                              │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  PREVIEW:                                            │
│  ┌────────────────────────────────────────────────┐ │
│  │ [LOGO]  My CRM App                             │ │
│  │ ████████████████████ (primary color)           │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Permissions Config Tab
```
┌─────────────────────────────────────────────────────┐
│  PERMISSIONS CONFIG                                  │
│                                                      │
│  Visibility:                                         │
│  ( ) Public - Herkese açık                          │
│  (•) Private - Sadece yetkili kullanıcılar          │
│                                                      │
│  Allowed Users:                                      │
│  [Search users...]                                   │
│  • Ali Yılmaz (ali@example.com)            [Remove] │
│  • Ayşe Kaya (ayse@example.com)            [Remove] │
│                                                      │
│  Allowed Roles:                                      │
│  [x] Admin                                           │
│  [x] Editor                                          │
│  [ ] Viewer                                          │
│                                                      │
│  Object-Level Restrictions:                          │
│  Salary (obj_salary):                                │
│    Only: [Admin ▼]                                   │
│                                                      │
│  Performance Reviews (obj_review):                   │
│    Only: [Admin, Manager ▼]                          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── applications/
│       ├── pages/
│       │   └── ApplicationConfigPage.tsx      ⭐ Main config page
│       ├── components/
│       │   ├── ConfigEditor.tsx               ⭐ Tab container
│       │   ├── NavigationBuilder.tsx          ⭐ Navigation config
│       │   ├── DashboardBuilder.tsx           ⭐ Dashboard config
│       │   ├── ThemeEditor.tsx                ⭐ Theme config
│       │   ├── PermissionsEditor.tsx          ⭐ Permissions config
│       │   ├── ConfigPreview.tsx              ⭐ Live preview
│       │   └── WidgetEditor.tsx               ⭐ Dashboard widget editor
│       ├── hooks/
│       │   ├── useUpdateAppConfig.ts          ⭐ Update config mutation
│       │   └── useAppObjects.ts               ⭐ Get app objects
│       └── types/
│           └── config.types.ts                ⭐ Config types
└── lib/
    └── api/
        └── applications.api.ts                 ⭐ API calls
```

### Component Implementation

#### ApplicationConfigPage.tsx
```typescript
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getApplicationAPI } from '@/lib/api/applications.api';
import { ConfigEditor } from '../components/ConfigEditor';
import { ConfigPreview } from '../components/ConfigPreview';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useUpdateAppConfig } from '../hooks/useUpdateAppConfig';

type ConfigTab = 'navigation' | 'dashboard' | 'theme' | 'permissions';

export const ApplicationConfigPage = () => {
  const { appId } = useParams<{ appId: string }>();
  const [activeTab, setActiveTab] = useState<ConfigTab>('navigation');
  const [showPreview, setShowPreview] = useState(true);

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', appId],
    queryFn: () => getApplicationAPI(appId!),
  });

  const { mutate: updateConfig, isPending } = useUpdateAppConfig(appId!);

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (!app) {
    return <div>Application bulunamadı</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            ← Geri
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{app.label} - Konfigürasyon</h1>
            <p className="text-sm text-gray-600">{app.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Preview Gizle' : 'Preview Göster'}
          </Button>
          <Button
            onClick={() => updateConfig(app.config)}
            loading={isPending}
          >
            Değişiklikleri Kaydet
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Config Editor */}
        <div className={`flex-1 overflow-auto ${showPreview ? 'border-r' : ''}`}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ConfigTab)}>
            <TabsList className="border-b border-gray-200 px-6">
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="theme">Tema</TabsTrigger>
              <TabsTrigger value="permissions">İzinler</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <ConfigEditor
                activeTab={activeTab}
                config={app.config}
                appId={app.id}
              />
            </div>
          </Tabs>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="w-96 bg-gray-100 overflow-auto">
            <ConfigPreview
              config={app.config}
              activeTab={activeTab}
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

#### ConfigEditor.tsx
```typescript
import { NavigationBuilder } from './NavigationBuilder';
import { DashboardBuilder } from './DashboardBuilder';
import { ThemeEditor } from './ThemeEditor';
import { PermissionsEditor } from './PermissionsEditor';
import { ApplicationConfig } from '../types/config.types';

interface ConfigEditorProps {
  activeTab: 'navigation' | 'dashboard' | 'theme' | 'permissions';
  config: ApplicationConfig;
  appId: string;
}

export const ConfigEditor = ({ activeTab, config, appId }: ConfigEditorProps) => {
  return (
    <div>
      {activeTab === 'navigation' && (
        <NavigationBuilder config={config.navigation} appId={appId} />
      )}
      {activeTab === 'dashboard' && (
        <DashboardBuilder config={config.dashboard} appId={appId} />
      )}
      {activeTab === 'theme' && (
        <ThemeEditor config={config.theme} appId={appId} />
      )}
      {activeTab === 'permissions' && (
        <PermissionsEditor config={config.permissions} appId={appId} />
      )}
    </div>
  );
};
```

#### NavigationBuilder.tsx
```typescript
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { NavigationConfig } from '../types/config.types';
import { useAppObjects } from '../hooks/useAppObjects';

interface NavigationBuilderProps {
  config?: NavigationConfig;
  appId: string;
}

export const NavigationBuilder = ({ config, appId }: NavigationBuilderProps) => {
  const { data: objects = [] } = useAppObjects(appId);

  const [enabledObjects, setEnabledObjects] = useState<string[]>(
    config?.enabled_objects || []
  );
  const [menuOrder, setMenuOrder] = useState<string[]>(
    config?.menu_order || []
  );
  const [customLabels, setCustomLabels] = useState<Record<string, string>>(
    config?.custom_labels || {}
  );

  const handleToggleObject = (objectId: string) => {
    setEnabledObjects((prev) =>
      prev.includes(objectId)
        ? prev.filter((id) => id !== objectId)
        : [...prev, objectId]
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(menuOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMenuOrder(items);
  };

  const handleCustomLabel = (objectId: string, label: string) => {
    setCustomLabels((prev) => ({
      ...prev,
      [objectId]: label,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Enabled Objects */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Enabled Objects</h3>
        <div className="space-y-2">
          {objects.map((obj) => (
            <div key={obj.id} className="flex items-center gap-3">
              <Checkbox
                checked={enabledObjects.includes(obj.id)}
                onChange={() => handleToggleObject(obj.id)}
              />
              <span className="flex-1">{obj.label}</span>
              <span className="text-sm text-gray-500">({obj.name})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Order */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Menü Sırası</h3>
        <p className="text-sm text-gray-600 mb-3">
          Sürükleyerek sıralayın
        </p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="menu-order">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {menuOrder.map((objectId, index) => {
                  const obj = objects.find((o) => o.id === objectId);
                  if (!obj) return null;

                  return (
                    <Draggable key={objectId} draggableId={objectId} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-sm"
                        >
                          <span className="text-gray-400">≡</span>
                          <span className="flex-1">{obj.label}</span>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Custom Labels */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Custom Labels</h3>
        <div className="space-y-3">
          {enabledObjects.map((objectId) => {
            const obj = objects.find((o) => o.id === objectId);
            if (!obj) return null;

            return (
              <div key={objectId} className="flex items-center gap-3">
                <span className="w-32 text-sm">{obj.label}</span>
                <span className="text-gray-400">→</span>
                <Input
                  placeholder={obj.label}
                  value={customLabels[objectId] || ''}
                  onChange={(e) => handleCustomLabel(objectId, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
```

#### DashboardBuilder.tsx
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DashboardConfig, DashboardWidget } from '../types/config.types';
import { WidgetEditor } from './WidgetEditor';

interface DashboardBuilderProps {
  config?: DashboardConfig;
  appId: string;
}

export const DashboardBuilder = ({ config, appId }: DashboardBuilderProps) => {
  const [layout, setLayout] = useState<'grid' | 'flex'>(config?.layout || 'grid');
  const [widgets, setWidgets] = useState<DashboardWidget[]>(config?.widgets || []);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);

  const handleAddWidget = () => {
    const newWidget: DashboardWidget = {
      id: `widget_${Date.now()}`,
      type: 'stats',
      title: 'Yeni Widget',
      size: 'medium',
      position: { x: 0, y: 0, w: 4, h: 3 },
    };
    setWidgets([...widgets, newWidget]);
    setEditingWidget(newWidget);
  };

  const handleUpdateWidget = (widget: DashboardWidget) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widget.id ? widget : w))
    );
    setEditingWidget(null);
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  return (
    <div className="space-y-6">
      {/* Layout Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Layout</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="grid"
              checked={layout === 'grid'}
              onChange={(e) => setLayout(e.target.value as 'grid')}
            />
            <span>Grid</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="flex"
              checked={layout === 'flex'}
              onChange={(e) => setLayout(e.target.value as 'flex')}
            />
            <span>Flex</span>
          </label>
        </div>
      </div>

      {/* Widgets List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Widgets</h3>
          <Button onClick={handleAddWidget}>+ Widget Ekle</Button>
        </div>

        <div className="space-y-3">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between"
            >
              <div className="flex-1">
                <h4 className="font-semibold">{widget.title}</h4>
                <p className="text-sm text-gray-600">
                  Type: {widget.type} | Size: {widget.size}
                  {widget.object_id && ` | Object: ${widget.object_id}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Position: x:{widget.position.x}, y:{widget.position.y},
                  w:{widget.position.w}, h:{widget.position.h}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingWidget(widget)}
                >
                  Düzenle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteWidget(widget.id)}
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Widget Editor Modal */}
      {editingWidget && (
        <WidgetEditor
          widget={editingWidget}
          appId={appId}
          onSave={handleUpdateWidget}
          onCancel={() => setEditingWidget(null)}
        />
      )}
    </div>
  );
};
```

#### ThemeEditor.tsx
```typescript
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemeConfig } from '../types/config.types';

interface ThemeEditorProps {
  config?: ThemeConfig;
  appId: string;
}

export const ThemeEditor = ({ config, appId }: ThemeEditorProps) => {
  const [primaryColor, setPrimaryColor] = useState(config?.primary_color || '#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState(config?.secondary_color || '#8B5CF6');
  const [logoUrl, setLogoUrl] = useState(config?.logo_url || '');
  const [faviconUrl, setFaviconUrl] = useState(config?.favicon_url || '');
  const [customCss, setCustomCss] = useState(config?.custom_css || '');

  const handleLogoUpload = async (file: File) => {
    // TODO: Upload to CDN and get URL
    console.log('Uploading logo:', file);
  };

  return (
    <div className="space-y-6">
      {/* Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Renkler</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="w-32 text-sm">Primary Color:</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-20 h-10 rounded border border-gray-300"
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#3B82F6"
              className="flex-1"
            />
            <div
              className="w-16 h-10 rounded border border-gray-300"
              style={{ backgroundColor: primaryColor }}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-32 text-sm">Secondary Color:</label>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-20 h-10 rounded border border-gray-300"
            />
            <Input
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              placeholder="#8B5CF6"
              className="flex-1"
            />
            <div
              className="w-16 h-10 rounded border border-gray-300"
              style={{ backgroundColor: secondaryColor }}
            />
          </div>
        </div>
      </div>

      {/* Logo */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Logo</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button variant="outline">
              Logo Yükle
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                className="hidden"
              />
            </Button>
            <span className="text-sm text-gray-600">veya URL girin</span>
          </div>
          <Input
            placeholder="https://cdn.example.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
          {logoUrl && (
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <img src={logoUrl} alt="Logo Preview" className="h-12 object-contain" />
            </div>
          )}
        </div>
      </div>

      {/* Favicon */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Favicon</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button variant="outline">Favicon Yükle</Button>
            <span className="text-sm text-gray-600">veya URL girin</span>
          </div>
          <Input
            placeholder="https://cdn.example.com/favicon.ico"
            value={faviconUrl}
            onChange={(e) => setFaviconUrl(e.target.value)}
          />
        </div>
      </div>

      {/* Custom CSS */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Custom CSS (Advanced)</h3>
        <textarea
          className="w-full h-40 border border-gray-300 rounded-lg p-3 font-mono text-sm"
          placeholder="body { font-family: 'Inter', sans-serif; }"
          value={customCss}
          onChange={(e) => setCustomCss(e.target.value)}
        />
      </div>
    </div>
  );
};
```

#### PermissionsEditor.tsx
```typescript
import { useState } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { PermissionConfig } from '../types/config.types';

interface PermissionsEditorProps {
  config?: PermissionConfig;
  appId: string;
}

export const PermissionsEditor = ({ config, appId }: PermissionsEditorProps) => {
  const [isPublic, setIsPublic] = useState(config?.public || false);
  const [allowedUsers, setAllowedUsers] = useState<string[]>(config?.allowed_users || []);
  const [allowedRoles, setAllowedRoles] = useState<string[]>(config?.allowed_roles || []);
  const [restrictedObjects, setRestrictedObjects] = useState<Record<string, string[]>>(
    config?.restricted_objects || {}
  );

  const handleToggleRole = (role: string) => {
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="space-y-6">
      {/* Visibility */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Görünürlük</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              checked={isPublic}
              onChange={() => setIsPublic(true)}
            />
            <div>
              <span className="font-medium">Public</span>
              <p className="text-sm text-gray-600">Herkese açık</p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              checked={!isPublic}
              onChange={() => setIsPublic(false)}
            />
            <div>
              <span className="font-medium">Private</span>
              <p className="text-sm text-gray-600">Sadece yetkili kullanıcılar</p>
            </div>
          </label>
        </div>
      </div>

      {/* Allowed Users */}
      {!isPublic && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Yetkili Kullanıcılar</h3>
          <div className="space-y-2">
            {/* TODO: Add user search and selection */}
            <p className="text-sm text-gray-600">
              Kullanıcı arama ve ekleme özelliği yakında...
            </p>
          </div>
        </div>
      )}

      {/* Allowed Roles */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Yetkili Roller</h3>
        <div className="space-y-2">
          {['admin', 'editor', 'viewer'].map((role) => (
            <div key={role} className="flex items-center gap-3">
              <Checkbox
                checked={allowedRoles.includes(role)}
                onChange={() => handleToggleRole(role)}
              />
              <span className="capitalize">{role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Object-Level Restrictions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Object-Level Kısıtlamalar</h3>
        <p className="text-sm text-gray-600 mb-3">
          Hassas object'lere erişimi kısıtlayın
        </p>
        <div className="space-y-3">
          {/* TODO: Add object restriction configuration */}
          <p className="text-sm text-gray-600">
            Object kısıtlama özelliği yakında...
          </p>
        </div>
      </div>
    </div>
  );
};
```

#### ConfigPreview.tsx
```typescript
import { ApplicationConfig } from '../types/config.types';

interface ConfigPreviewProps {
  config: ApplicationConfig;
  activeTab: 'navigation' | 'dashboard' | 'theme' | 'permissions';
}

export const ConfigPreview = ({ config, activeTab }: ConfigPreviewProps) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Live Preview</h3>

      {activeTab === 'navigation' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <nav className="space-y-2">
            {config.navigation?.menu_order?.map((objectId) => {
              const label = config.navigation?.custom_labels?.[objectId] || objectId;
              return (
                <div
                  key={objectId}
                  className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer"
                >
                  • {label}
                </div>
              );
            })}
          </nav>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-12 gap-4">
            {config.dashboard?.widgets?.map((widget) => (
              <div
                key={widget.id}
                className="bg-blue-50 border border-blue-200 rounded p-3"
                style={{
                  gridColumn: `span ${widget.position.w}`,
                  gridRow: `span ${widget.position.h}`,
                }}
              >
                <h4 className="font-semibold text-sm">{widget.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{widget.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'theme' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="space-y-3">
            {config.theme?.logo_url && (
              <img
                src={config.theme.logo_url}
                alt="Logo"
                className="h-10 object-contain"
              />
            )}
            <div
              className="h-8 rounded"
              style={{ backgroundColor: config.theme?.primary_color }}
            />
            <div
              className="h-8 rounded"
              style={{ backgroundColor: config.theme?.secondary_color }}
            />
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">Visibility:</span>{' '}
              {config.permissions?.public ? 'Public' : 'Private'}
            </div>
            {config.permissions?.allowed_roles && (
              <div>
                <span className="font-semibold">Roles:</span>{' '}
                {config.permissions.allowed_roles.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

#### useUpdateAppConfig.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateApplicationAPI } from '@/lib/api/applications.api';
import { ApplicationConfig } from '../types/config.types';

export const useUpdateAppConfig = (appId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: ApplicationConfig) => {
      return await updateApplicationAPI(appId, { config });
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['application', appId] });

      // Show success toast
      console.log('Config updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update config:', error);
    },
  });
};
```

#### useAppObjects.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { getApplicationObjectsAPI } from '@/lib/api/applications.api';

export const useAppObjects = (appId: string) => {
  return useQuery({
    queryKey: ['application', appId, 'objects'],
    queryFn: () => getApplicationObjectsAPI(appId),
  });
};
```

#### config.types.ts
```typescript
export interface NavigationConfig {
  enabled_objects: string[];
  menu_order: string[];
  hidden_objects?: string[];
  custom_labels?: Record<string, string>;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'list' | 'stats' | 'calendar';
  title: string;
  object_id?: string;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config?: any;
}

export interface DashboardConfig {
  widgets: DashboardWidget[];
  layout: 'grid' | 'flex';
}

export interface ThemeConfig {
  primary_color: string;
  secondary_color?: string;
  logo_url?: string;
  favicon_url?: string;
  custom_css?: string;
}

export interface PermissionConfig {
  public: boolean;
  allowed_users?: string[];
  allowed_roles?: string[];
  restricted_objects?: Record<string, string[]>;
}

export interface ApplicationConfig {
  navigation?: NavigationConfig;
  dashboard?: DashboardConfig;
  theme?: ThemeConfig;
  permissions?: PermissionConfig;
}
```

#### applications.api.ts (additions)
```typescript
import axios from 'axios';
import { getAuthToken } from '@/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface UpdateApplicationRequest {
  label?: string;
  description?: string;
  icon?: string;
  color?: string;
  config?: ApplicationConfig;
}

export const updateApplicationAPI = async (
  appId: string,
  data: UpdateApplicationRequest
) => {
  const { data: response } = await apiClient.patch(
    `/api/applications/${appId}`,
    data
  );
  return response;
};

export const getApplicationObjectsAPI = async (appId: string) => {
  const { data } = await apiClient.get(`/api/applications/${appId}/objects`);
  return data;
};
```

---

## Dependencies

### NPM Packages
**Already Installed ✅**
- `@tanstack/react-query` - API state management
- `react-hook-form` - Form management
- `zod` - Schema validation

**To Be Installed ⚠️**
```bash
npm install @hello-pangea/dnd  # Drag and drop for menu ordering
```

### UI Components (To Be Built)
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (React Aria)
- `Select` component (React Aria)
- Color picker component

---

## Acceptance Criteria

- [ ] Config sayfası `/apps/{app_id}/config` route'unda çalışıyor
- [ ] Navigation, Dashboard, Theme, Permissions tabları çalışıyor
- [ ] Navigation builder ile object'ler enable/disable edilebiliyor
- [ ] Menü sıralaması drag-drop ile değiştirilebiliyor
- [ ] Custom label'lar tanımlanabiliyor
- [ ] Dashboard widget'ları eklenip düzenlenebiliyor
- [ ] Theme renkleri değiştirilebiliyor
- [ ] Logo ve favicon upload/URL ile eklenebiliyor
- [ ] Permission ayarları yapılabiliyor (public/private)
- [ ] Live preview çalışıyor (real-time config preview)
- [ ] Config değişiklikleri PATCH endpoint ile kaydediliyor
- [ ] Config JSONB formatında backend'e gönderiliyor
- [ ] Loading ve error state'leri doğru çalışıyor

---

## Testing Checklist

### Manual Testing
- [ ] Navigation tab açılıyor
- [ ] Object'ler seçilebiliyor/kaldırılabiliyor
- [ ] Menü sıralaması değiştirilebiliyor
- [ ] Custom label'lar kaydediliyor
- [ ] Dashboard widget eklenebiliyor
- [ ] Widget düzenlenebiliyor ve silinebiliyor
- [ ] Tema renkleri değiştirilebiliyor
- [ ] Logo URL'i kaydediliyor
- [ ] Permission ayarları kaydediliyor
- [ ] Preview real-time güncelleniyor
- [ ] Kaydet butonu çalışıyor
- [ ] Config başarıyla backend'e kaydediliyor
- [ ] Sayfa yenilendiğinde config korunuyor

### Test Data
```json
{
  "navigation": {
    "enabled_objects": ["obj_contact", "obj_company"],
    "menu_order": ["obj_contact", "obj_company"],
    "custom_labels": {
      "obj_contact": "Müşteriler",
      "obj_company": "Firmalar"
    }
  },
  "dashboard": {
    "widgets": [
      {
        "id": "widget_1",
        "type": "stats",
        "title": "Toplam Kayıt",
        "object_id": "obj_contact",
        "size": "small",
        "position": { "x": 0, "y": 0, "w": 3, "h": 2 }
      }
    ],
    "layout": "grid"
  },
  "theme": {
    "primary_color": "#3B82F6",
    "secondary_color": "#8B5CF6"
  },
  "permissions": {
    "public": false,
    "allowed_roles": ["admin", "editor"]
  }
}
```

---

## Code Examples

### Complete Config Update Flow
```typescript
// 1. User modifies navigation config
// 2. Config state updates locally
// 3. Live preview updates automatically
// 4. User clicks "Save Changes"
// 5. useUpdateAppConfig mutation triggers
// 6. PATCH /api/applications/{app_id} with config JSONB
// 7. Backend validates and saves config
// 8. Success toast shown
// 9. Query cache invalidated
```

### Error Handling
```typescript
export const useUpdateAppConfig = (appId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: ApplicationConfig) => {
      try {
        return await updateApplicationAPI(appId, { config });
      } catch (error: any) {
        if (error.response?.status === 403) {
          throw new Error('Permission denied. Only app creator can modify config.');
        }
        if (error.response?.status === 422) {
          throw new Error('Invalid config format');
        }
        throw new Error('Failed to update config');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] });
      toast.success('Config başarıyla güncellendi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
```

---

## Resources

### Backend Documentation
- [PATCH /api/applications/{app_id}](../../backend-docs/api/08-applications/03-update-application.md) - Update application endpoint
- [Application Config Schema](../../backend-docs/api/08-applications/04-config-schema.md) - JSONB config structure

### Frontend Libraries
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) - Drag and drop
- [TanStack Query Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Application Configuration task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/08-applications/04-application-config.md

Requirements:
1. Create src/features/applications/pages/ApplicationConfigPage.tsx - Main config page with tabs
2. Create src/features/applications/components/ConfigEditor.tsx - Tab container component
3. Create src/features/applications/components/NavigationBuilder.tsx - Navigation config with drag-drop
4. Create src/features/applications/components/DashboardBuilder.tsx - Dashboard widget editor
5. Create src/features/applications/components/ThemeEditor.tsx - Theme customization (colors, logo)
6. Create src/features/applications/components/PermissionsEditor.tsx - Permission settings
7. Create src/features/applications/components/ConfigPreview.tsx - Live preview of changes
8. Create src/features/applications/components/WidgetEditor.tsx - Dashboard widget configuration modal
9. Create src/features/applications/hooks/useUpdateAppConfig.ts - TanStack Query mutation for PATCH
10. Create src/features/applications/hooks/useAppObjects.ts - Get application objects
11. Create src/features/applications/types/config.types.ts - TypeScript type definitions
12. Update src/lib/api/applications.api.ts - Add updateApplicationAPI, getApplicationObjectsAPI

CRITICAL REQUIREMENTS:
- Config stored as JSONB in backend (navigation, dashboard, theme, permissions)
- Navigation builder must support: enable/disable objects, drag-drop menu ordering, custom labels
- Dashboard builder must support: add/edit/delete widgets, grid/flex layout, widget positioning
- Theme editor must support: primary/secondary colors, logo upload/URL, favicon, custom CSS
- Permissions editor must support: public/private visibility, user/role access control
- Live preview panel shows real-time config changes
- Use @hello-pangea/dnd for drag-and-drop menu ordering
- PATCH /api/applications/{app_id} endpoint with { config: {...} }
- Handle 403 (no permission), 404 (not found), 422 (validation) errors
- Show loading states and success/error toasts
- Mobile responsive design with Tailwind CSS 4

Follow the exact code examples and file structure provided in the task file. Use Turkish language for UI text.
```

---

**Status:** 🟡 Pending
**Next Task:** 05-publish-application.md
