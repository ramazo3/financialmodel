# Inachee Financial Agent (IFA)

## Overview
The Inachee Financial Agent (IFA) is an AI-powered web application designed to generate comprehensive financial models from simple user inputs. It leverages Google Gemini AI with a 4-agent orchestration system to analyze business ideas and produce detailed Excel financial models and professional business reports. The project aims to provide users with a powerful tool for financial planning, analysis, and strategic decision-making, offering insights into market potential and business viability.

## User Preferences
I prefer iterative development with clear communication at each stage. Ask for confirmation before making significant architectural changes or adding new external dependencies. I appreciate detailed explanations for complex technical decisions. Ensure the codebase remains clean, well-commented, and follows best practices.

## System Architecture

### UI/UX Decisions
The application features a professional financial services aesthetic, utilizing a primary blue color (#4472C4), with Inter for UI text and JetBrains Mono for numbers and data. Shadcn UI components with custom styling are used for a consistent look and feel. The design is mobile-first, with responsive breakpoints at 768px (md) and 1024px (lg). The user interface includes a multi-step form wizard for progressive disclosure of business input collection, a results dashboard with interactive 5-year charts, and dedicated pages for managing saved models, version history, and scenario planning.

### Technical Implementations
The application is built with a React, TypeScript, and Tailwind CSS frontend, using TanStack Query for data fetching and Recharts for interactive visualizations. The backend uses Node.js and Express with TypeScript. Data persistence is handled by PostgreSQL (Neon) with Drizzle ORM. AI capabilities are powered by the Google Gemini API (gemini-2.5-flash, gemini-2.5-pro). File generation for Excel workbooks is done using ExcelJS, and for Word documents using the docx library.

### Feature Specifications
- **Multi-step Form Wizard**: Guides users through input collection.
- **Sector Selection**: Allows browsing and selection from 35+ pre-analyzed business sectors with benchmarks. Includes AI-powered sector recommendations.
- **Financial Input Forms**: Customizable inputs for startup costs, revenue, margins, and expenses with live calculations.
- **AI Agent Processing**: A 4-agent system (Data Analyst, Financial Modeler, Validator, Excel Generator) orchestrates model generation.
- **Results Dashboard**: Displays key metrics, an executive summary, risks, recommendations, and interactive 5-year charts.
- **Excel Download**: Provides a complete financial model with 7 comprehensive worksheets, professional formatting, and auto-filters.
- **DOCX Download**: Generates a professional business report including cover page, executive summary, financial projections, risk analysis, and market benchmarks.
- **Saved Models**: Functionality to view, manage, and retrieve all generated models.
- **Version History**: Enables saving model snapshots, tracking changes, and restoring previous versions.
- **Scenario Planning**: Allows creation, editing, deletion, and comparison of alternative financial scenarios.
- **Editable Assumptions**: Users can update financial assumptions and regenerate models, preserving the business idea and sector.

### System Design Choices
The system uses a client-server architecture. The frontend handles user interaction and displays results, while the backend manages API requests, AI processing, data storage, and file generation. AI processing runs asynchronously in the background, with the frontend polling for model completion. Financial calculations are primarily executed server-side by the AI agents. Business sector data is loaded from a CSV into the database on server startup. Generated Excel and DOCX files are stored in a dedicated `generated_models/` directory.

## External Dependencies

- **PostgreSQL (Neon)**: Database for storing financial models, user inputs, sector data, versions, and scenarios.
- **Google Gemini API**: Utilized for AI-powered financial analysis, modeling, validation, and sector recommendations. Specific models used are `gemini-2.5-flash` and `gemini-2.5-pro`.
- **ExcelJS**: Library used for generating multi-sheet Excel workbooks programmatically.
- **docx**: Library used for generating professional DOCX business reports.
- **CSV-based business sector dataset**: Contains pre-analyzed data for 34 business sectors, loaded into the database.