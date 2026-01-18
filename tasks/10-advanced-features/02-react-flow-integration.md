# Task: React Flow Integration - Schema Visualization

**Priority:** 🟢 Low
**Estimated Time:** 3 gün
**Dependencies:** 07-relationships, @xyflow/react

---

## Objective

Kullanıcıların veritabanı şemalarını görsel olarak keşfedebilmesi için React Flow tabanlı interaktif workflow editörü oluşturmak. Node'lar objeleri, edge'ler ise ilişkileri temsil edecek.

---

## Backend API

### Endpoints

#### 1. Get Schema Graph Data
```
GET /api/schemas/{schema_id}/graph
```

**Response:**
```json
{
  "nodes": [
    {
      "id": "obj_123",
      "type": "object",
      "data": {
        "name": "Customer",
        "icon": "user",
        "color": "#3B82F6",
        "record_count": 1250,
        "fields_count": 8
      },
      "position": { "x": 100, "y": 100 }
    },
    {
      "id": "obj_456",
      "type": "object",
      "data": {
        "name": "Order",
        "icon": "shopping-cart",
        "color": "#10B981",
        "record_count": 3400,
        "fields_count": 12
      },
      "position": { "x": 400, "y": 100 }
    }
  ],
  "edges": [
    {
      "id": "rel_789",
      "source": "obj_123",
      "target": "obj_456",
      "type": "relationship",
      "data": {
        "name": "has_orders",
        "cardinality": "one-to-many",
        "source_field": "customer_id",
        "target_field": "id"
      }
    }
  ]
}
```

#### 2. Update Node Position
```
PATCH /api/schemas/{schema_id}/objects/{object_id}/position
```

**Request:**
```json
{
  "x": 250,
  "y": 150
}
```

#### 3. Get Object Records (on node click)
```
GET /api/objects/{object_id}/records
```

**Backend Documentation:**
→ [GET /api/schemas/{schema_id}/graph](../../backend-docs/api/05-schema-visualization/01-graph-data.md)

---

## UI/UX Design

### Flow Canvas Layout
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]  Schema Flow: CRM Database          [Export PNG]  │
├─────────────────────────────────────────────────────────────┤
│  [🔍] [⊕] [⊖] [⊡ Fit View] [↻ Auto Layout]   [🗺️ Minimap]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐                ┌──────────────┐          │
│   │  Customer    │                │    Order     │          │
│   │  ───────     │                │  ─────────   │          │
│   │  👤          │──1:M──────────▶│  🛒          │          │
│   │              │  has_orders    │              │          │
│   │  1,250 rows  │                │  3,400 rows  │          │
│   └──────────────┘                └──────────────┘          │
│                                                              │
│          ┌──────────────┐                                   │
│          │   Product    │                                   │
│          │  ─────────   │                                   │
│          │  📦          │                                   │
│          │              │                                   │
│          │  890 rows    │                                   │
│          └──────────────┘                                   │
│                                                              │
│  ┌─────────────────┐                                        │
│  │  🗺️ Minimap     │                                        │
│  │  ┌─────┐        │                                        │
│  │  │ ▪️  │        │                                        │
│  │  │  ▪️ │        │                                        │
│  │  └─────┘        │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### Node Design (ObjectNode)
```
┌──────────────────────┐
│  Customer            │  ← Object name
│  ──────────          │
│  👤                  │  ← Icon
│                      │
│  📊 1,250 records    │  ← Record count
│  🏷️  8 fields        │  ← Field count
│                      │
│  [View Records →]    │  ← Click to view
└──────────────────────┘
```

### Edge Design (RelationshipEdge)
```
Source Node ──1:M──→ Target Node
            ↑
        has_orders
   (relationship name)
```

### Controls
1. **Zoom Controls**
   - Zoom in (+)
   - Zoom out (-)
   - Fit view (⊡)
   - Reset zoom (100%)

2. **Layout Controls**
   - Auto layout (Dagre algorithm)
   - Manual drag & drop
   - Snap to grid (optional)

3. **Minimap**
   - Overview of entire graph
   - Click to navigate
   - Viewport indicator

