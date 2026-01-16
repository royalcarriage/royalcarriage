# Image Management Components

This directory contains admin components for managing images across the Royal Carriage sites.

## Components

### ImageLibrary.tsx

**Grid view of all images in the library**

Features:

- Thumbnail grid display with metadata overlay
- Filters: Site (useSiteFilter), Entity Type, Source
- Click image to view detailed metadata modal
- Quick actions: Upload, Edit, Delete
- Displays: dimensions, file size, tags, source info

### MissingImages.tsx

**Report of entities that don't meet image requirements**

Features:

- Table view of entities with missing images
- Columns: Entity Type, Title, Slug, Required, Current, Missing, Rules, Actions
- Summary cards showing totals and critical issues
- Filters by Site and Entity Type
- "Upload for Entity" quick action
- Validation rules:
  - Vehicle pages require 8+ images
  - Service/City pages require hero images

### ImageUpload.tsx

**Form for uploading new images**

Features:

- File upload with image preview
- Required fields:
  - Image file
  - Alt text (minimum 10 characters)
  - Entity Type (vehicle, service, city, blog, general)
  - Entity Slug
  - Source (owned, licensed, ai)
- Conditional field:
  - Proof URL (required if source is 'licensed')
- Tag input with add/remove functionality
- Compression warning if file size > 300KB
- Form validation with error messages
- Site selection from SiteFilterContext

## Data Types

All components use the `ImageMetadata` type from `@shared/admin-types`.

## TODO

- [ ] Connect to Firebase Storage API
- [ ] Implement actual image upload logic
- [ ] Add image deletion with confirmation dialog
- [ ] Implement edit functionality
- [ ] Add pagination for large image libraries
- [ ] Add search functionality
- [ ] Implement automatic image compression
- [ ] Add bulk upload support
- [ ] Connect MissingImages report to actual data sources
- [ ] Add image optimization recommendations
