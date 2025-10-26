import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateFinancialModel } from "./gemini-service";
import { generateExcelFile } from "./excel-generator";
import * as fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all business sectors
  app.get("/api/sectors", async (_req, res) => {
    try {
      const sectors = await storage.getAllSectors();
      res.json(sectors);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      res.status(500).json({ error: "Failed to fetch sectors" });
    }
  });

  // Generate financial model
  app.post("/api/generate-model", async (req, res) => {
    try {
      const {
        businessIdea,
        selectedSector,
        startupCost,
        monthlyRevenue,
        grossMargin,
        operatingExpenses,
      } = req.body;

      // Create initial model record
      const model = await storage.createFinancialModel({
        businessIdea,
        selectedSector,
        startupCost,
        monthlyRevenue,
        grossMargin,
        operatingExpenses,
        customAssumptions: null,
        generatedModel: null,
        excelFilePath: null,
        status: "processing",
      });

      // Start background processing (don't await)
      processModelGeneration(model.id, {
        businessIdea,
        selectedSector,
        startupCost: Number(startupCost),
        monthlyRevenue: Number(monthlyRevenue),
        grossMargin: Number(grossMargin),
        operatingExpenses: Number(operatingExpenses),
      }).catch((error) => {
        console.error("Error in background processing:", error);
        storage.updateFinancialModel(model.id, { status: "failed" });
      });

      // Return immediately with model ID
      res.json({ id: model.id, status: "processing" });
    } catch (error) {
      console.error("Error creating model:", error);
      res.status(500).json({ error: "Failed to create financial model" });
    }
  });

  // Get all financial models
  app.get("/api/models", async (_req, res) => {
    try {
      const models = await storage.getAllFinancialModels();
      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });

  // Get financial model by ID
  app.get("/api/models/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const model = await storage.getFinancialModel(id);

      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }

      res.json(model);
    } catch (error) {
      console.error("Error fetching model:", error);
      res.status(500).json({ error: "Failed to fetch model" });
    }
  });

  // Download Excel file
  app.get("/api/download/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const model = await storage.getFinancialModel(id);

      if (!model || !model.excelFilePath) {
        return res.status(404).json({ error: "Model or file not found" });
      }

      if (!fs.existsSync(model.excelFilePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }

      res.download(model.excelFilePath, `financial-model-${id}.xlsx`);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background processing function
async function processModelGeneration(
  modelId: string,
  input: {
    businessIdea: string;
    selectedSector?: string;
    startupCost: number;
    monthlyRevenue: number;
    grossMargin: number;
    operatingExpenses: number;
  }
) {
  try {
    // Get sector data if selected
    let sectorData;
    if (input.selectedSector) {
      sectorData = await storage.getSectorByName(input.selectedSector);
    }

    // Generate the model using AI agents
    const generatedModel = await generateFinancialModel({
      ...input,
      sectorData,
    });

    // Generate Excel file
    const excelPath = await generateExcelFile(
      modelId,
      generatedModel,
      input.businessIdea
    );

    // Update model with results
    await storage.updateFinancialModel(modelId, {
      generatedModel: generatedModel as any,
      excelFilePath: excelPath,
      status: "completed",
      completedAt: new Date(),
    });

    console.log(`Model ${modelId} completed successfully`);
  } catch (error) {
    console.error(`Error processing model ${modelId}:`, error);
    await storage.updateFinancialModel(modelId, {
      status: "failed",
    });
  }
}
