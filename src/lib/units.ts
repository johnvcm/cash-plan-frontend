export const UNITS = [
  { value: "kg", label: "Kg" },
  { value: "g", label: "g" },
  { value: "L", label: "L" },
  { value: "mL", label: "mL" },
  { value: "unidade", label: "Unidade(s)" },
  { value: "pacote", label: "Pacote(s)" },
  { value: "caixa", label: "Caixa(s)" },
  { value: "lata", label: "Lata(s)" },
  { value: "garrafa", label: "Garrafa(s)" },
  { value: "outro", label: "Outro" },
] as const;

export type Unit = typeof UNITS[number]["value"];

// Função para formatar quantidade com unidade
export function formatQuantity(quantity: string): { value: string; unit: string } {
  // Tentar extrair número e unidade
  const match = quantity.match(/^([\d,.]+)\s*(.*)$/);
  
  if (match) {
    const [, value, unit] = match;
    return { value: value.trim(), unit: unit.trim() || "unidade" };
  }
  
  return { value: quantity, unit: "unidade" };
}

// Função para combinar valor e unidade
export function combineQuantity(value: string, unit: string): string {
  if (!value) return "";
  return unit === "unidade" ? value : `${value} ${unit}`;
}

