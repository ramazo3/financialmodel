import { GoogleGenAI } from "@google/genai";
import type { BusinessSector, GeneratedModel } from "@shared/schema";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface ModelGenerationInput {
  businessIdea: string;
  selectedSector?: string;
  startupCost: number;
  monthlyRevenue: number;
  grossMargin: number;
  operatingExpenses: number;
  sectorData?: BusinessSector;
}

// Agent 1: Data Analyst
async function runDataAnalystAgent(input: ModelGenerationInput): Promise<string> {
  const prompt = `You are a Data Analyst Agent specialized in business and financial analysis.

Analyze the following business idea and provide insights:

Business Idea: ${input.businessIdea}
Selected Sector: ${input.selectedSector || "Not specified"}
${input.sectorData ? `
Sector Benchmark Data:
- Average Startup Cost: $${input.sectorData.totalStartupCost}
- Expected Year 1 Revenue: $${input.sectorData.year1Revenue}
- Gross Margin: ${input.sectorData.grossMarginTarget}%
- Year 1 ROI: ~${input.sectorData.year1ROI}%
- Inachee Index Score: ${input.sectorData.inacheeIndexScore}/100
` : ""}

User's Assumptions:
- Startup Cost: $${input.startupCost}
- Monthly Revenue Target: $${input.monthlyRevenue}
- Gross Margin: ${input.grossMargin}%
- Operating Expenses: $${input.operatingExpenses}/month

Provide a comprehensive analysis covering:
1. Market opportunity assessment
2. Competitive positioning
3. How the user's assumptions compare to sector benchmarks
4. Key success factors for this business

Keep your response concise and actionable (500-800 words).`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Analysis completed";
}

// Agent 2: Financial Modeler
async function runFinancialModelerAgent(
  input: ModelGenerationInput,
  dataAnalysis: string
): Promise<GeneratedModel> {
  const systemPrompt = `You are a Financial Modeler Agent. Create detailed financial projections based on the provided business data.

Generate a comprehensive financial model with:
1. Executive Summary (2-3 paragraphs)
2. Monthly revenue projections for 12 months
3. Monthly cash flow projections for 12 months
4. Key financial metrics (break-even month, total revenue, net profit, ROI, payback period)
5. Risk analysis (3-5 key risks with impact and mitigation)
6. Strategic recommendations (5-7 actionable items)

Respond ONLY with valid JSON matching this exact structure.`;

  const prompt = `Business Idea: ${input.businessIdea}
Startup Cost: $${input.startupCost}
Monthly Revenue Target: $${input.monthlyRevenue}
Gross Margin: ${input.grossMargin}%
Operating Expenses: $${input.operatingExpenses}/month

Data Analyst Insights:
${dataAnalysis}

Generate the complete financial model.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          executiveSummary: { type: "string" },
          revenueProjections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "number" },
                revenue: { type: "number" },
                costs: { type: "number" },
                grossProfit: { type: "number" },
              },
              required: ["month", "revenue", "costs", "grossProfit"],
            },
          },
          cashFlow: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "number" },
                inflow: { type: "number" },
                outflow: { type: "number" },
                netCashFlow: { type: "number" },
                cumulativeCash: { type: "number" },
              },
              required: ["month", "inflow", "outflow", "netCashFlow", "cumulativeCash"],
            },
          },
          keyMetrics: {
            type: "object",
            properties: {
              breakEvenMonth: { type: "number" },
              year1TotalRevenue: { type: "number" },
              year1NetProfit: { type: "number" },
              roi: { type: "number" },
              paybackPeriod: { type: "number" },
            },
            required: ["breakEvenMonth", "year1TotalRevenue", "year1NetProfit", "roi", "paybackPeriod"],
          },
          riskAnalysis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk: { type: "string" },
                impact: { type: "string" },
                mitigation: { type: "string" },
              },
              required: ["risk", "impact", "mitigation"],
            },
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: [
          "executiveSummary",
          "revenueProjections",
          "cashFlow",
          "keyMetrics",
          "riskAnalysis",
          "recommendations",
        ],
      },
    },
    contents: prompt,
  });

  const rawJson = response.text;
  if (!rawJson) {
    throw new Error("Empty response from Financial Modeler");
  }

  return JSON.parse(rawJson) as GeneratedModel;
}

// Agent 3: Validator
async function runValidatorAgent(
  input: ModelGenerationInput,
  model: GeneratedModel
): Promise<GeneratedModel> {
  // Perform validation and make adjustments if needed
  // For now, we'll do basic validation
  
  // Ensure all projections have 12 months
  if (model.revenueProjections.length !== 12) {
    console.warn("Revenue projections don't have 12 months, padding...");
    while (model.revenueProjections.length < 12) {
      const lastMonth = model.revenueProjections[model.revenueProjections.length - 1];
      model.revenueProjections.push({
        month: model.revenueProjections.length + 1,
        revenue: lastMonth.revenue * 1.05, // 5% growth
        costs: lastMonth.costs * 1.03,
        grossProfit: lastMonth.grossProfit * 1.07,
      });
    }
  }

  if (model.cashFlow.length !== 12) {
    console.warn("Cash flow doesn't have 12 months, padding...");
    while (model.cashFlow.length < 12) {
      const lastMonth = model.cashFlow[model.cashFlow.length - 1];
      model.cashFlow.push({
        month: model.cashFlow.length + 1,
        inflow: lastMonth.inflow * 1.05,
        outflow: lastMonth.outflow * 1.03,
        netCashFlow: lastMonth.netCashFlow * 1.07,
        cumulativeCash: lastMonth.cumulativeCash + lastMonth.netCashFlow * 1.07,
      });
    }
  }

  // Validate key metrics are reasonable
  if (model.keyMetrics.breakEvenMonth < 1) model.keyMetrics.breakEvenMonth = 1;
  if (model.keyMetrics.breakEvenMonth > 24) model.keyMetrics.breakEvenMonth = 24;

  return model;
}

// Orchestrate all agents
export async function generateFinancialModel(input: ModelGenerationInput): Promise<GeneratedModel> {
  try {
    // Agent 1: Data Analyst
    console.log("Running Data Analyst Agent...");
    const dataAnalysis = await runDataAnalystAgent(input);

    // Agent 2: Financial Modeler
    console.log("Running Financial Modeler Agent...");
    const financialModel = await runFinancialModelerAgent(input, dataAnalysis);

    // Agent 3: Validator
    console.log("Running Validator Agent...");
    const validatedModel = await runValidatorAgent(input, financialModel);

    return validatedModel;
  } catch (error) {
    console.error("Error generating financial model:", error);
    throw error;
  }
}
