import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import type { SEODraft, SEOTopic } from '@shared/admin-types';
import { Calendar, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';

interface DraftWithTopic {
  draft: SEODraft;
  topic: SEOTopic;
}

// Mock data for demonstration
const MOCK_APPROVED_DRAFTS: DraftWithTopic[] = [
  {
    draft: {
      id: 'draft-1',
      topicId: 'topic-1',
    content: '<p>Full content here...</p>',
    metaTitle: 'Chicago Airport Transportation to O\'Hare | Premium Service',
    metaDescription: 'Book reliable airport transportation to O\'Hare. Professional drivers, luxury vehicles, 24/7 availability.',
    h1: 'Chicago Airport Transportation to O\'Hare',
    schema: '{"@context":"https://schema.org",...}',
    internalLinks: ['/fleet/executive-sedan', '/services/airport'],
    images: ['hero-image.jpg', 'fleet-1.jpg'],
      wordCount: 1250,
      gateStatus: 'passed',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-17T14:00:00Z',
    },
    topic: {
      id: 'topic-1',
      title: 'Chicago Airport Transportation to O\'Hare',
      slug: 'chicago-airport-transportation-ohare',
      pageType: 'city',
      siteSlug: 'airport',
      status: 'ready',
      primaryKeyword: 'chicago airport transportation',
      secondaryKeywords: ['ohare airport', 'airport car service'],
      targetUrl: '/city/chicago-airport-ohare',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-17T14:00:00Z',
    },
  },
  {
    draft: {
      id: 'draft-2',
      topicId: 'topic-2',
    content: '<p>Full content here...</p>',
    metaTitle: 'Executive SUV Fleet | Corporate Transportation Chicago',
    metaDescription: 'Premium executive SUVs for corporate travel. Spacious, comfortable, and professional service.',
    h1: 'Executive SUV Fleet Options',
    schema: '{"@context":"https://schema.org",...}',
    internalLinks: ['/services/corporate', '/fleet/luxury-sedan'],
    images: ['suv-hero.jpg', 'suv-interior.jpg'],
      wordCount: 980,
      gateStatus: 'passed',
      createdAt: '2024-01-12T09:00:00Z',
      updatedAt: '2024-01-17T16:00:00Z',
    },
    topic: {
      id: 'topic-2',
      title: 'Executive SUV Fleet Options',
      slug: 'executive-suv-fleet',
      pageType: 'fleet',
      siteSlug: 'corporate',
      status: 'ready',
      primaryKeyword: 'executive suv',
      secondaryKeywords: ['corporate suv', 'business transportation'],
      targetUrl: '/fleet/executive-suv',
      createdAt: '2024-01-12T09:00:00Z',
      updatedAt: '2024-01-17T16:00:00Z',
    },
  },
];

const PUBLISH_LIMIT = 5;
const SPAM_POLICY_ITEMS = [
  'All content is original and provides genuine value to users',
  'No keyword stuffing or manipulation detected',
  'Content follows E-E-A-T guidelines (Experience, Expertise, Authoritativeness, Trust)',
  'Internal links are natural and relevant',
  'Images are properly licensed and optimized',
  'Schema markup is accurate and appropriate',
  'Meta descriptions accurately describe page content',
  'Page addresses user intent and search query needs',
];

export default function PublishControl() {
  const { userData } = useAuth();
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set());
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [policyChecks, setPolicyChecks] = useState<Set<number>>(new Set());
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastPublishDate] = useState<Date>(new Date('2024-01-10T12:00:00Z'));
  
  const isSuperAdmin = userData?.role === 'SuperAdmin';

  const nextAllowedDate = useMemo(() => {
    const next = new Date(lastPublishDate);
    next.setDate(next.getDate() + 7); // Weekly cadence
    return next;
  }, [lastPublishDate]);

  const canPublishToday = new Date() >= nextAllowedDate;

  const toggleDraft = (draftId: string) => {
    setSelectedDrafts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(draftId)) {
        newSet.delete(draftId);
      } else {
        if (newSet.size >= PUBLISH_LIMIT) {
          return prev; // Don't allow more than limit
        }
        newSet.add(draftId);
      }
      return newSet;
    });
  };

  const togglePolicyCheck = (index: number) => {
    setPolicyChecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handlePublishClick = () => {
    if (!isSuperAdmin) return;
    if (!canPublishToday) return;
    if (selectedDrafts.size === 0) return;
    
    setPolicyChecks(new Set());
    setPublishDialogOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (policyChecks.size !== SPAM_POLICY_ITEMS.length) {
      return; // All policy items must be checked
    }

    setIsPublishing(true);

    // TODO: Firebase function call to publish selected drafts
    const draftIds = Array.from(selectedDrafts);
    console.log('Publishing drafts:', draftIds);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsPublishing(false);
    setPublishDialogOpen(false);
    setSelectedDrafts(new Set());
    
    // TODO: Show success toast and refresh data
  };

  const allPolicyChecksComplete = policyChecks.size === SPAM_POLICY_ITEMS.length;

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Only SuperAdmin users can access the Publish Control panel.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Publish Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage content publishing schedule and approvals
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Last Publish Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {lastPublishDate.toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Next Allowed Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {nextAllowedDate.toLocaleDateString()}
              </span>
            </div>
            {!canPublishToday && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {Math.ceil((nextAllowedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Publish Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedDrafts.size} / {PUBLISH_LIMIT}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pages per publish cycle
            </p>
          </CardContent>
        </Card>
      </div>

      {!canPublishToday && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Publishing is restricted until {nextAllowedDate.toLocaleDateString()} to maintain a natural publishing cadence.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ready to Publish</CardTitle>
          <CardDescription>
            Select up to {PUBLISH_LIMIT} approved drafts to publish
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_APPROVED_DRAFTS.map(item => (
              <Card key={item.draft.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedDrafts.has(item.draft.id)}
                      onCheckedChange={() => toggleDraft(item.draft.id)}
                      disabled={!canPublishToday || (!selectedDrafts.has(item.draft.id) && selectedDrafts.size >= PUBLISH_LIMIT)}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{item.topic.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.draft.metaTitle}</p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Passed Gate
                        </Badge>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {item.topic.pageType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.topic.siteSlug}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.draft.wordCount} words
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.draft.internalLinks.length} internal links
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated: {new Date(item.draft.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handlePublishClick}
              disabled={!canPublishToday || selectedDrafts.size === 0}
              size="lg"
            >
              Publish Selected ({selectedDrafts.size})
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Publishing</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to publish {selectedDrafts.size} page(s). Please confirm that all spam policy requirements are met.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 my-4">
            <h3 className="font-medium">Spam Policy Checklist</h3>
            <p className="text-sm text-muted-foreground">
              All items must be checked before publishing (Requirement 64)
            </p>
            {SPAM_POLICY_ITEMS.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <Checkbox
                  id={`policy-${index}`}
                  checked={policyChecks.has(index)}
                  onCheckedChange={() => togglePolicyCheck(index)}
                />
                <label
                  htmlFor={`policy-${index}`}
                  className="text-sm cursor-pointer"
                >
                  {item}
                </label>
              </div>
            ))}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPublish}
              disabled={!allPolicyChecksComplete || isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish Now'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
