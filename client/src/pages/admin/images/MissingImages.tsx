import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSiteFilter } from '@/contexts/SiteFilterContext';
import { AlertCircle, Upload } from 'lucide-react';

interface MissingImageEntity {
  entityType: 'vehicle' | 'service' | 'city' | 'blog';
  entitySlug: string;
  entityTitle: string;
  siteSlug: string;
  requiredImages: number;
  currentImages: number;
  missingCount: number;
  rules: string[];
}

const ENTITY_TYPE_FILTER = [
  { value: 'all', label: 'All Types' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'service', label: 'Service' },
  { value: 'city', label: 'City' },
  { value: 'blog', label: 'Blog' },
];

// Mock data for demonstration
const MOCK_MISSING: MissingImageEntity[] = [
  {
    entityType: 'vehicle',
    entitySlug: 'executive-suv',
    entityTitle: 'Executive SUV',
    siteSlug: 'corporate',
    requiredImages: 8,
    currentImages: 3,
    missingCount: 5,
    rules: ['Vehicle pages require at least 8 images'],
  },
  {
    entityType: 'service',
    entitySlug: 'airport-transportation',
    entityTitle: 'Airport Transportation',
    siteSlug: 'airport',
    requiredImages: 1,
    currentImages: 0,
    missingCount: 1,
    rules: ['Service pages require hero image'],
  },
  {
    entityType: 'city',
    entitySlug: 'chicago-downtown',
    entityTitle: 'Chicago Downtown',
    siteSlug: 'airport',
    requiredImages: 1,
    currentImages: 0,
    missingCount: 1,
    rules: ['City pages require hero image'],
  },
];

export default function MissingImages() {
  const { selectedSite } = useSiteFilter();
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [missingEntities, setMissingEntities] = useState<MissingImageEntity[]>(MOCK_MISSING);

  const filteredEntities = useMemo(() => {
    return missingEntities.filter(entity => {
      const siteMatch = selectedSite === 'all' || entity.siteSlug === selectedSite;
      const typeMatch = entityTypeFilter === 'all' || entity.entityType === entityTypeFilter;
      return siteMatch && typeMatch;
    });
  }, [missingEntities, selectedSite, entityTypeFilter]);

  const sortedEntities = useMemo(() => {
    return [...filteredEntities].sort((a, b) => b.missingCount - a.missingCount);
  }, [filteredEntities]);

  const handleUploadForEntity = (entity: MissingImageEntity) => {
    // TODO: Navigate to upload page with pre-filled entity info
    console.log('Upload for entity:', entity);
  };

  const handleRefresh = () => {
    // TODO: Fetch latest missing images data
    console.log('Refresh missing images');
  };

  const totalMissing = filteredEntities.reduce(
    (sum, entity) => sum + entity.missingCount,
    0
  );

  const getSeverityColor = (missingCount: number) => {
    if (missingCount >= 5) return 'destructive';
    if (missingCount >= 3) return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Missing Images</h1>
          <p className="text-gray-600 mt-1">
            Entities that don't meet image requirements
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Entities Missing Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredEntities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Missing Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMissing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Critical (5+ missing)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {filteredEntities.filter(e => e.missingCount >= 5).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Entity Type</label>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPE_FILTER.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Images Table */}
      <Card>
        <CardHeader>
          <CardTitle>Missing Images Report</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedEntities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity Title</TableHead>
                  <TableHead>Entity Slug</TableHead>
                  <TableHead className="text-center">Required</TableHead>
                  <TableHead className="text-center">Current</TableHead>
                  <TableHead className="text-center">Missing</TableHead>
                  <TableHead>Rules</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEntities.map((entity, index) => (
                  <TableRow key={`${entity.entityType}-${entity.entitySlug}-${index}`}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {entity.entityType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{entity.entityTitle}</TableCell>
                    <TableCell className="text-gray-600 font-mono text-sm">
                      {entity.entitySlug}
                    </TableCell>
                    <TableCell className="text-center">{entity.requiredImages}</TableCell>
                    <TableCell className="text-center">{entity.currentImages}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getSeverityColor(entity.missingCount)}>
                        {entity.missingCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {entity.rules.map((rule, idx) => (
                          <div key={idx} className="flex items-start gap-1 text-xs text-gray-600">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleUploadForEntity(entity)}
                      >
                        <Upload className="mr-2 h-3 w-3" />
                        Upload
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="bg-green-100 text-green-700 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                ✓
              </div>
              <p className="text-gray-600 font-medium">All entities have required images!</p>
              <p className="text-sm text-gray-500 mt-1">
                No missing images found for the selected filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
