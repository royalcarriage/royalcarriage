# AI-Powered Website Management System

## Overview

The AI-Powered Website Management System is a comprehensive solution for automated SEO optimization, content generation, and website analytics for the Royal Carriage / Chicago Airport Black Car website. The system leverages Google Cloud's Vertex AI and Firebase services to continuously monitor, analyze, and improve website content.

## Features

### 1. AI Page Analyzer
- **Automated SEO Analysis**: Scans pages for SEO best practices
- **Content Quality Assessment**: Evaluates readability, structure, and engagement
- **Location-Specific Optimization**: Tailors content for Chicago locations (O'Hare, Midway, suburbs)
- **Vehicle-Specific Content**: Optimizes content for different vehicle types (sedans, SUVs, limousines)
- **Scoring System**: Provides 0-100 scores for SEO and content quality

### 2. AI Content Generator
- **Smart Content Creation**: Generates SEO-optimized content using Vertex AI
- **Template-Based Fallback**: Provides high-quality templates when AI is unavailable
- **Location Integration**: Creates location-specific content for different areas
- **Vehicle Integration**: Generates vehicle-specific descriptions
- **Meta Tag Optimization**: Creates optimized titles and meta descriptions

### 3. AI Image Generator
- **Automated Image Creation**: Generates professional images using AI
- **Purpose-Driven Generation**: Creates images for heroes, service cards, fleet, locations
- **Prompt Engineering**: Uses optimized prompts for consistent, professional results
- **Multiple Variations**: Generates multiple image options for selection
- **Placeholder Support**: Provides placeholder images during development

### 4. Admin Dashboard
- **Centralized Management**: Single interface for all AI tools
- **Page Management**: View and manage all website pages
- **Analytics Integration**: Monitor website performance
- **Approval Workflow**: Review and approve AI-generated changes
- **Automation Settings**: Configure scheduled tasks and rules

### 5. Firebase Functions
- **Scheduled Analysis**: Daily automated page analysis at 2:00 AM
- **Weekly Reports**: SEO reports generated every Monday
- **Real-Time Processing**: Instant analysis on demand
- **Auto-Analysis**: Automatic analysis of new pages
- **Secure APIs**: Protected endpoints for AI operations

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js 20
- **AI Services**: Google Cloud Vertex AI (Gemini Pro, Imagen)
- **Database**: PostgreSQL (Drizzle ORM) + Firestore
- **Functions**: Firebase Functions (Node.js 20)
- **Hosting**: Firebase Hosting
- **Security**: Firebase Authentication + Firestore Rules

### Component Structure
```
royalcarriage/
├── client/
│   └── src/
│       └── pages/
│           └── admin/
│               ├── AdminDashboard.tsx    # Main admin interface
│               └── PageAnalyzer.tsx      # Page analysis tool
├── server/
│   └── ai/
│       ├── page-analyzer.ts      # SEO & content analysis
│       ├── content-generator.ts  # AI content generation
│       ├── image-generator.ts    # AI image generation
│       └── routes.ts             # API endpoints
├── functions/
│   └── src/
│       └── index.ts              # Scheduled Firebase Functions
└── shared/
    └── schema.ts                 # Database schema
```

## Setup Instructions

### Prerequisites
1. Node.js 20.x or later
2. Firebase CLI installed: `npm install -g firebase-tools`
3. Google Cloud project with Vertex AI enabled
4. Firebase project configured

### Installation

1. **Install Dependencies**
```bash
npm install
cd functions && npm install && cd ..
```

2. **Configure Environment Variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
- `GOOGLE_CLOUD_PROJECT`: Your Google Cloud project ID
- `GOOGLE_CLOUD_LOCATION`: Region for Vertex AI (default: us-central1)
- `FIREBASE_PROJECT_ID`: Your Firebase project ID

3. **Set Up Google Cloud Credentials**
```bash
# Download service account key from Google Cloud Console
# Place it in a secure location
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

4. **Initialize Firestore Database**
```bash
# Create Firestore database in Firebase Console
# Deploy Firestore rules and indexes
firebase deploy --only firestore
```

5. **Deploy Firebase Functions**
```bash
cd functions
npm run build
firebase deploy --only functions
cd ..
```

6. **Build and Run Application**
```bash
npm run build
npm start
```

## Usage

### Accessing the Admin Dashboard

1. Navigate to `https://your-domain.com/admin`
2. Log in with admin credentials
3. Use the dashboard to:
   - Analyze pages
   - Generate content
   - Create images
   - Review recommendations
   - Configure automation

### Analyzing Pages

1. Go to Admin Dashboard > Pages tab
2. Click "Analyze All Pages" or select specific pages
3. Review SEO and content scores
4. View detailed recommendations
5. Generate improvements based on recommendations

### Generating Content

1. Go to Admin Dashboard > AI Tools tab
2. Select "Content Generator"
3. Choose:
   - Page type (airport, suburb, vehicle, etc.)
   - Location (optional)
   - Vehicle type (optional)
   - Target keywords
   - Tone (professional, friendly, luxury)
4. Review generated content
5. Edit and approve for deployment

### Generating Images

1. Go to Admin Dashboard > Images tab
2. Click "Generate Images"
3. Select:
   - Purpose (hero, service_card, fleet, location)
   - Location (optional)
   - Vehicle (optional)
   - Style preferences
4. Generate multiple variations
5. Select and deploy preferred images

### Automation & Scheduling

The system includes several automated tasks:

**Daily Page Analysis** (2:00 AM CT)
- Analyzes all website pages
- Generates SEO scores
- Creates recommendations
- Stores results in database

**Weekly SEO Report** (Mondays 9:00 AM CT)
- Compiles analytics from past week
- Calculates average scores
- Identifies trends
- Stores comprehensive report

**On-Demand Analysis**
- Triggered via API
- Real-time processing
- Immediate results

## API Endpoints

### AI Routes

All AI routes are prefixed with `/api/ai`

#### Analyze Page
```
POST /api/ai/analyze-page
Body: {
  pageUrl: string,
  pageContent: string,
  pageName: string
}
```

#### Generate Content
```
POST /api/ai/generate-content
Body: {
  pageType: string,
  location?: string,
  vehicle?: string,
  targetKeywords: string[],
  tone?: 'professional' | 'friendly' | 'luxury',
  maxLength?: number
}
```

#### Improve Content
```
POST /api/ai/improve-content
Body: {
  currentContent: string,
  recommendations: string[]
}
```

#### Generate Image
```
POST /api/ai/generate-image
Body: {
  purpose: 'hero' | 'service_card' | 'fleet' | 'location',
  location?: string,
  vehicle?: string,
  style?: string
}
```

#### Batch Analysis
```
POST /api/ai/batch-analyze
Body: {
  pages: Array<{
    url: string,
    name: string,
    content: string
  }>
}
```

#### Health Check
```
GET /api/ai/health
```

## Database Schema

### PostgreSQL Tables

**users**: User accounts and authentication
**page_analysis**: Page analysis results and scores
**content_suggestions**: AI-generated content recommendations
**ai_images**: Generated images and metadata
**audit_logs**: System activity logs
**scheduled_jobs**: Automation configuration
**ai_settings**: AI system configuration

### Firestore Collections

**pages**: Website page metadata
**page_analyses**: Analysis results
**content_suggestions**: Content recommendations
**ai_images**: Image metadata
**seo_reports**: Weekly SEO reports
**audit_logs**: Activity tracking

## Security

### Authentication
- Admin access required for all AI tools
- Role-based access control (RBAC)
- Session-based authentication

### API Security
- All AI endpoints require authentication
- Rate limiting on API calls
- Input validation and sanitization
- CORS configuration for production

### Data Protection
- Encrypted communication (HTTPS)
- Secure credential storage
- Firestore security rules
- Audit logging for all actions

## Monitoring & Maintenance

### Health Checks
- `/api/ai/health` endpoint for service status
- Firebase Functions monitoring in console
- Error logging and alerting

### Performance Optimization
- Caching of analysis results
- Batch processing for multiple pages
- Async operations for long-running tasks
- Rate limiting to prevent quota exhaustion

### Cost Management
- Monitor Vertex AI usage in Google Cloud Console
- Set budget alerts
- Optimize API calls
- Use template fallbacks when appropriate

## Troubleshooting

### Common Issues

**AI Service Not Available**
- Check Google Cloud credentials
- Verify Vertex AI API is enabled
- Check project quota limits
- System will use template fallback

**Firebase Functions Timeout**
- Increase timeout in firebase.json
- Optimize processing logic
- Use batch operations

**Authentication Errors**
- Verify Firebase configuration
- Check user roles in database
- Review Firestore security rules

### Support Resources
- [Google Cloud Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## Future Enhancements

### Planned Features
1. **Google Analytics Integration**: Real-time traffic data
2. **A/B Testing**: Test content variations
3. **Multi-language Support**: International content
4. **Advanced Image Editing**: Post-generation image optimization
5. **Competitor Analysis**: Compare with competitor websites
6. **Voice Search Optimization**: Optimize for voice queries
7. **Mobile Optimization**: Mobile-specific content
8. **Performance Monitoring**: Page speed and Core Web Vitals

## License

Private repository - All rights reserved.

## Contact

For questions or support, contact the development team.
