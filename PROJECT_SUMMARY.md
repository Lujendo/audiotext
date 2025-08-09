# AudioText - AI-Powered Audio Transcription Platform

## 🎯 Project Overview

AudioText is a comprehensive AI-powered audio transcription platform built on Cloudflare Workers with React frontend. The platform offers tier-based subscription services for audio-to-text conversion with advanced features like speaker identification, custom vocabulary, and professional export formats.

**Live URL:** https://audiotext.info-eac.workers.dev

## 🏗️ Architecture

### **Backend (Cloudflare Workers)**
- **Runtime:** Cloudflare Workers with Hono framework
- **Database:** Cloudflare D1 (SQLite)
- **Storage:** Cloudflare R2 for audio files
- **AI Services:** 
  - Primary: OpenAI Whisper API (requires valid API key)
  - Fallback: Cloudflare AI (@cf/openai/whisper) with retry logic
- **Authentication:** JWT-based with session management
- **File Processing:** Multi-format audio support (MP3, WAV, M4A, etc.)

### **Frontend (React + TypeScript)**
- **Framework:** React 18 with TypeScript
- **Routing:** React Router v6
- **Styling:** Tailwind CSS with custom components
- **Editor:** TipTap rich text editor with advanced formatting
- **State Management:** React Context (AuthContext)
- **Build Tool:** Vite

## 💰 Commercial Tiers

### **🎁 Free Trial ($0/7 days)**
- 30 minutes transcription limit
- Basic AI transcription
- Export to TXT, SRT, VTT
- Trial progress tracking
- Upgrade prompts

### **👑 Pro ($29/month)**
- 500 minutes/month
- Advanced AI models
- Speaker identification
- Custom vocabulary
- Priority processing
- API access
- Advanced analytics

### **🏢 Enterprise ($99/month)**
- Unlimited transcription
- Custom AI training
- Team collaboration
- White-label options
- SLA guarantees
- Advanced reporting
- Multi-team management

### **⚙️ Admin Dashboard**
- Subscription analytics
- Revenue tracking
- User tier distribution
- System health monitoring

## 🎨 User Interface

### **Dashboard System (Tier-Based)**
- **Professional Design:** Gradient headers, consistent styling
- **Tier-Specific Content:** Features and limits based on subscription
- **Usage Tracking:** Visual progress bars and limit indicators
- **Upgrade Paths:** Strategic CTAs for tier progression

### **Transcription Management**
- **Rich Text Editor:** Professional editing with formatting tools
- **Export Formats:** PDF, DOCX, TXT, SRT, VTT, Timestamped Text
- **Transcription List:** Beautiful modal-style list with search/filter
- **Real-time Processing:** Live status updates and progress tracking

### **Audio Processing**
- **Multi-format Support:** MP3, WAV, M4A, FLAC, OGG
- **Drag & Drop Upload:** Intuitive file upload interface
- **Progress Tracking:** Real-time transcription progress
- **Error Handling:** Graceful fallbacks and retry logic

## 🔧 Technical Features

### **Authentication & Authorization**
- JWT-based authentication with secure session management
- Role-based access control (admin, user)
- Subscription tier enforcement
- Protected routes and API endpoints

### **Audio Processing Pipeline**
1. **File Upload:** Multi-format audio file upload to R2 storage
2. **Validation:** File type, size, and duration validation
3. **Transcription:** OpenAI Whisper API with Cloudflare AI fallback
4. **Post-processing:** Artifact removal, confidence scoring
5. **Storage:** Transcription results stored in D1 database

### **Export System**
- **PDF:** Professional formatted documents
- **DOCX:** Microsoft Word compatible
- **TXT:** Plain text format
- **SRT:** Subtitle format with timestamps
- **VTT:** WebVTT captions for web video
- **Timestamped Text:** Human-readable format for video editors

### **Error Handling & Reliability**
- **Retry Logic:** Automatic retries for network failures
- **Fallback Systems:** Multiple AI providers for reliability
- **Graceful Degradation:** Fallback to basic features when advanced fail
- **User Feedback:** Clear error messages and status indicators

## 📊 Database Schema

