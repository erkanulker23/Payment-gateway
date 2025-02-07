import { Provider, InsertProvider } from "@shared/schema";

export interface IStorage {
  getProviders(): Promise<Provider[]>;
  getProvider(id: number): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: number, provider: Partial<InsertProvider>): Promise<Provider>;
  deleteProvider(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private providers: Map<number, Provider>;
  private currentId: number;

  constructor() {
    this.providers = new Map();
    this.currentId = 1;
  }

  async getProviders(): Promise<Provider[]> {
    return Array.from(this.providers.values());
  }

  async getProvider(id: number): Promise<Provider | undefined> {
    return this.providers.get(id);
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const id = this.currentId++;

    // If this provider will be active, deactivate others
    if (insertProvider.isActive) {
      for (const provider of this.providers.values()) {
        if (provider.isActive) {
          provider.isActive = false;
          this.providers.set(provider.id, provider);
        }
      }
    }

    const provider: Provider = {
      id,
      name: insertProvider.name,
      type: insertProvider.type,
      isActive: insertProvider.isActive ?? false,
      isTestMode: insertProvider.isTestMode ?? true,
      config: insertProvider.config
    };
    this.providers.set(id, provider);
    return provider;
  }

  async updateProvider(id: number, update: Partial<InsertProvider>): Promise<Provider> {
    const existing = await this.getProvider(id);
    if (!existing) {
      throw new Error("Provider not found");
    }

    // If this provider will be active, deactivate others
    if (update.isActive && !existing.isActive) {
      for (const provider of this.providers.values()) {
        if (provider.id !== id && provider.isActive) {
          provider.isActive = false;
          this.providers.set(provider.id, provider);
        }
      }
    }

    const updated = { ...existing, ...update };
    this.providers.set(id, updated);
    return updated;
  }

  async deleteProvider(id: number): Promise<void> {
    this.providers.delete(id);
  }
}

export const storage = new MemStorage();