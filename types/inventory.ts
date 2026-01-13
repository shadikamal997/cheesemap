export interface InventoryItem {
  id: string;
  businessId: string;
  cheeseId: string | null;
  sku: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  price: number; // in cents
  expiryDate: Date | null;
  batchId: string | null;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Batch {
  id: string;
  businessId: string;
  batchNumber: string;
  milkSource: string | null;
  productionDate: Date;
  agingStartDate: Date | null;
  targetAgingDays: number | null;
  initialQuantity: number;
  currentQuantity: number;
  unit: string;
  qualityNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryItemInput {
  cheeseId?: string;
  sku?: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  expiryDate?: Date;
  batchId?: string;
}

export interface UpdateInventoryItemInput extends Partial<CreateInventoryItemInput> {
  available?: boolean;
}