### **Users Table**
- Authentication and profile information
- Subscription tier and status
- Usage tracking and limits

### **Audio Files Table**
- File metadata and storage references
- Processing status and timestamps
- User ownership and permissions

### **Transcriptions Table**
- Transcription text and metadata
- Confidence scores and language detection
- Edit history and version control
- Segment-level timestamps for advanced features

## 🚀 Deployment

### **Current Status**
- **Environment:** Production on Cloudflare Workers
- **Domain:** audiotext.info-eac.workers.dev
- **Build System:** Automated build and deploy pipeline
- **Monitoring:** Wrangler tail for real-time logs

### **Configuration**
- **Environment Variables:** JWT secrets, API keys, CORS settings
- **Bindings:** D1 database, R2 storage, KV cache, AI services
- **Analytics:** Cloudflare Analytics for usage tracking

## 🔍 Current Issues & Solutions

### **1. Extraction Failures**
- **Issue:** Cloudflare AI network connectivity issues
- **Solution:** Added retry logic with exponential backoff
- **Status:** Implemented, monitoring effectiveness

### **2. Navigation Issues**
- **Issue:** Sidebar navigation using anchor tags instead of React Router
- **Solution:** Converted to React Router navigation with proper state management
- **Status:** ✅ Fixed and deployed

### **3. Timestamped Text for Video Editors**
- **Issue:** Need professional timestamped text format
- **Solution:** Added new export format with real segment timestamps
- **Status:** ✅ Implemented and deployed

## 📈 Recent Improvements

### **Tier-Based Dashboard System**
- Replaced role-based with subscription tier-based dashboards
- Professional design consistency across all tiers
- Usage tracking and upgrade prompts
- Beautiful transcription lists with gradient headers

### **Enhanced Export System**
- Real timestamp support from Whisper segments
- Professional timestamped text format for video editors
- Improved SRT/VTT accuracy with actual timing data
- Fallback timing estimation for legacy transcriptions

### **Navigation & UX**
- Fixed sidebar navigation with React Router
- Dedicated transcription list page with professional design
- Consistent styling across all components
- Improved user flow and accessibility

## 🔮 Next Steps

### **Immediate Priorities**
1. **OpenAI API Key:** Replace placeholder with valid key for production
2. **Payment Integration:** Complete Stripe subscription flow
3. **Advanced Features:** Implement speaker identification UI
4. **Performance:** Optimize large file processing

### **Feature Roadmap**
1. **Real-time Collaboration:** Multi-user editing capabilities
2. **Advanced Analytics:** Detailed usage and accuracy metrics
3. **API Documentation:** Public API for enterprise customers
4. **Mobile App:** Native mobile applications
5. **Integrations:** Zoom, Teams, Google Drive, Dropbox

## 🛠️ Development Workflow

### **Local Development**
```bash
npm install
npm run dev        # Start development server
npm run build      # Build for production
npx wrangler deploy # Deploy to Cloudflare
```

### **Monitoring**
```bash
npx wrangler tail  # Real-time logs
npx wrangler d1 execute audiotext-db --command "SELECT * FROM users LIMIT 5"
```

### **Database Management**
- Schema migrations in `src/worker/db/schema.sql`
- Repository pattern for data access
- Automatic table creation on first run

## 📋 Key Files

### **Backend Core**
- `src/worker/index.ts` - Main worker entry point and API routes
- `src/worker/db/repository.ts` - Database access layer
- `src/worker/services/transcriptionService.ts` - AI transcription logic

### **Frontend Core**
- `src/react-app/App.tsx` - Main app routing and layout
- `src/react-app/pages/ExtractionPage.tsx` - Audio upload and transcription
- `src/react-app/pages/TranscriptionListPage.tsx` - Transcription management
- `src/react-app/components/dashboard/` - Tier-based dashboards

### **Configuration**
- `wrangler.json` - Cloudflare Workers configuration
- `package.json` - Dependencies and build scripts
- `tailwind.config.js` - Styling configuration

---

**Last Updated:** 2025-08-09
**Version:** 2.0.0 (Tier-Based Dashboard System)
**Status:** Production Ready (pending OpenAI API key)
