# Inachee Financial Agent (IFA) - AI-Powered Financial Modeling Tool

## Project Overview
An AI-powered web application that generates comprehensive financial models from simple user inputs. Uses Google Gemini AI with a 4-agent orchestration system to analyze business ideas and create detailed Excel financial models.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI components, TanStack Query, Recharts
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **AI**: Google Gemini API (gemini-2.5-flash, gemini-2.5-pro)
- **File Generation**: ExcelJS for Excel workbooks, docx library for Word documents
- **Data**: CSV-based business sector dataset (34 pre-analyzed sectors loaded into database)

## Key Features
1. **Multi-step Form Wizard**: Progressive disclosure of business input collection
2. **Sector Selection**: Browse and select from 35+ pre-analyzed business sectors with benchmarks
3. **Financial Input Forms**: Customize startup costs, revenue, margins, and expenses
4. **AI Agent Processing**: 4-agent system (Data Analyst, Financial Modeler, Validator, Excel Generator)
5. **Results Dashboard**: View key metrics, executive summary, risks, and recommendations with interactive 5-year charts
6. **Excel Download**: Complete financial model with 7 comprehensive worksheets
7. **DOCX Download**: Professional business report with cover page, executive summary, financial projections, risk analysis, and market benchmarks
8. **Saved Models**: View and manage all generated models with list and detail pages
9. **Version History**: Save model snapshots and restore previous versions with change tracking
10. **Scenario Planning**: Create and compare alternative financial scenarios

## Architecture

### Frontend Components
- `pages/home.tsx` - Main page with step-by-step wizard
- `pages/models.tsx` - List view of all saved models
- `pages/model-detail.tsx` - Detailed view of individual model with results
- `components/header.tsx` - Reusable navigation header with IFA logo
- `components/business-idea-form.tsx` - Step 1: Business idea description
- `components/sector-selection.tsx` - Step 2: Sector matching and selection
- `components/financial-assumptions-form.tsx` - Step 3: Financial inputs with live calculations
- `components/agent-processing.tsx` - Step 4: AI processing status display
- `components/results-dashboard.tsx` - Step 5: Results and download with enhanced risk analysis UI
- `components/version-history.tsx` - Version control with save/restore functionality
- `components/scenario-planning.tsx` - Scenario analysis with CRUD operations and comparison table

### Backend Services
- `server/routes.ts` - API endpoints for sectors, model generation, Excel/DOCX downloads
- `server/gemini-service.ts` - Gemini AI integration with 4-agent orchestration
- `server/excel-generator.ts` - Excel workbook generation with 7 worksheets using ExcelJS
- `server/docx-generator.ts` - DOCX business report generation using docx library
- `server/load-sectors.ts` - CSV data loading for business sectors
- `server/storage.ts` - PostgreSQL database storage implementation with Drizzle ORM
- `server/db.ts` - Database connection setup

### Data Model (`shared/schema.ts`)
- **businessSectors**: Sector benchmark data with 35+ metrics, supports custom user-created sectors
- **financialModels**: User inputs and generated model data with versioning support
- **modelVersions**: Version history for tracking changes to financial models
- **scenarios**: Scenario planning with multiple assumption sets per model
- **GeneratedModel**: AI-generated projections, metrics, risks, recommendations

## AI Agent System

### Agent 1: Data Analyst
- Analyzes business idea against sector benchmarks
- Provides market opportunity assessment
- Compares user assumptions to industry data

### Agent 2: Financial Modeler
- Creates 12-month revenue projections
- Builds cash flow models
- Calculates key metrics (ROI, break-even, payback period)
- Generates structured JSON output

### Agent 3: Validator
- Validates model completeness and reasonableness
- Adjusts projections if needed
- Ensures all required data is present

### Agent 4: Excel Generator
- Creates multi-sheet Excel workbook
- Formats data with proper currency and number formats
- Applies professional styling with colors and headers

## API Endpoints

### `GET /api/sectors`
Returns all business sectors from the dataset

### `POST /api/generate-model`
Initiates financial model generation
- Body: businessIdea, selectedSector, startupCost, monthlyRevenue, grossMargin, operatingExpenses
- Returns: model ID and processing status
- Triggers background AI processing

### `GET /api/models`
Returns all financial models for the user

### `GET /api/models/:id`
Retrieves financial model by ID (including generated results)

### `GET /api/download/:id`
Downloads the Excel file for a completed model

### `GET /api/download-docx/:id`
Downloads the DOCX business report for a completed model

### `GET /api/models/:id/versions`
Returns version history for a specific model

### `POST /api/models/:id/versions`
Creates a new version snapshot of the current model state
- Body: { changeDescription?: string }

### `POST /api/models/:modelId/versions/:versionId/restore`
Restores a model to a previous version

### `GET /api/models/:id/scenarios`
Returns all scenarios for a specific model

### `POST /api/models/:id/scenarios`
Creates a new scenario with alternative assumptions
- Body: { name, description?, startupCost?, monthlyRevenue?, grossMargin?, operatingExpenses? }
- All numeric fields are validated and coerced properly

### `PUT /api/scenarios/:id`
Updates an existing scenario
- Body: same as POST (all fields optional except validation rules)

### `DELETE /api/scenarios/:id`
Deletes a scenario

## Environment Variables
- `IFA_GEMINI_API_KEY` - Google Gemini API key (required)
- `PORT` - Server port (default: 5000)

