export const INCOME_CATEGORIES = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Bônus",
  "Presente",
  "Venda",
  "Outros",
] as const;

export const EXPENSE_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Contas",
  "Vestuário",
  "Outros",
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type TransactionCategory = IncomeCategory | ExpenseCategory | string;

// Função para obter categorias baseadas no tipo
export function getCategoriesByType(type: "income" | "expense"): readonly string[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

// Função para obter todas as categorias únicas de um usuário
export function getUniqueCategories(transactions: Array<{ category: string; type: "income" | "expense" }>, type?: "income" | "expense"): string[] {
  const filtered = type ? transactions.filter(t => t.type === type) : transactions;
  const categories = new Set(filtered.map(t => t.category));
  return Array.from(categories).sort();
}

// Função para mesclar categorias padrão com categorias customizadas
export function getAllCategories(type: "income" | "expense", customCategories: string[] = []): string[] {
  const defaultCategories = getCategoriesByType(type);
  const allCategories = new Set([...defaultCategories, ...customCategories]);
  return Array.from(allCategories).sort();
}






