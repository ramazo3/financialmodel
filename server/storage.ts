import { eq } from "drizzle-orm";
import { db } from "./db";
import { 
  businessSectors,
  financialModels,
  modelVersions,
  scenarios,
  type BusinessSector,
  type FinancialModel, 
  type InsertFinancialModel,
  type ModelVersion,
  type Scenario,
  type InsertScenario,
} from "@shared/schema";

export interface IStorage {
  // Business Sectors
  getAllSectors(): Promise<BusinessSector[]>;
  getSectorByName(name: string): Promise<BusinessSector | undefined>;
  addSector(sector: Omit<BusinessSector, "id">): Promise<BusinessSector>;
  
  // Financial Models
  createFinancialModel(model: InsertFinancialModel): Promise<FinancialModel>;
  getFinancialModel(id: string): Promise<FinancialModel | undefined>;
  updateFinancialModel(id: string, updates: Partial<FinancialModel>): Promise<FinancialModel | undefined>;
  getAllFinancialModels(): Promise<FinancialModel[]>;
  
  // Model Versions
  createModelVersion(modelId: string, changeDescription?: string): Promise<ModelVersion>;
  getModelVersions(modelId: string): Promise<ModelVersion[]>;
  
  // Scenarios
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  getScenarios(modelId: string): Promise<Scenario[]>;
  updateScenario(id: string, updates: Partial<Scenario>): Promise<Scenario | undefined>;
  deleteScenario(id: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  // Business Sectors
  async getAllSectors(): Promise<BusinessSector[]> {
    return await db.select().from(businessSectors);
  }

  async getSectorByName(name: string): Promise<BusinessSector | undefined> {
    const results = await db
      .select()
      .from(businessSectors)
      .where(eq(businessSectors.sectorName, name))
      .limit(1);
    return results[0];
  }

  async addSector(sector: Omit<BusinessSector, "id">): Promise<BusinessSector> {
    const results = await db.insert(businessSectors).values(sector).returning();
    return results[0];
  }

  // Financial Models
  async createFinancialModel(insertModel: InsertFinancialModel): Promise<FinancialModel> {
    const results = await db.insert(financialModels).values(insertModel).returning();
    return results[0];
  }

  async getFinancialModel(id: string): Promise<FinancialModel | undefined> {
    const results = await db
      .select()
      .from(financialModels)
      .where(eq(financialModels.id, id))
      .limit(1);
    return results[0];
  }

  async updateFinancialModel(
    id: string,
    updates: Partial<FinancialModel>
  ): Promise<FinancialModel | undefined> {
    const results = await db
      .update(financialModels)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(financialModels.id, id))
      .returning();
    return results[0];
  }

  async getAllFinancialModels(): Promise<FinancialModel[]> {
    return await db
      .select()
      .from(financialModels)
      .orderBy(financialModels.createdAt);
  }

  // Model Versions
  async createModelVersion(modelId: string, changeDescription?: string): Promise<ModelVersion> {
    const model = await this.getFinancialModel(modelId);
    if (!model) throw new Error("Model not found");

    const existingVersions = await db
      .select()
      .from(modelVersions)
      .where(eq(modelVersions.modelId, modelId));

    const versionNumber = existingVersions.length + 1;

    const results = await db.insert(modelVersions).values({
      modelId,
      versionNumber,
      businessIdea: model.businessIdea,
      selectedSector: model.selectedSector,
      startupCost: model.startupCost,
      monthlyRevenue: model.monthlyRevenue,
      grossMargin: model.grossMargin,
      operatingExpenses: model.operatingExpenses,
      customAssumptions: model.customAssumptions,
      generatedModel: model.generatedModel,
      excelFilePath: model.excelFilePath,
      changeDescription,
    }).returning();

    return results[0];
  }

  async getModelVersions(modelId: string): Promise<ModelVersion[]> {
    return await db
      .select()
      .from(modelVersions)
      .where(eq(modelVersions.modelId, modelId))
      .orderBy(modelVersions.versionNumber);
  }

  // Scenarios
  async createScenario(scenario: InsertScenario): Promise<Scenario> {
    const results = await db.insert(scenarios).values(scenario).returning();
    return results[0];
  }

  async getScenarios(modelId: string): Promise<Scenario[]> {
    return await db
      .select()
      .from(scenarios)
      .where(eq(scenarios.modelId, modelId))
      .orderBy(scenarios.createdAt);
  }

  async updateScenario(id: string, updates: Partial<Scenario>): Promise<Scenario | undefined> {
    const results = await db
      .update(scenarios)
      .set(updates)
      .where(eq(scenarios.id, id))
      .returning();
    return results[0];
  }

  async deleteScenario(id: string): Promise<boolean> {
    const results = await db
      .delete(scenarios)
      .where(eq(scenarios.id, id))
      .returning();
    return results.length > 0;
  }
}

export const storage = new DbStorage();
