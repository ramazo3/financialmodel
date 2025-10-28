import { GoogleGenAI } from "@google/genai";
import type { BusinessSector, GeneratedModel } from "@shared/schema";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

const ai = new GoogleGenAI({ apiKey: process.env.IFA_GEMINI_API_KEY || "" });

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
2. Monthly revenue projections for 12 months (Year 1 detail)
3. Monthly cash flow projections for 12 months (Year 1 detail)
4. Annual projections for 5 years (with realistic growth assumptions based on the business sector and market conditions)
5. Key financial metrics (break-even month, Year 1 totals, ROI, payback period, Year 5 projections)
6. Risk analysis (3-5 key risks with impact and mitigation)
7. Strategic recommendations (5-7 actionable items)

For annual projections (Years 1-5):
- Base Year 1 on the monthly projections
- Project Years 2-5 with realistic growth rates considering:
  * Market maturity and competition
  * Operational scaling efficiencies
  * Industry growth trends
  * Startup lifecycle phases
- Include revenue, expenses, gross profit, and net profit for each year
- Growth rates should be credible (typically 20-60% for Year 2, tapering to 10-30% by Year 5)

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
          annualProjections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                year: { type: "number" },
                revenue: { type: "number" },
                expenses: { type: "number" },
                grossProfit: { type: "number" },
                netProfit: { type: "number" },
              },
              required: ["year", "revenue", "expenses", "grossProfit", "netProfit"],
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
              projectedYear5Revenue: { type: "number" },
              projectedYear5NetProfit: { type: "number" },
            },
            required: ["breakEvenMonth", "year1TotalRevenue", "year1NetProfit", "roi", "paybackPeriod", "projectedYear5Revenue", "projectedYear5NetProfit"],
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
          "annualProjections",
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

  // Ensure annual projections have 5 years
  if (!model.annualProjections || model.annualProjections.length !== 5) {
    console.warn("Annual projections don't have 5 years, generating fallback...");
    
    // Only generate fallback if we have valid Year 1 data
    const hasValidYear1Data = 
      typeof model.keyMetrics?.year1TotalRevenue === 'number' &&
      isFinite(model.keyMetrics.year1TotalRevenue) &&
      typeof model.keyMetrics?.year1NetProfit === 'number' &&
      isFinite(model.keyMetrics.year1NetProfit) &&
      model.keyMetrics.year1TotalRevenue >= model.keyMetrics.year1NetProfit;
    
    if (!hasValidYear1Data) {
      console.warn("Cannot generate annual projections fallback: Year 1 data is incomplete or invalid");
      model.annualProjections = []; // Set empty array to avoid undefined
      return model;
    }
    
    const year1Revenue = model.keyMetrics.year1TotalRevenue;
    const year1Expenses = year1Revenue - model.keyMetrics.year1NetProfit;
    
    model.annualProjections = [
      {
        year: 1,
        revenue: year1Revenue,
        expenses: year1Expenses,
        grossProfit: year1Revenue - year1Expenses,
        netProfit: model.keyMetrics.year1NetProfit,
      },
      {
        year: 2,
        revenue: year1Revenue * 1.4,
        expenses: year1Expenses * 1.3,
        grossProfit: (year1Revenue * 1.4) - (year1Expenses * 1.3),
        netProfit: (year1Revenue * 1.4) - (year1Expenses * 1.3),
      },
      {
        year: 3,
        revenue: year1Revenue * 1.9,
        expenses: year1Expenses * 1.6,
        grossProfit: (year1Revenue * 1.9) - (year1Expenses * 1.6),
        netProfit: (year1Revenue * 1.9) - (year1Expenses * 1.6),
      },
      {
        year: 4,
        revenue: year1Revenue * 2.5,
        expenses: year1Expenses * 2.0,
        grossProfit: (year1Revenue * 2.5) - (year1Expenses * 2.0),
        netProfit: (year1Revenue * 2.5) - (year1Expenses * 2.0),
      },
      {
        year: 5,
        revenue: year1Revenue * 3.2,
        expenses: year1Expenses * 2.5,
        grossProfit: (year1Revenue * 3.2) - (year1Expenses * 2.5),
        netProfit: (year1Revenue * 3.2) - (year1Expenses * 2.5),
      },
    ];
  }

  // Ensure Year 5 metrics are set (only if we have valid annual projections)
  if (model.annualProjections && model.annualProjections.length === 5) {
    if (!model.keyMetrics.projectedYear5Revenue || !isFinite(model.keyMetrics.projectedYear5Revenue)) {
      model.keyMetrics.projectedYear5Revenue = model.annualProjections[4].revenue;
    }
    if (!model.keyMetrics.projectedYear5NetProfit || !isFinite(model.keyMetrics.projectedYear5NetProfit)) {
      model.keyMetrics.projectedYear5NetProfit = model.annualProjections[4].netProfit;
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
