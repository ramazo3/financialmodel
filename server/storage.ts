import { 
  type BusinessSector,
  type FinancialModel, 
  type InsertFinancialModel,
  type GeneratedModel 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Business Sectors
  getAllSectors(): Promise<BusinessSector[]>;
  getSectorByName(name: string): Promise<BusinessSector | undefined>;
  
  // Financial Models
  createFinancialModel(model: InsertFinancialModel): Promise<FinancialModel>;
  getFinancialModel(id: string): Promise<FinancialModel | undefined>;
  updateFinancialModel(id: string, updates: Partial<FinancialModel>): Promise<FinancialModel | undefined>;
}

export class MemStorage implements IStorage {
  private sectors: Map<string, BusinessSector>;
  private financialModels: Map<string, FinancialModel>;

  constructor() {
    this.sectors = new Map();
    this.financialModels = new Map();
  }

  // Business Sectors
  async getAllSectors(): Promise<BusinessSector[]> {
    return Array.from(this.sectors.values());
  }

  async getSectorByName(name: string): Promise<BusinessSector | undefined> {
    return Array.from(this.sectors.values()).find(
      (sector) => sector.sectorName === name
    );
  }

  addSector(sector: BusinessSector): void {
    this.sectors.set(sector.id, sector);
  }

  // Financial Models
  async createFinancialModel(insertModel: InsertFinancialModel): Promise<FinancialModel> {
    const id = randomUUID();
    const model: FinancialModel = {
      id,
      ...insertModel,
      createdAt: new Date(),
      completedAt: null,
    };
    this.financialModels.set(id, model);
    return model;
  }

  async getFinancialModel(id: string): Promise<FinancialModel | undefined> {
    return this.financialModels.get(id);
  }

  async updateFinancialModel(
    id: string,
    updates: Partial<FinancialModel>
  ): Promise<FinancialModel | undefined> {
    const model = this.financialModels.get(id);
    if (!model) return undefined;

    const updatedModel = { ...model, ...updates };
    this.financialModels.set(id, updatedModel);
    return updatedModel;
  }
}

export const storage = new MemStorage();
