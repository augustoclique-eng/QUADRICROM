/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CalculatorInputs {
  widthCm: number | '';
  heightCm: number | '';
  quantity: number | '';
  m2Value: number | '';
  lossPercent: number | '';
  profitMargin: number | '';
  minOrder: number | '';
  specialCut: boolean;
}

export interface ValidatedCalculatorInputs {
  widthCm: number;
  heightCm: number;
  quantity: number;
  m2Value: number;
  lossPercent: number;
  profitMargin: number;
  minOrder: number;
  specialCut: boolean;
  specialCutValue: number;
}

export interface CalculationResults {
  unitAreaCm2: number;
  unitAreaM2: number;
  totalAreaM2: number;
  totalAreaM2WithLoss: number;
  baseCostBeforeMargin: number;
  valueWithMargin: number;
  specialCutCost: number;
  rawFinalValue: number;
  finalValue: number;
  valuePerUnit: number;
  isMinOrderApplied: boolean;
}

export interface DefaultConfig {
  m2Value: number;
  lossPercent: number;
  profitMargin: number;
  minOrder: number;
  specialCutValue: number;
  companyName: string;
  whatsappNumber: string;
}

export interface Order {
  id: string;
  clientName: string;
  clientWhatsapp: string;
  widthCm: number;
  heightCm: number;
  quantity: number;
  totalValue: number;
  valuePerUnit: number;
  createdAt: string;
  status: 'orçamento' | 'vendido' | 'cancelado' | 'Pagamento concluído' | 'Aguardando criação da arte' | 'Em produção' | 'Produzido' | 'Enviado';
  specialCut: boolean;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileDataUrl?: string;
  deliveryDate?: string; // Additional Date
  maxDate?: string; // Maximum Date
}
