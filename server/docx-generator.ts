import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import type { GeneratedModel, BusinessSector } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

export async function generateDocxFile(
  modelId: string,
  generatedModel: GeneratedModel,
  businessIdea: string,
  sectorData?: BusinessSector
): Promise<string> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Cover Page
          new Paragraph({
            text: "BUSINESS RESEARCH REPORT",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: businessIdea,
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
          }),
          new Paragraph({
            text: `Generated: ${new Date().toLocaleDateString()}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 1200 },
          }),

          // Executive Summary Section
          new Paragraph({
            text: "EXECUTIVE SUMMARY",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...generatedModel.executiveSummary.split("\n").map(
            (line) =>
              new Paragraph({
                text: line,
                spacing: { after: 100 },
              })
          ),

          // Financial Overview Section
          new Paragraph({
            text: "FINANCIAL OVERVIEW",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            pageBreakBefore: true,
          }),
          new Paragraph({
            text: "Key Financial Metrics",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          
          // Key Metrics Table
          createKeyMetricsTable(generatedModel),

          // 5-Year Projections
          ...(generatedModel.annualProjections && generatedModel.annualProjections.length > 0
            ? [
                new Paragraph({
                  text: "5-Year Financial Projections",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 400, after: 100 },
                }),
                createAnnualProjectionsTable(generatedModel),
              ]
            : []),

          // Risk Analysis Section
          new Paragraph({
            text: "RISK ANALYSIS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            pageBreakBefore: true,
          }),
          createRiskAnalysisTable(generatedModel),

          // Strategic Recommendations Section
          new Paragraph({
            text: "STRATEGIC RECOMMENDATIONS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            pageBreakBefore: true,
          }),
          ...generatedModel.recommendations.map(
            (rec, index) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. `,
                    bold: true,
                  }),
                  new TextRun({
                    text: rec,
                  }),
                ],
                spacing: { after: 200 },
              })
          ),

          // Market Analysis Section (if sector data available)
          ...(sectorData
            ? [
                new Paragraph({
                  text: "MARKET ANALYSIS",
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 400, after: 200 },
                  pageBreakBefore: true,
                }),
                new Paragraph({
                  text: `Sector: ${sectorData.sectorName}`,
                  heading: HeadingLevel.HEADING_2,
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Investor Persona Fit: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: sectorData.investorPersonaFit,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                createSectorBenchmarksTable(sectorData),
              ]
            : []),
        ],
      },
    ],
  });

  // Save file
  const fileName = `business-report-${modelId}.docx`;
  const filePath = path.join(process.cwd(), "generated_models", fileName);

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  console.log(`DOCX file generated: ${filePath}`);

  return filePath;
}

function createKeyMetricsTable(generatedModel: GeneratedModel): Table {
  const metrics = [
    ["Break-Even Month", `Month ${generatedModel.keyMetrics.breakEvenMonth}`],
    ["Year 1 Total Revenue", `$${generatedModel.keyMetrics.year1TotalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Year 1 Net Profit", `$${generatedModel.keyMetrics.year1NetProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Return on Investment (ROI)", `${generatedModel.keyMetrics.roi.toFixed(1)}%`],
    ["Payback Period", `${generatedModel.keyMetrics.paybackPeriod} months`],
  ];

  if (generatedModel.keyMetrics.projectedYear5Revenue && generatedModel.keyMetrics.projectedYear5NetProfit) {
    metrics.push(
      ["Year 5 Revenue (Projected)", `$${generatedModel.keyMetrics.projectedYear5Revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ["Year 5 Net Profit (Projected)", `$${generatedModel.keyMetrics.projectedYear5NetProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: metrics.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ text: value })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        })
    ),
  });
}

function createAnnualProjectionsTable(generatedModel: GeneratedModel): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Year", bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Revenue", bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Expenses", bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Gross Profit", bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Net Profit", bold: true })] })] }),
    ],
  });

  const dataRows = generatedModel.annualProjections!.map(
    (proj) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: `Year ${proj.year}` })] }),
          new TableCell({ children: [new Paragraph({ text: `$${proj.revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` })] }),
          new TableCell({ children: [new Paragraph({ text: `$${proj.expenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` })] }),
          new TableCell({ children: [new Paragraph({ text: `$${proj.grossProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` })] }),
          new TableCell({ children: [new Paragraph({ text: `$${proj.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` })] }),
        ],
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

function createRiskAnalysisTable(generatedModel: GeneratedModel): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Risk", bold: true })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Impact", bold: true })] })], width: { size: 15, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Mitigation Strategy", bold: true })] })], width: { size: 55, type: WidthType.PERCENTAGE } }),
    ],
  });

  const dataRows = generatedModel.riskAnalysis.map(
    (risk) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: risk.risk })] }),
          new TableCell({ children: [new Paragraph({ text: risk.impact })] }),
          new TableCell({ children: [new Paragraph({ text: risk.mitigation })] }),
        ],
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

function createSectorBenchmarksTable(sectorData: BusinessSector): Table {
  const benchmarks = [
    ["Inachee Index Score", `${sectorData.inacheeIndexScore}/100`],
    ["Average Startup Cost", `$${parseFloat(sectorData.totalStartupCost).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Expected Year 1 Revenue", `$${parseFloat(sectorData.year1Revenue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Target Gross Margin", `${parseFloat(sectorData.grossMarginTarget).toFixed(1)}%`],
    ["Expected Year 1 ROI", `${parseFloat(sectorData.year1ROI).toFixed(1)}%`],
    ["ROI Potential", `${sectorData.roiPotential}/10`],
    ["Scalability", `${sectorData.scalability}/10`],
    ["Market Resilience", `${sectorData.marketResilience}/10`],
    ["Execution Simplicity", `${sectorData.executionSimplicity}/10`],
    ["Compliance Simplicity", `${sectorData.complianceSimplicity}/10`],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: benchmarks.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
              width: { size: 60, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ text: value })],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
          ],
        })
    ),
  });
}
