import ExcelJS from "exceljs";
import type { GeneratedModel } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

export async function generateExcelFile(
  modelId: string,
  generatedModel: GeneratedModel,
  businessIdea: string
): Promise<string> {
  const workbook = new ExcelJS.Workbook();

  // Set workbook properties
  workbook.creator = "Inachee Financial Agent";
  workbook.created = new Date();

  // Sheet 1: Executive Summary
  const summarySheet = workbook.addWorksheet("Executive Summary");
  summarySheet.columns = [
    { key: "label", width: 30 },
    { key: "value", width: 60 },
  ];

  summarySheet.addRow({ label: "Business Idea", value: businessIdea });
  summarySheet.addRow({});
  summarySheet.addRow({ label: "EXECUTIVE SUMMARY", value: "" });
  summarySheet.getCell("A3").font = { bold: true, size: 14 };
  summarySheet.addRow({});
  
  const summaryLines = generatedModel.executiveSummary.split("\n");
  summaryLines.forEach((line) => {
    summarySheet.addRow({ label: "", value: line });
  });

  // Sheet 2: Revenue Projections
  const revenueSheet = workbook.addWorksheet("Revenue Projections");
  revenueSheet.columns = [
    { key: "month", header: "Month", width: 10 },
    { key: "revenue", header: "Revenue", width: 15 },
    { key: "costs", header: "COGS", width: 15 },
    { key: "grossProfit", header: "Gross Profit", width: 15 },
    { key: "margin", header: "Margin %", width: 12 },
  ];

  revenueSheet.getRow(1).font = { bold: true };
  revenueSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  revenueSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  generatedModel.revenueProjections.forEach((proj) => {
    revenueSheet.addRow({
      month: proj.month,
      revenue: proj.revenue,
      costs: proj.costs,
      grossProfit: proj.grossProfit,
      margin: ((proj.grossProfit / proj.revenue) * 100).toFixed(1) + "%",
    });
  });

  // Format currency columns
  revenueSheet.getColumn("revenue").numFmt = "$#,##0.00";
  revenueSheet.getColumn("costs").numFmt = "$#,##0.00";
  revenueSheet.getColumn("grossProfit").numFmt = "$#,##0.00";

  // Sheet 3: Cash Flow
  const cashFlowSheet = workbook.addWorksheet("Cash Flow");
  cashFlowSheet.columns = [
    { key: "month", header: "Month", width: 10 },
    { key: "inflow", header: "Cash Inflow", width: 15 },
    { key: "outflow", header: "Cash Outflow", width: 15 },
    { key: "netCashFlow", header: "Net Cash Flow", width: 15 },
    { key: "cumulativeCash", header: "Cumulative Cash", width: 18 },
  ];

  cashFlowSheet.getRow(1).font = { bold: true };
  cashFlowSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF70AD47" },
  };
  cashFlowSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  generatedModel.cashFlow.forEach((cf) => {
    cashFlowSheet.addRow({
      month: cf.month,
      inflow: cf.inflow,
      outflow: cf.outflow,
      netCashFlow: cf.netCashFlow,
      cumulativeCash: cf.cumulativeCash,
    });
  });

  // Format currency columns
  cashFlowSheet.getColumn("inflow").numFmt = "$#,##0.00";
  cashFlowSheet.getColumn("outflow").numFmt = "$#,##0.00";
  cashFlowSheet.getColumn("netCashFlow").numFmt = "$#,##0.00";
  cashFlowSheet.getColumn("cumulativeCash").numFmt = "$#,##0.00";

  // Sheet 4: Annual Projections (5-Year)
  if (generatedModel.annualProjections && generatedModel.annualProjections.length > 0) {
    const annualSheet = workbook.addWorksheet("Annual Projections");
    annualSheet.columns = [
      { key: "year", header: "Year", width: 10 },
      { key: "revenue", header: "Revenue", width: 18 },
      { key: "expenses", header: "Total Expenses", width: 18 },
      { key: "grossProfit", header: "Gross Profit", width: 18 },
      { key: "netProfit", header: "Net Profit", width: 18 },
      { key: "profitMargin", header: "Profit Margin %", width: 15 },
    ];

    annualSheet.getRow(1).font = { bold: true };
    annualSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF9966FF" },
    };
    annualSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    generatedModel.annualProjections.forEach((proj) => {
      annualSheet.addRow({
        year: `Year ${proj.year}`,
        revenue: proj.revenue,
        expenses: proj.expenses,
        grossProfit: proj.grossProfit,
        netProfit: proj.netProfit,
        profitMargin: ((proj.netProfit / proj.revenue) * 100).toFixed(1) + "%",
      });
    });

    // Format currency columns
    annualSheet.getColumn("revenue").numFmt = "$#,##0.00";
    annualSheet.getColumn("expenses").numFmt = "$#,##0.00";
    annualSheet.getColumn("grossProfit").numFmt = "$#,##0.00";
    annualSheet.getColumn("netProfit").numFmt = "$#,##0.00";

    // Add totals row
    const lastRow = annualSheet.rowCount;
    annualSheet.addRow({});
    const totalsRow = annualSheet.addRow({
      year: "TOTAL (5 Years)",
      revenue: { formula: `SUM(B2:B${lastRow + 1})` },
      expenses: { formula: `SUM(C2:C${lastRow + 1})` },
      grossProfit: { formula: `SUM(D2:D${lastRow + 1})` },
      netProfit: { formula: `SUM(E2:E${lastRow + 1})` },
      profitMargin: "",
    });

    totalsRow.font = { bold: true };
    totalsRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };
  }

  // Sheet 5: Key Metrics
  const metricsSheet = workbook.addWorksheet("Key Metrics");
  metricsSheet.columns = [
    { key: "metric", width: 30 },
    { key: "value", width: 20 },
  ];

  metricsSheet.addRow({ metric: "KEY FINANCIAL METRICS", value: "" });
  metricsSheet.getCell("A1").font = { bold: true, size: 14 };
  metricsSheet.addRow({});
  metricsSheet.addRow({ metric: "Break-Even Month", value: `Month ${generatedModel.keyMetrics.breakEvenMonth}` });
  metricsSheet.addRow({ metric: "Year 1 Total Revenue", value: generatedModel.keyMetrics.year1TotalRevenue });
  metricsSheet.addRow({ metric: "Year 1 Net Profit", value: generatedModel.keyMetrics.year1NetProfit });
  metricsSheet.addRow({ metric: "ROI %", value: `${generatedModel.keyMetrics.roi.toFixed(1)}%` });
  metricsSheet.addRow({ metric: "Payback Period (months)", value: generatedModel.keyMetrics.paybackPeriod });
  
  // Add Year 5 projections if available (check for undefined/null, not truthiness)
  if (generatedModel.keyMetrics.projectedYear5Revenue !== undefined && 
      generatedModel.keyMetrics.projectedYear5Revenue !== null &&
      generatedModel.keyMetrics.projectedYear5NetProfit !== undefined &&
      generatedModel.keyMetrics.projectedYear5NetProfit !== null) {
    metricsSheet.addRow({});
    metricsSheet.addRow({ metric: "5-YEAR PROJECTIONS", value: "" });
    metricsSheet.getCell(`A${metricsSheet.rowCount}`).font = { bold: true };
    metricsSheet.addRow({ metric: "Year 5 Revenue", value: generatedModel.keyMetrics.projectedYear5Revenue });
    metricsSheet.addRow({ metric: "Year 5 Net Profit", value: generatedModel.keyMetrics.projectedYear5NetProfit });
  }

  metricsSheet.getColumn("value").numFmt = "$#,##0.00";

  // Sheet 6: Risk Analysis
  const riskSheet = workbook.addWorksheet("Risk Analysis");
  riskSheet.columns = [
    { key: "risk", header: "Risk", width: 30 },
    { key: "impact", header: "Impact", width: 15 },
    { key: "mitigation", header: "Mitigation Strategy", width: 50 },
  ];

  riskSheet.getRow(1).font = { bold: true };
  riskSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFC000" },
  };
  riskSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  generatedModel.riskAnalysis.forEach((risk) => {
    riskSheet.addRow({
      risk: risk.risk,
      impact: risk.impact,
      mitigation: risk.mitigation,
    });
  });

  // Sheet 7: Recommendations
  const recSheet = workbook.addWorksheet("Recommendations");
  recSheet.columns = [
    { key: "num", header: "#", width: 5 },
    { key: "recommendation", header: "Strategic Recommendation", width: 80 },
  ];

  recSheet.getRow(1).font = { bold: true };
  recSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF5B9BD5" },
  };
  recSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  generatedModel.recommendations.forEach((rec, index) => {
    recSheet.addRow({
      num: index + 1,
      recommendation: rec,
    });
  });

  // Save file
  const fileName = `financial-model-${modelId}.xlsx`;
  const filePath = path.join(process.cwd(), "generated_models", fileName);

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file generated: ${filePath}`);

  return filePath;
}