4. **Export**
   - Export as PNG
   - Export as SVG
   - Export as JSON

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── schema-visualization/
│       ├── pages/
│       │   └── SchemaFlowPage.tsx       ⭐ Main page
│       ├── components/
│       │   ├── SchemaFlow.tsx           ⭐ React Flow container
│       │   ├── nodes/
│       │   │   └── ObjectNode.tsx       ⭐ Custom object node
│       │   ├── edges/
│       │   │   └── RelationshipEdge.tsx ⭐ Custom relationship edge
│       │   ├── controls/
│       │   │   ├── FlowControls.tsx     ⭐ Zoom/Pan controls
│       │   │   └── FlowToolbar.tsx      ⭐ Top toolbar
│       │   └── minimap/
│       │       └── FlowMinimap.tsx      ⭐ Minimap component
│       ├── hooks/
│       │   ├── useSchemaFlow.ts         ⭐ Flow state management
│       │   ├── useAutoLayout.ts         ⭐ Dagre layout algorithm
│       │   └── useExportFlow.ts         ⭐ Export to PNG/SVG
│       └── types/
│           └── flow.types.ts            ⭐ TypeScript types
├── lib/
│   └── api/
│       └── schema-visualization.api.ts  ⭐ API calls
└── utils/
    └── layout.ts                        ⭐ Layout algorithms
```

### Component Implementation

#### SchemaFlowPage.tsx
```typescript
import { useParams } from 'react-router-dom';
import { SchemaFlow } from '../components/SchemaFlow';
import { FlowToolbar } from '../components/controls/FlowToolbar';
import { useSchemaFlow } from '../hooks/useSchemaFlow';

export const SchemaFlowPage = () => {
  const { schemaId } = useParams<{ schemaId: string }>();
  const { nodes, edges, isLoading, error } = useSchemaFlow(schemaId!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error loading schema</p>
          <p className="mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <FlowToolbar schemaId={schemaId!} />
      <div className="flex-1">
        <SchemaFlow nodes={nodes} edges={edges} schemaId={schemaId!} />
      </div>
    </div>
  );
};
```

#### SchemaFlow.tsx
```typescript
import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ObjectNode } from './nodes/ObjectNode';
import { RelationshipEdge } from './edges/RelationshipEdge';

interface SchemaFlowProps {
  nodes: Node[];
  edges: Edge[];
  schemaId: string;
}

const nodeTypes: NodeTypes = {
  object: ObjectNode,
};

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
};

export const SchemaFlow = ({ nodes: initialNodes, edges: initialEdges, schemaId }: SchemaFlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    // Navigate to object records page
    window.location.href = `/objects/${node.id}/records`;
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      attributionPosition="bottom-left"
      className="bg-gray-50"
    >
      <Background color="#e5e7eb" gap={16} />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(node) => {
          const color = node.data?.color || '#3B82F6';
          return color;
        }}
        nodeBorderRadius={8}
        position="bottom-right"
        className="!bg-white !border !border-gray-200 !rounded-lg"
      />
    </ReactFlow>
  );
};
```

#### ObjectNode.tsx
```typescript
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface ObjectNodeData {
  name: string;
  icon: string;
  color: string;
  record_count: number;
  fields_count: number;
}

export const ObjectNode = memo(({ data }: NodeProps<ObjectNodeData>) => {
  const { name, icon, color, record_count, fields_count } = data;

  return (
    <div
      className="bg-white border-2 rounded-xl shadow-lg hover:shadow-xl transition-shadow min-w-[200px]"
      style={{ borderColor: color }}
    >
      {/* Incoming connection handle */}
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />

      {/* Header */}
      <div
        className="px-4 py-3 rounded-t-lg text-white font-semibold"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span>{name}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📊</span>
          <span>{record_count.toLocaleString()} records</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>🏷️</span>
          <span>{fields_count} fields</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View Records →
        </button>
      </div>

      {/* Outgoing connection handle */}
      <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </div>
  );
});

ObjectNode.displayName = 'ObjectNode';
```

#### RelationshipEdge.tsx
```typescript
import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';

interface RelationshipEdgeData {
  name: string;
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-many';
  source_field: string;
  target_field: string;
}

