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
  // Remove the outer quotes from each line and fix the double-escaped quotes
  const lines = fileContent.split(/\r?\n/).filter(l => l.trim().length > 0);
  const fixedLines = lines.map((line, index) => {
    const trimmed = line.trim();
    // Remove outer quotes if present (first and last character)
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      const unwrapped = trimmed.slice(1, -1);
      // Replace "" with " to convert double-escaped quotes to single quotes
      // This converts ""field"" to "field" for proper CSV parsing
      let fixed = unwrapped.replace(/""/g, '"');
      
      // Special handling for data rows: if a sector name contains a comma, it needs quoting
      // We detect this by counting unquoted commas - should be 16, but if 17, sector name has comma
      if (index > 0) { // Skip header
        // Count unquoted commas
        let commaCount = 0;
        let inQuote = false;
        for (let i = 0; i < fixed.length; i++) {
          if (fixed[i] === '"') inQuote = !inQuote;
          else if (fixed[i] === ',' && !inQuote) commaCount++;
        }
        
        // If we have 17 commas (18 fields), sector name spans first two fields and needs quoting
        if (commaCount === 17) {
          // Find the SECOND unquoted comma (to include full sector name)
          let inQuote2 = false;
          let commasFound = 0;
          let secondCommaPos = -1;
          
          for (let i = 0; i < fixed.length; i++) {
            if (fixed[i] === '"') inQuote2 = !inQuote2;
            else if (fixed[i] === ',' && !inQuote2) {
              commasFound++;
              if (commasFound === 2) {
                secondCommaPos = i;
                break;
              }
            }
          }
          
          if (secondCommaPos > 0) {
            const sectorName = fixed.substring(0, secondCommaPos);
            const rest = fixed.substring(secondCommaPos);
            fixed = `"${sectorName}"${rest}`;
          }
        }
      }
      
      return fixed;
    }
    return trimmed;
  });
  
  // Now use the standard CSV parser with the fixed content
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

  // Check if sectors already exist in database
  const existingSectors = await storage.getAllSectors();
  if (existingSectors.length > 0) {
    console.log(`Sectors already loaded in database (${existingSectors.length} sectors)`);
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const record of records as any[]) {
    try {
      const sector: Omit<BusinessSector, "id"> = {
        sectorName: record["Sector Name"] || "",
        investorPersonaFit: record["Investor Persona Fit"] || "",
        year1Revenue: record["Year 1 Annual Revenue (Est.)"] || "0",
        grossMarginTarget: record["Gross Margin Target (%)"] || "0",
        totalStartupCost: record["Total Startup Cost (Est. Min)"] || "0",
        year1ROI: (record["Year 1 ROI % (Est.)"] || "0").replace("~", ""),
        inacheeIndexScore: parseInt(record["Inachee Index Score"] || "0") || 0,
        roiPotential: parseInt(record["Dimension: ROI Potential (1-10)"] || "0") || 0,
        scalability: parseInt(record["Dimension: Scalability (1-10)"] || "0") || 0,
        complianceSimplicity: parseInt(record["Dimension: Compliance Simplicity (1-10)"] || "0") || 0,
        marketResilience: parseInt(record["Dimension: Market Resilience (1-10)"] || "0") || 0,
        executionSimplicity: parseInt(record["Dimension: Execution Simplicity (1-10)"] || "0") || 0,
        equipmentCost: record["Cost: Equipment/Assets"] || "0",
        legalCost: record["Cost: Legal/Licenses/Permits"] || "0",
        inventoryCost: record["Cost: Initial Stock/Inventory"] || "0",
        topRisk: record["Top Risk Scenario"] || "",
        mitigatingControl: record["Mitigating Control"] || "",
        isCustom: 0, // Pre-loaded sector
        createdBy: null,
      };

      await storage.addSector(sector);
      successCount++;
    } catch (error) {
      failCount++;
      console.error(`Failed to load sector "${record["Sector Name"]}":`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`Successfully loaded ${successCount} business sectors (${failCount} failed)`);
}
