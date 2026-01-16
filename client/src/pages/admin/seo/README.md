# SEO Bot Components

This directory contains the frontend components for the SEO Bot system.

## Components

### 1. TopicQueueBoard.tsx

Kanban-style board for managing SEO topic workflow.

**Features:**

- 5 columns: Proposed | Draft | Ready | Published | Blocked
- Drag-and-drop support for moving topics between columns
- Filter by site (using SiteFilterContext) and page type
- Topic cards display: title, keywords, status badges
- Edit/delete actions on each card

**Mock Data:** Currently uses placeholder data. Replace with Firebase queries when ready.

**Usage:**

```tsx
import TopicQueueBoard from "@/pages/admin/seo/TopicQueueBoard";

<TopicQueueBoard />;
```

### 2. GateResultsViewer.tsx

Displays quality gate check results for SEO drafts.

**Features:**

- Pass/fail status for 8 quality checks:
  - Duplicate title check
  - Duplicate meta description
  - Content similarity score
  - Schema validation
  - Broken links check
  - Image requirements
  - Internal links
  - Keyword optimization
- Expandable sections for detailed results
- Suggestions list
- Re-run gate button

**Props:**

```tsx
interface GateResultsViewerProps {
  draftId: string;
  gateResults?: GateResult; // Optional, uses mock data if not provided
}
```

**Usage:**

```tsx
import GateResultsViewer from "@/pages/admin/seo/GateResultsViewer";

<GateResultsViewer draftId="draft-123" gateResults={gateResult} />;
```

### 3. PublishControl.tsx

SuperAdmin-only control panel for publishing approved drafts.

**Features:**

- SuperAdmin role check (shows access denied for other users)
- List of approved drafts ready to publish
- Checkbox selection with configurable limit (default: 5 per cycle)
- Publish cadence tracking (last publish date, next allowed date)
- Spam policy checklist (requirement 64) in confirmation modal
- 8-item checklist must be fully completed before publishing

**Mock Data:** Currently uses placeholder data. Replace with Firebase queries when ready.

**Usage:**

```tsx
import PublishControl from "@/pages/admin/seo/PublishControl";

<PublishControl />;
```

## Dependencies

All components use:

- Shared types from `@shared/admin-types.ts`
- UI components from `@/components/ui/*`
- `SiteFilterContext` for site filtering
- `AuthContext` for user authentication and role checking
- `lucide-react` for icons

## TODO for Firebase Integration

When integrating with Firebase:

1. **TopicQueueBoard:**
   - Replace `MOCK_TOPICS` with Firestore query: `collection('seoTopics')`
   - Implement `handleDrop` to update Firestore document status
   - Implement `confirmDelete` to delete Firestore document
   - Add loading states during operations

2. **GateResultsViewer:**
   - Fetch `GateResult` from Firestore: `doc('seoDrafts', draftId, 'gateResults')`
   - Implement `handleRerunGate` to trigger Firebase Function
   - Add real-time listener for gate result updates

3. **PublishControl:**
   - Query approved drafts: `collection('seoDrafts').where('gateStatus', '==', 'passed')`
   - Fetch `PublishCadence` settings from Firestore: `doc('settings', 'publishCadence')`
   - Implement `handleConfirmPublish` to trigger Firebase Function
   - Update publish dates and topic statuses after publishing
   - Add real-time listener for draft status updates

## Notes

- All components include proper TypeScript types
- Error handling structure is in place
- UI follows existing component patterns from the repository
- Drag-and-drop uses native HTML5 API (no external library required)
- All Firebase operations are marked with `// TODO` comments for easy identification