export const RelationshipEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<RelationshipEdgeData>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const cardinalityLabel = {
    'one-to-one': '1:1',
    'one-to-many': '1:M',
    'many-to-many': 'M:M',
  }[data?.cardinality || 'one-to-many'];

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke="#6366f1"
        fill="none"
        markerEnd="url(#arrow)"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="bg-white border border-indigo-200 rounded-md px-2 py-1 text-xs font-medium text-indigo-700"
        >
          <div className="flex items-center gap-1">
            <span>{cardinalityLabel}</span>
            <span className="text-gray-400">•</span>
            <span>{data?.name}</span>
          </div>
        </div>
      </EdgeLabelRenderer>

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#6366f1" />
        </marker>
      </defs>
    </>
  );
});

RelationshipEdge.displayName = 'RelationshipEdge';
```

#### useSchemaFlow.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { Node, Edge } from '@xyflow/react';
import { getSchemaGraphAPI } from '@/lib/api/schema-visualization.api';

interface UseSchemaFlowReturn {
  nodes: Node[];
  edges: Edge[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useSchemaFlow = (schemaId: string): UseSchemaFlowReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['schema-graph', schemaId],
    queryFn: () => getSchemaGraphAPI(schemaId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    nodes: data?.nodes || [],
    edges: data?.edges || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
```

#### useAutoLayout.ts
```typescript
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import dagre from '@dagrejs/dagre';

interface UseAutoLayoutReturn {
  applyLayout: (nodes: Node[], edges: Edge[]) => { nodes: Node[]; edges: Edge[] };
}

export const useAutoLayout = (): UseAutoLayoutReturn => {
  const applyLayout = useCallback((nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', ranksep: 100, nodesep: 50 });

    // Add nodes to dagre graph
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 200, height: 150 });
    });

    // Add edges to dagre graph
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(dagreGraph);

    // Apply calculated positions to nodes
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 100, // Center node (width/2)
          y: nodeWithPosition.y - 75,  // Center node (height/2)
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }, []);

  return { applyLayout };
};
```

#### useExportFlow.ts
```typescript
import { useCallback } from 'react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';

interface UseExportFlowReturn {
  exportToPNG: (filename?: string) => Promise<void>;
  exportToSVG: (filename?: string) => Promise<void>;
  exportToJSON: (filename?: string) => void;
}

export const useExportFlow = (): UseExportFlowReturn => {
  const { getNodes, getEdges } = useReactFlow();

  const exportToPNG = useCallback(async (filename = 'schema-flow.png') => {
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(
      nodesBounds,
      nodesBounds.width,
      nodesBounds.height,
      0.5,
      2
    );

    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    const dataUrl = await toPng(flowElement, {
      backgroundColor: '#f9fafb',
      width: nodesBounds.width * viewport.zoom,
      height: nodesBounds.height * viewport.zoom,
      style: {
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }, [getNodes]);

  const exportToSVG = useCallback(async (filename = 'schema-flow.svg') => {
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    const dataUrl = await toSvg(flowElement, {
      backgroundColor: '#f9fafb',
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }, []);

  const exportToJSON = useCallback((filename = 'schema-flow.json') => {
    const nodes = getNodes();
    const edges = getEdges();

    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  }, [getNodes, getEdges]);

  return { exportToPNG, exportToSVG, exportToJSON };
};
```

#### FlowToolbar.tsx
```typescript
import { useAutoLayout } from '../hooks/useAutoLayout';
import { useExportFlow } from '../hooks/useExportFlow';
import { useReactFlow } from '@xyflow/react';

interface FlowToolbarProps {
  schemaId: string;
}

export const FlowToolbar = ({ schemaId }: FlowToolbarProps) => {
  const { getNodes, getEdges, setNodes, setEdges, fitView } = useReactFlow();
  const { applyLayout } = useAutoLayout();
  const { exportToPNG, exportToSVG, exportToJSON } = useExportFlow();

  const handleAutoLayout = () => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = applyLayout(
      getNodes(),
      getEdges()
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => fitView(), 50);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-lg font-semibold text-gray-900">
            Schema Flow Visualization
          </h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoLayout}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ↻ Auto Layout
          </button>
          <button
            onClick={() => fitView()}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ⊡ Fit View
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="relative group">
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={() => exportToPNG()}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                📸 Export as PNG
              </button>
              <button
                onClick={() => exportToSVG()}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                🎨 Export as SVG
              </button>
              <button
                onClick={() => exportToJSON()}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                📄 Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### schema-visualization.api.ts
```typescript
import axios from 'axios';
import { Node, Edge } from '@xyflow/react';
import { getAuthToken } from '@/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface SchemaGraphResponse {
  nodes: Node[];
  edges: Edge[];
}

