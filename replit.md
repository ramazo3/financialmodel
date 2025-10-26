# Inachee Financial Agent (IFA) - AI-Powered Financial Modeling Tool

## Project Overview
An AI-powered web application that generates comprehensive financial models from simple user inputs. Uses Google Gemini AI with a 4-agent orchestration system to analyze business ideas and create detailed Excel financial models.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI components, TanStack Query
- **Backend**: Node.js, Express, TypeScript
- **AI**: Google Gemini API (gemini-2.5-flash, gemini-2.5-pro)
- **File Generation**: ExcelJS for creating Excel workbooks
- **Data**: CSV-based business sector dataset (35+ pre-analyzed sectors)
- **Storage**: In-memory storage (MemStorage)

## Key Features
1. **Multi-step Form Wizard**: Progressive disclosure of business input collection
2. **Sector Selection**: Browse and select from 35+ pre-analyzed business sectors with benchmarks
3. **Financial Input Forms**: Customize startup costs, revenue, margins, and expenses
4. **AI Agent Processing**: 4-agent system (Data Analyst, Financial Modeler, Validator, Excel Generator)
5. **Results Dashboard**: View key metrics, executive summary, risks, and recommendations
6. **Excel Download**: Complete financial model with multiple worksheets

## Architecture

### Frontend Components
- `pages/home.tsx` - Main page with step-by-step wizard
- `components/business-idea-form.tsx` - Step 1: Business idea description
- `components/sector-selection.tsx` - Step 2: Sector matching and selection
- `components/financial-assumptions-form.tsx` - Step 3: Financial inputs with live calculations
- `components/agent-processing.tsx` - Step 4: AI processing status display
- `components/results-dashboard.tsx` - Step 5: Results and download

### Backend Services
- `server/routes.ts` - API endpoints for sectors, model generation, downloads
- `server/gemini-service.ts` - Gemini AI integration with 4-agent orchestration
- `server/excel-generator.ts` - Excel workbook generation using ExcelJS
- `server/load-sectors.ts` - CSV data loading for business sectors
- `server/storage.ts` - In-memory data storage

### Data Model (`shared/schema.ts`)
- **BusinessSector**: Sector benchmark data with 35+ metrics
- **FinancialModel**: User inputs and generated model data
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

### `GET /api/models/:id`
Retrieves financial model by ID (including generated results)

### `GET /api/download/:id`
Downloads the Excel file for a completed model

## Environment Variables
- `GEMINI_API_KEY` - Google Gemini API key (required)
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
  load-sectors.ts - CSV data loading
  routes.ts - API routes
  storage.ts - Data storage
shared/
  schema.ts - TypeScript types and Zod schemas
generated_models/ - Excel files output directory
```

## Development Notes
- Business sector data loaded on server startup from CSV
- Excel files saved to `generated_models/` directory
- AI processing runs asynchronously in background
- Frontend polls for model completion
- All financial calculations done server-side by AI agents

## Recent Changes (Latest Session)
- Created complete frontend with 5-step wizard
- Implemented all React components with professional UI
- Built Gemini AI integration with 4-agent system
- Added Excel file generation with ExcelJS
- Loaded 35 business sectors from CSV dataset
- Set up API routes for model generation and downloads