## Design System
- Professional financial services aesthetic
- Primary color: Blue (#4472C4)
- Font: Inter (UI), JetBrains Mono (numbers/data)
- Components: Shadcn UI with custom styling
- Responsive: Mobile-first with breakpoints at 768px (md) and 1024px (lg)

## File Structure
```
attached_assets/
  Complete Master Structured Dataset (V2) - Sheet1_1761485381551.csv
client/
  src/
    components/ - React components
    pages/ - Page components
    lib/ - Utilities (queryClient)
server/
  gemini-service.ts - AI orchestration
  excel-generator.ts - Excel file creation
  docx-generator.ts - DOCX report generation
  load-sectors.ts - CSV data loading
  routes.ts - API routes
  storage.ts - Data storage
shared/
  schema.ts - TypeScript types and Zod schemas
generated_models/ - Excel and DOCX files output directory
```

## Development Notes
- Business sector data loaded on server startup from CSV
- Excel and DOCX files saved to `generated_models/` directory
- AI processing runs asynchronously in background
- Both Excel and DOCX files generated during processing
- Frontend polls for model completion
- All financial calculations done server-side by AI agents

## Recent Changes

### Latest Session (October 28, 2025)
- **Phase 1: Interactive Web Visualizations**:
  - Created comprehensive FinancialCharts component with 5 interactive Recharts visualizations
  - 5-Year Revenue vs Expenses (Bar Chart) - AI-generated projections
  - Monthly Revenue Breakdown (Area Chart) - Year 1 detail with revenue/costs/profit
  - Monthly Cash Flow Analysis (Line Chart) - inflow/outflow/cumulative tracking
  - Break-Even Visualization (Area Chart) - with highlighted break-even point
  - Gross Profit Margin Trend (Line Chart) - month-over-month percentage
  - Enhanced schema with `annualProjections` array for 5-year data
  - Added `projectedYear5Revenue` and `projectedYear5NetProfit` to keyMetrics
  - Updated Gemini AI prompts to generate realistic 5-year growth projections (20-60% Year 2, tapering to 10-30% by Year 5)
  - Added validator fallback to ensure 5 years of annual projections
  - All charts use real AI-generated data (no hardcoded multipliers)
  - Professional formatting with currency ($xx,xxx) and percentage (xx.x%) displays
  - Responsive design with proper tooltips, legends, and color-coding
  - Integrated charts into ResultsDashboard after Executive Summary

- **Phase 2: Enhanced Excel Reports**:
  - **Phase 2.1**: Enhanced Excel generator with 7 comprehensive worksheets
    - Annual Projections (5-year data with SUM formulas)
    - Monthly Projections (Year 1 detail)
    - Cash Flow Analysis (monthly tracking)
    - Profit & Loss Statement
    - Risk Analysis (with severity and mitigation)
    - Strategic Recommendations
    - Sector Benchmarks
  - **Phase 2.2**: Skipped - ExcelJS does not support native charts
  - **Phase 2.3**: Professional Excel Formatting
    - Freeze panes on all worksheet headers
    - Auto-filters for all data tables
    - Optimized column widths for readability
    - Text wrapping for long content cells
    - Currency and percentage formatting

- **Phase 3: DOCX Report Generation**:
  - Created comprehensive DOCX business report generator (server/docx-generator.ts)
  - Document sections:
    - Cover Page with business title and date
    - Executive Summary from AI analysis
    - Financial Overview table with key metrics (Year 1 + Year 5)
    - 5-Year Financial Projections table
    - Risk Analysis table with impact levels and mitigation strategies
    - Strategic Recommendations numbered list
    - Market Analysis with sector benchmarks (when available)
  - API endpoint: GET /api/download-docx/:id
  - Frontend download buttons in 2-column grid layout (Excel + DOCX)
  - Professional formatting with properly structured tables using TextRun for bold text
  - Conditional rendering for optional sections
  - Files generated during background processing alongside Excel files

### Previous Session (October 26, 2025)
- **UI Improvements**:
  - Enhanced Risk Analysis section with color-coded severity levels (High/Medium/Low)
  - Added border-left accent colors based on risk impact
  - Improved typography and spacing for better readability
  - Professional formatting with distinct mitigation strategy sections
  - Added IFA logo to application header across all pages
  - Created reusable Header component with navigation
- **Scenario Planning Feature**: Implemented complete scenario analysis system
  - Create alternative scenarios with different financial assumptions
  - Edit and delete scenarios with proper validation
  - Side-by-side comparison table showing baseline vs all scenarios
  - Professional formatting for currency and percentages
  - Full CRUD operations with Zod validation and error handling
  - React Hook Form with zodResolver for robust form validation
  - Proper numeric coercion handling empty fields (no NaN issues)
  - E2E tested and production-ready
- **Version History Feature**: Implemented full version control system
  - Save model snapshots with optional change descriptions
  - View version history with expandable financial details
  - Restore any previous version with confirmation dialog
  - Proper cache invalidation and toast notifications
  - E2E tested and production-ready
- **Saved Models Pages**: Added list and detail views
  - Models list page showing all generated models
  - Individual model detail page with full results
  - Download Excel files from both pages
  - Navigation between home and models pages
- **Database Migration**: Migrated from in-memory storage to PostgreSQL with Drizzle ORM
  - Enhanced schema with tables for model versions, scenarios, and custom sectors
  - Successfully loaded 33 out of 34 business sectors (1 malformed CSV row)
  - All models persist across server restarts with full ACID guarantees

### Previous Session
- Created complete frontend with 5-step wizard
- Implemented all React components with professional UI
- Built Gemini AI integration with 4-agent system
- Added Excel file generation with ExcelJS
- Set up API routes for model generation and downloads
