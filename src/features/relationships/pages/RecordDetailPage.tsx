/**
 * RecordDetailPage Component
 *
 * Multi-view record detail page with Stitch design
 * - Tabbed interface: Overview, Related Records, Activity
 * - Two-column layout on large screens
 * - Responsive sidebar cards
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecord } from '@/features/records/hooks/useRecords';
import { useObjectRelationships } from '@/lib/hooks/useRelationships';
import { useObject } from '@/features/objects/hooks/useObjects';
import { useNavigationStore } from '@/stores/navigationStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';
import { RelatedRecordsPanel } from '../components/RelatedRecordsPanel';
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
  Activity,
  FileText,
} from 'lucide-react';

export function RecordDetailPage() {
  const { objectId, recordId } = useParams<{ objectId: string; recordId: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigationStore();

  const { data: record, isLoading: isLoadingRecord } = useRecord(objectId!, recordId!);
  const { data: relationships, isLoading: isLoadingRelationships } =
    useObjectRelationships(objectId);
  const { data: object } = useObject(objectId!);

  const getRecordDisplayName = () => {
    if (!record) return 'Record';

    // Try to find a name-like field
    const nameField = Object.entries(record.data).find(([key]) =>
      key.toLowerCase().includes('name')
    );
    if (nameField) return String(nameField[1]);

    // Fall back to first field value
    const firstValue = Object.values(record.data)[0];
    return firstValue ? String(firstValue) : record.id;
  };

  // Update breadcrumbs
  useEffect(() => {
    if (object && record) {
      setBreadcrumbs([
        { label: 'Objects', href: '/objects' },
        { label: object.label, href: `/objects/${objectId}/records` },
        { label: getRecordDisplayName() },
      ]);
    }
  }, [object, record, objectId, setBreadcrumbs]);

  // Loading state
  if (isLoadingRecord || isLoadingRelationships) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!record) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <p className="text-red-700 dark:text-red-400">Record not found</p>
          <Button
            variant="secondary"
            onClick={() => navigate(`/objects/${objectId}/records`)}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Records
          </Button>
        </div>
      </div>
    );
  }

  const recordName = getRecordDisplayName();
  const objectLabel = object?.label || objectId;

  // Helper to get field icon based on key name
  const getFieldIcon = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('email')) return <Mail className="h-4 w-4" />;
    if (lowerKey.includes('phone')) return <Phone className="h-4 w-4" />;
    if (lowerKey.includes('company') || lowerKey.includes('organization'))
      return <Building2 className="h-4 w-4" />;
    if (lowerKey.includes('address') || lowerKey.includes('location'))
      return <MapPin className="h-4 w-4" />;
    if (lowerKey.includes('date')) return <Calendar className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  // Separate fields into primary and secondary
  const allFields = Object.entries(record.data);
  const primaryFields = allFields.slice(0, 4);
  const secondaryFields = allFields.slice(4);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(`/objects/${objectId}/records`)}
        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {objectLabel}
      </Button>

      {/* Record Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            {/* Record Info */}
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {recordName}
                  </h1>
                  <Badge variant="blue">{objectLabel}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Created {new Date(record.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(record.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                onClick={() => navigate(`/objects/${objectId}/records/${recordId}/edit`)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="secondary" size="sm" className="px-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultSelectedKey="overview">
        <TabList>
          <Tab id="overview">
            <FileText className="h-4 w-4" />
            Overview
          </Tab>
          <Tab id="related" badge={relationships?.length || 0}>
            <LinkIcon className="h-4 w-4" />
            Related Records
          </Tab>
          <Tab id="activity">
            <Activity className="h-4 w-4" />
            Activity
          </Tab>
        </TabList>

        {/* Overview Tab */}
        <TabPanel id="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Primary Information Card */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {objectLabel} Information
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {primaryFields.map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                          {getFieldIcon(key)}
                          {key}
                        </div>
                        <div className="text-base text-slate-900 dark:text-white">
                          {value !== null && value !== undefined ? String(value) : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Fields Card */}
              {secondaryFields.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Additional Details
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {secondaryFields.map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {getFieldIcon(key)}
                            {key}
                          </div>
                          <div className="text-base text-slate-900 dark:text-white">
                            {value !== null && value !== undefined ? String(value) : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-6">
              {/* Quick Stats Card */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Quick Stats
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Related Records
                      </span>
                      <Badge variant="blue">{relationships?.length || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Total Fields
                      </span>
                      <Badge variant="purple">{allFields.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Last Updated
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Quick Actions
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      className="w-full justify-start"
                      onClick={() => navigate(`/objects/${objectId}/records/${recordId}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Record
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full justify-start"
                      onClick={() => navigate(`/objects/${objectId}/relationships`)}
                    >
                      <LinkIcon className="h-4 w-4" />
                      Manage Relationships
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabPanel>

        {/* Related Records Tab */}
        <TabPanel id="related">
          {relationships && relationships.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {relationships.map((relationship) => (
                <RelatedRecordsPanel
                  key={relationship.id}
                  recordId={record.id}
                  recordName={recordName}
                  relationship={relationship}
                  currentObjectId={objectId!}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <LinkIcon className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Relationships Defined
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Create relationships between this object and others to link related records.
                </p>
                <Button onClick={() => navigate(`/objects/${objectId}/relationships`)}>
                  Define Relationships
                </Button>
              </CardContent>
            </Card>
          )}
        </TabPanel>

        {/* Activity Tab */}
        <TabPanel id="activity">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Activity Timeline Coming Soon
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Track all changes, updates, and interactions with this record.
              </p>
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
}