export const getSchemaGraphAPI = async (schemaId: string): Promise<SchemaGraphResponse> => {
  const token = getAuthToken();
  const { data } = await axios.get<SchemaGraphResponse>(
    `${API_BASE_URL}/api/schemas/${schemaId}/graph`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

export const updateNodePositionAPI = async (
  schemaId: string,
  objectId: string,
  position: { x: number; y: number }
): Promise<void> => {
  const token = getAuthToken();
  await axios.patch(
    `${API_BASE_URL}/api/schemas/${schemaId}/objects/${objectId}/position`,
    position,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
};
```

#### flow.types.ts
```typescript
import { Node, Edge } from '@xyflow/react';

export interface ObjectNodeData {
  name: string;
  icon: string;
  color: string;
  record_count: number;
  fields_count: number;
}

export interface RelationshipEdgeData {
  name: string;
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-many';
  source_field: string;
  target_field: string;
}

export type SchemaFlowNode = Node<ObjectNodeData>;
export type SchemaFlowEdge = Edge<RelationshipEdgeData>;

export interface SchemaGraphData {
  nodes: SchemaFlowNode[];
  edges: SchemaFlowEdge[];
}
```

---

## Dependencies

### NPM Packages (To Install)
```bash
npm install @xyflow/react@12
npm install @dagrejs/dagre
npm install @types/dagre -D
npm install html-to-image
```

### Already Installed ✅
- `@tanstack/react-query` - API state management
- `axios` - HTTP client
- `react-router-dom` - Navigation

---

## Acceptance Criteria

- [ ] Schema flow sayfası `/schemas/:schemaId/flow` route'unda çalışıyor
- [ ] Object'ler node olarak görüntüleniyor (custom ObjectNode)
- [ ] Relationship'ler edge olarak görüntüleniyor (custom RelationshipEdge)
- [ ] Zoom in/out çalışıyor (Controls)
- [ ] Pan (sürükle) çalışıyor
- [ ] Minimap görünüyor ve çalışıyor
- [ ] Auto layout butonu çalışıyor (Dagre algorithm)
- [ ] Fit view butonu çalışıyor
- [ ] Node'a tıklayınca records sayfasına gidiyor
- [ ] Export PNG çalışıyor
- [ ] Export SVG çalışıyor
- [ ] Export JSON çalışıyor
- [ ] Loading state çalışıyor
- [ ] Error handling çalışıyor
- [ ] Mobile responsive (touch controls)

---

## Testing Checklist

### Manual Testing
- [ ] Flow yükleniyor ve görüntüleniyor
- [ ] Node'lar doğru pozisyonda
- [ ] Edge'ler doğru bağlantıları gösteriyor
- [ ] Zoom in/out smooth çalışıyor
- [ ] Pan (sürükle) smooth çalışıyor
- [ ] Minimap doğru overview gösteriyor
- [ ] Auto layout düzgün layout oluşturuyor
- [ ] Fit view tüm node'ları gösteriyor
- [ ] Node click → records sayfası
- [ ] Export PNG → dosya indiriliyor
- [ ] Export SVG → dosya indiriliyor
- [ ] Export JSON → valid JSON
- [ ] Mobile touch controls çalışıyor
- [ ] Performance: 50+ nodes ile smooth

---

## Real-World Examples

### Example 1: CRM Schema Visualization
```
Customer ──1:M──→ Order ──M:M──→ Product
    ↓                ↓
   1:M              1:M
    ↓                ↓
 Address         Payment
```

**Use Case:**
- Sales team veritabanı şemasını görsel olarak anlıyor
- Customer → Order ilişkisini görerek data flow'u anlıyor
- Node'a tıklayarak direkt customer records'a gidiyor

### Example 2: E-Commerce Database ERD
```
User ──1:1──→ Cart ──M:M──→ Product
  ↓                           ↑
 1:M                         M:1
  ↓                           ↓
Order ──────1:M─────→ OrderItem
  ↓
 1:M
  ↓
Payment
```

**Use Case:**
- Backend developer veritabanı yapısını görsel olarak keşfediyor
- Relationship cardinality'leri (1:1, 1:M, M:M) anlıyor
- Export PNG ile documentation'a ekleniyor

---

## UI/UX Flow Diagram

### Flow Interaction States

**1. Initial Load:**
```
User opens /schemas/:schemaId/flow
    ↓
Loading spinner
    ↓
Fetch graph data from API
    ↓
Render nodes and edges
    ↓
Auto fit view
```

**2. User Interactions:**
```
Zoom In → Scale up
Zoom Out → Scale down
Pan → Move viewport
Minimap click → Jump to area
Auto Layout → Recalculate positions (Dagre)
Node click → Navigate to /objects/:objectId/records
Export → Download PNG/SVG/JSON
```

**3. Layout Algorithm (Dagre):**
```
User clicks "Auto Layout"
    ↓
Create Dagre graph
    ↓
Add nodes with dimensions (200x150)
    ↓
Add edges (relationships)
    ↓
Calculate layout (LR direction)
    ↓
Apply positions to nodes
    ↓
Fit view
```

---

## Performance Optimizations

### Large Graphs (100+ nodes)
```typescript
// Virtualization for large graphs
import { useVirtualizer } from '@tanstack/react-virtual';

// Only render visible nodes
const visibleNodes = nodes.filter(node => {
  const bounds = getViewBounds();
  return isNodeInBounds(node, bounds);
});
```

### Memoization
```typescript
// Memoize node components
export const ObjectNode = memo(({ data }: NodeProps<ObjectNodeData>) => {
  // ... component code
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});
```

### Debounced Position Updates
```typescript
// Don't save position on every drag
const debouncedUpdatePosition = useMemo(
  () => debounce((nodeId, position) => {
    updateNodePositionAPI(schemaId, nodeId, position);
  }, 500),
  [schemaId]
);
```

---

## Resources

### React Flow v12 Documentation
- [React Flow Docs](https://reactflow.dev/)
- [Custom Nodes Guide](https://reactflow.dev/examples/nodes/custom-node)
- [Custom Edges Guide](https://reactflow.dev/examples/edges/custom-edge)
- [Layout with Dagre](https://reactflow.dev/examples/layout/dagre)
- [Export to PNG/SVG](https://reactflow.dev/examples/interaction/download-image)

### Dagre Layout
- [Dagre GitHub](https://github.com/dagrejs/dagre)
- [Dagre Wiki](https://github.com/dagrejs/dagre/wiki)

### Export Libraries
- [html-to-image](https://github.com/bubkoo/html-to-image)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the React Flow Integration task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/10-advanced-features/02-react-flow-integration.md

Requirements:
1. Install dependencies: @xyflow/react@12, @dagrejs/dagre, @types/dagre, html-to-image
2. Create src/features/schema-visualization/pages/SchemaFlowPage.tsx - Main page with toolbar
3. Create src/features/schema-visualization/components/SchemaFlow.tsx - React Flow container with Background, Controls, MiniMap
4. Create src/features/schema-visualization/components/nodes/ObjectNode.tsx - Custom node component with icon, record count, fields count
5. Create src/features/schema-visualization/components/edges/RelationshipEdge.tsx - Custom edge with cardinality label
6. Create src/features/schema-visualization/components/controls/FlowToolbar.tsx - Top toolbar with auto layout, fit view, export buttons
7. Create src/features/schema-visualization/hooks/useSchemaFlow.ts - TanStack Query hook for fetching graph data
8. Create src/features/schema-visualization/hooks/useAutoLayout.ts - Dagre layout algorithm hook
9. Create src/features/schema-visualization/hooks/useExportFlow.ts - Export to PNG/SVG/JSON hook
10. Create src/lib/api/schema-visualization.api.ts - API calls (getSchemaGraphAPI, updateNodePositionAPI)
11. Create src/features/schema-visualization/types/flow.types.ts - TypeScript type definitions

CRITICAL REQUIREMENTS:
- Use @xyflow/react v12 (NOT older versions)
- Custom ObjectNode with colored header, icon, record count, fields count
- Custom RelationshipEdge with cardinality label (1:1, 1:M, M:M)
- Auto layout using Dagre algorithm (LR direction, 100 ranksep, 50 nodesep)
- Export to PNG/SVG/JSON using html-to-image library
- MiniMap with custom node colors
- Node click navigates to /objects/:objectId/records
- Mobile responsive with touch controls
- Performance optimization with memo for large graphs (100+ nodes)

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 03-advanced-search.md
