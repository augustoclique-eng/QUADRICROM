/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalculatorInputs, CalculationResults, ValidatedCalculatorInputs } from './types';

/**
 * Formats a number to Brazilian Real (BRL) currency format.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formats a unit price to BRL format, displaying up to 4 decimal places if it contains fractional cents to avoid rounding confusion.
 */
export function formatUnitCurrency(value: number): string {
  const hasFractionalCents = Math.abs((value * 100) % 1) > 0.0001;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: hasFractionalCents ? 3 : 2,
    maximumFractionDigits: hasFractionalCents ? 4 : 2,
  }).format(value);
}

/**
 * Formats a number with pt-BR decimal style.
 */
export function formatDecimal(value: number, decimals: number = 4): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: Math.min(2, decimals),
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Performs calculations according to the specified sticker print rules,
 * integrating waste (loss) factor, markup (profit margin), optional special cut surcharges, and order minimum bounds.
 */
export function calculateStickerValues(
  inputs: ValidatedCalculatorInputs
): CalculationResults {
  const { 
    widthCm, 
    heightCm, 
    quantity, 
    m2Value, 
    lossPercent, 
    profitMargin, 
    minOrder, 
    specialCut, 
    specialCutValue 
  } = inputs;

  // 1. Área de 1 adesivo: largura_cm × altura_cm = área_cm²
  const unitAreaCm2 = widthCm * heightCm;

  // 2. Converter para metro quadrado: área_cm² ÷ 10.000 = área_m²
  const unitAreaM2 = unitAreaCm2 / 10000;

  // 3. Área total líquida: área_m² × quantidade
  const totalAreaM2 = unitAreaM2 * quantity;

  // 4. Aplicar perda residual de material (Removido conforme diretiva "Remove the loss margin")
  const totalAreaM2WithLoss = totalAreaM2;

  // 5. Custo raw de produção (área × m2Value)
  const baseCostBeforeMargin = totalAreaM2 * m2Value;

  // 6. Aplicar margem de lucro padrão (Removido conforme solicitação do usuário)
  const valueWithMargin = baseCostBeforeMargin;

  // 7. Calcular adicional por corte eletrônico especial
  const specialCutCost = specialCut ? (quantity * (specialCutValue || 0)) : 0;

  // 8. Valor final preliminar antes da validação de pedido mínimo
  const rawFinalValue = valueWithMargin + specialCutCost;

  // 9. Verificar se o pedido é inferior ao mínimo cobrado para cobrir a máquina ligada
  const isMinOrderApplied = rawFinalValue < (minOrder || 0);
  const finalValue = isMinOrderApplied ? (minOrder || 0) : rawFinalValue;

  // 10. Valor por unidade
  const valuePerUnit = quantity > 0 ? finalValue / quantity : 0;

  return {
    unitAreaCm2,
    unitAreaM2,
    totalAreaM2,
    totalAreaM2WithLoss,
    baseCostBeforeMargin,
    valueWithMargin,
    specialCutCost,
    rawFinalValue,
    finalValue,
    valuePerUnit,
    isMinOrderApplied,
  };
}

/**
 * Validates the input values to ensure they are complete and strictly positive (no negatives or zero where appropriate).
 * Returns a list of strings representing friendly Portuguese error messages.
 */
export function validateInputs(inputs: CalculatorInputs): { isValid: boolean; errors: Partial<Record<keyof CalculatorInputs, string>> } {
  const errors: Partial<Record<keyof CalculatorInputs, string>> = {};
  
  if (inputs.widthCm === '' || isNaN(Number(inputs.widthCm))) {
    errors.widthCm = 'Por favor, informe a largura em centímetros.';
  } else if (Number(inputs.widthCm) <= 0) {
    errors.widthCm = 'A largura precisa ser maior do que zero.';
  }

  if (inputs.heightCm === '' || isNaN(Number(inputs.heightCm))) {
    errors.heightCm = 'Por favor, informe a altura em centímetros.';
  } else if (Number(inputs.heightCm) <= 0) {
    errors.heightCm = 'A altura precisa ser maior do que zero.';
  }

  if (inputs.quantity === '' || isNaN(Number(inputs.quantity))) {
    errors.quantity = 'Por favor, informe a quantidade de unidades.';
  } else if (Number(inputs.quantity) <= 0) {
    errors.quantity = 'A quantidade precisa ser pelo menos 1 unidade.';
  } else if (!Number.isInteger(Number(inputs.quantity))) {
    errors.quantity = 'A quantidade deve ser um número inteiro.';
  }

  if (inputs.m2Value === '' || isNaN(Number(inputs.m2Value))) {
    errors.m2Value = 'Por favor, informe o valor do m² do adesivo.';
  } else if (Number(inputs.m2Value) < 0) {
    errors.m2Value = 'O valor do metro quadrado não pode ser negativo.';
  }

  if (inputs.lossPercent === '' || isNaN(Number(inputs.lossPercent))) {
    errors.lossPercent = 'Por favor, informe a perda de material (%).';
  } else if (Number(inputs.lossPercent) < 0) {
    errors.lossPercent = 'A perda não pode ser um percentual negativo.';
  }

  if (inputs.profitMargin === '' || isNaN(Number(inputs.profitMargin))) {
    errors.profitMargin = 'Por favor, informe a margem de lucro (%).';
  } else if (Number(inputs.profitMargin) < 0) {
    errors.profitMargin = 'A margem de lucro não pode ser negativa.';
  }

  if (inputs.minOrder === '' || isNaN(Number(inputs.minOrder))) {
    errors.minOrder = 'Por favor, informe o pedido mínimo.';
  } else if (Number(inputs.minOrder) < 0) {
    errors.minOrder = 'O pedido mínimo não pode ser negativo.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
