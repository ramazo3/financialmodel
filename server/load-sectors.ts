import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { storage } from "./storage";
import type { BusinessSector } from "@shared/schema";
import { randomUUID } from "crypto";

export async function loadBusinessSectors() {
  const csvPath = path.join(
    process.cwd(),
    "attached_assets",
    "Complete Master Structured Dataset (V2) - Sheet1_1761485381551.csv"
  );

  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found:", csvPath);
    return;
  }

  const fileContent = fs.readFileSync(csvPath, "utf-8");
  
  // The CSV file has each entire row wrapped in quotes, which is non-standard
  // After removing outer quotes, fields with commas are marked with "" (double quotes)
  // We need to convert "" to proper CSV quoting
  const lines = fileContent.split(/\r?\n/).filter(l => l.trim().length > 0);
  const fixedLines = lines.map(line => {
    const trimmed = line.trim();
    // Remove outer quotes if present
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      const unwrapped = trimmed.slice(1, -1);
      // Now convert ""value"" patterns to "value" (single-quoted)
      // This makes them proper CSV quoted fields
      // Use a regex to find ""..."" patterns and convert to "..."
      const fixed = unwrapped.replace(/""/g, '"');
      return fixed;
    }
    return trimmed;
  });
  
  // Now use the standard CSV parser
  const fixedContent = fixedLines.join('\n');
  const records = parse(fixedContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    quote: '"',
    escape: '"',
  });

  console.log(`Loading ${records.length} business sectors...`);

  for (const record of records) {
    const sector: BusinessSector = {
      id: randomUUID(),
      sectorName: record["Sector Name"],
      investorPersonaFit: record["Investor Persona Fit"],
      year1Revenue: record["Year 1 Annual Revenue (Est.)"],
      grossMarginTarget: record["Gross Margin Target (%)"],
      totalStartupCost: record["Total Startup Cost (Est. Min)"],
      year1ROI: (record["Year 1 ROI % (Est.)"] || "0").replace("~", ""),
      inacheeIndexScore: parseInt(record["Inachee Index Score"]),
      roiPotential: parseInt(record["Dimension: ROI Potential (1-10)"]),
      scalability: parseInt(record["Dimension: Scalability (1-10)"]),
      complianceSimplicity: parseInt(record["Dimension: Compliance Simplicity (1-10)"]),
      marketResilience: parseInt(record["Dimension: Market Resilience (1-10)"]),
      executionSimplicity: parseInt(record["Dimension: Execution Simplicity (1-10)"]),
      equipmentCost: record["Cost: Equipment/Assets"],
      legalCost: record["Cost: Legal/Licenses/Permits"],
      inventoryCost: record["Cost: Initial Stock/Inventory"],
      topRisk: record["Top Risk Scenario"],
      mitigatingControl: record["Mitigating Control"],
    };

    storage.addSector(sector);
  }

  console.log(`Successfully loaded ${records.length} business sectors`);
}
