import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Business Sector data structure
export const businessSectors = pgTable("business_sectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectorName: text("sector_name").notNull(),
  investorPersonaFit: text("investor_persona_fit").notNull(),
  year1Revenue: numeric("year1_revenue").notNull(),
  grossMarginTarget: numeric("gross_margin_target").notNull(),
  totalStartupCost: numeric("total_startup_cost").notNull(),
  year1ROI: numeric("year1_roi").notNull(),
  inacheeIndexScore: integer("inachee_index_score").notNull(),
  roiPotential: integer("roi_potential").notNull(),
  scalability: integer("scalability").notNull(),
  complianceSimplicity: integer("compliance_simplicity").notNull(),
  marketResilience: integer("market_resilience").notNull(),
  executionSimplicity: integer("execution_simplicity").notNull(),
  equipmentCost: text("equipment_cost").notNull(),
  legalCost: text("legal_cost").notNull(),
  inventoryCost: text("inventory_cost").notNull(),
  topRisk: text("top_risk").notNull(),
  mitigatingControl: text("mitigating_control").notNull(),
});

export type BusinessSector = typeof businessSectors.$inferSelect;

// Financial Model Generation Request
export const financialModels = pgTable("financial_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessIdea: text("business_idea").notNull(),
  selectedSector: text("selected_sector"),
  startupCost: numeric("startup_cost"),
  monthlyRevenue: numeric("monthly_revenue"),
  grossMargin: numeric("gross_margin"),
  operatingExpenses: numeric("operating_expenses"),
  customAssumptions: jsonb("custom_assumptions"),
  generatedModel: jsonb("generated_model"),
  excelFilePath: text("excel_file_path"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertFinancialModelSchema = createInsertSchema(financialModels).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertFinancialModel = z.infer<typeof insertFinancialModelSchema>;
export type FinancialModel = typeof financialModels.$inferSelect;

// User input schemas for the multi-step form
export const businessIdeaInputSchema = z.object({
  businessIdea: z.string().min(20, "Please provide at least 20 characters describing your business idea"),
  selectedSector: z.string().optional(),
});

export type BusinessIdeaInput = z.infer<typeof businessIdeaInputSchema>;

export const financialAssumptionsSchema = z.object({
  startupCost: z.number().min(0, "Startup cost must be positive"),
  monthlyRevenue: z.number().min(0, "Monthly revenue must be positive"),
  grossMargin: z.number().min(0).max(100, "Gross margin must be between 0 and 100"),
  operatingExpenses: z.number().min(0, "Operating expenses must be positive"),
  customAssumptions: z.record(z.string(), z.any()).optional(),
});

export type FinancialAssumptions = z.infer<typeof financialAssumptionsSchema>;

// AI Agent status tracking
export const agentStatusSchema = z.object({
  currentAgent: z.enum(["data_analyst", "financial_modeler", "validator", "excel_generator", "completed"]),
  progress: z.number().min(0).max(100),
  statusMessage: z.string(),
  completedAgents: z.array(z.string()),
});

export type AgentStatus = z.infer<typeof agentStatusSchema>;

// Generated financial model structure
export const generatedModelSchema = z.object({
  executiveSummary: z.string(),
  revenueProjections: z.array(z.object({
    month: z.number(),
    revenue: z.number(),
    costs: z.number(),
    grossProfit: z.number(),
  })),
  cashFlow: z.array(z.object({
    month: z.number(),
    inflow: z.number(),
    outflow: z.number(),
    netCashFlow: z.number(),
    cumulativeCash: z.number(),
  })),
  keyMetrics: z.object({
    breakEvenMonth: z.number(),
    year1TotalRevenue: z.number(),
    year1NetProfit: z.number(),
    roi: z.number(),
    paybackPeriod: z.number(),
  }),
  riskAnalysis: z.array(z.object({
    risk: z.string(),
    impact: z.string(),
    mitigation: z.string(),
  })),
  recommendations: z.array(z.string()),
});

export type GeneratedModel = z.infer<typeof generatedModelSchema>;
