import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateFinancialModel } from "./gemini-service";
import { generateExcelFile } from "./excel-generator";
import { generateDocxFile } from "./docx-generator";
import { z } from "zod";
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

  // Download DOCX file
  app.get("/api/download-docx/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const model = await storage.getFinancialModel(id);

      if (!model || !model.pdfFilePath) {
        return res.status(404).json({ error: "Model or file not found" });
      }

      if (!fs.existsSync(model.pdfFilePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }

      res.download(model.pdfFilePath, `business-report-${id}.docx`);
    } catch (error) {
      console.error("Error downloading DOCX file:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  // Get model version history
  app.get("/api/models/:id/versions", async (req, res) => {
    try {
      const { id } = req.params;
      const versions = await storage.getModelVersions(id);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching versions:", error);
      res.status(500).json({ error: "Failed to fetch versions" });
    }
  });

  // Create a new version
  app.post("/api/models/:id/versions", async (req, res) => {
    try {
      const { id } = req.params;
      
      const versionSchema = z.object({
        changeDescription: z.string().optional(),
      });
      
      const validated = versionSchema.parse(req.body);
      const version = await storage.createModelVersion(id, validated.changeDescription);
      res.json(version);
    } catch (error) {
      console.error("Error creating version:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create version" });
    }
  });

  // Restore a version
  app.post("/api/models/:modelId/versions/:versionId/restore", async (req, res) => {
    try {
      const { modelId, versionId } = req.params;
      
      // Validate that IDs are provided
      if (!modelId || !versionId) {
        return res.status(400).json({ error: "Model ID and version ID are required" });
      }
      
      const updated = await storage.restoreVersion(modelId, versionId);
      res.json(updated);
    } catch (error) {
      console.error("Error restoring version:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to restore version" });
    }
  });

  // Get scenarios for a model
  app.get("/api/models/:id/scenarios", async (req, res) => {
    try {
      const { id } = req.params;
      const scenarios = await storage.getScenarios(id);
      res.json(scenarios);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      res.status(500).json({ error: "Failed to fetch scenarios" });
    }
  });

  // Create a new scenario
  app.post("/api/models/:id/scenarios", async (req, res) => {
    try {
      const { id } = req.params;
      
      const scenarioSchema = z.object({
        name: z.string().min(1, "Scenario name is required"),
        description: z.string().optional(),
        startupCost: z.number().optional(),
        monthlyRevenue: z.number().optional(),
        grossMargin: z.number().optional(),
        operatingExpenses: z.number().optional(),
        customAssumptions: z.record(z.string(), z.any()).optional(),
      });
      
      const validated = scenarioSchema.parse(req.body);
      const scenario = await storage.createScenario({
        modelId: id,
        name: validated.name,
        description: validated.description,
        startupCost: validated.startupCost?.toString(),
        monthlyRevenue: validated.monthlyRevenue?.toString(),
        grossMargin: validated.grossMargin?.toString(),
        operatingExpenses: validated.operatingExpenses?.toString(),
        customAssumptions: validated.customAssumptions,
      });
      res.json(scenario);
    } catch (error) {
      console.error("Error creating scenario:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create scenario" });
    }
  });

  // Update a scenario
  app.put("/api/scenarios/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const updateSchema = z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        startupCost: z.number().optional(),
        monthlyRevenue: z.number().optional(),
        grossMargin: z.number().optional(),
        operatingExpenses: z.number().optional(),
        customAssumptions: z.record(z.string(), z.any()).optional(),
      });
      
      const validated = updateSchema.parse(req.body);
      const scenario = await storage.updateScenario(id, {
        name: validated.name,
        description: validated.description,
        startupCost: validated.startupCost?.toString(),
        monthlyRevenue: validated.monthlyRevenue?.toString(),
        grossMargin: validated.grossMargin?.toString(),
        operatingExpenses: validated.operatingExpenses?.toString(),
        customAssumptions: validated.customAssumptions,
      });
      
      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      
      res.json(scenario);
    } catch (error) {
      console.error("Error updating scenario:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update scenario" });
    }
  });

  // Delete a scenario
  app.delete("/api/scenarios/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteScenario(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting scenario:", error);
      res.status(500).json({ error: "Failed to delete scenario" });
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

    // Generate DOCX file
    const docxPath = await generateDocxFile(
      modelId,
      generatedModel,
      input.businessIdea,
      sectorData
    );

    // Update model with results
    await storage.updateFinancialModel(modelId, {
      generatedModel: generatedModel as any,
      excelFilePath: excelPath,
      pdfFilePath: docxPath,
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
