/**
 * Formata um número como moeda brasileira
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como R$ 1.234,56
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata um número como porcentagem
 * @param value - Valor numérico a ser formatado (ex: 12.5 para 12,5%)
 * @returns String formatada como 12,5%
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/**
 * Formata um número decimal simples
 * @param value - Valor numérico a ser formatado
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns String formatada como 1.234,56
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

