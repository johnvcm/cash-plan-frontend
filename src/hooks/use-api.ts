import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Account {
  id: number;
  name: string;
  bank: string;
  balance: number;
  investments: number;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreditCard {
  id: number;
  name: string;
  bank: string;
  used: number;
  limit: number;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: number;
  description: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  account_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Investment {
  id: number;
  name: string;
  type: "Renda Fixa" | "Renda Variável";
  value: number;
  return_rate: number;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Goal {
  id: number;
  name: string;
  target: number;
  current: number;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShoppingItem {
  id: number;
  shopping_list_id: number;
  name: string;
  category: string;
  quantity: string;
  estimated_price: number;
  actual_price?: number;
  is_purchased: boolean;
  notes?: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ShoppingList {
  id: number;
  name: string;
  month?: string;
  status: "active" | "completed" | "archived";
  total_estimated: number;
  total_spent: number;
  items: ShoppingItem[];
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export const useAccounts = () => {
  return useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: () => api.get("/accounts"),
  });
};

export const useCreditCards = () => {
  return useQuery<CreditCard[]>({
    queryKey: ["credit-cards"],
    queryFn: () => api.get("/credit-cards"),
  });
};

export const useTransactions = () => {
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: () => api.get("/transactions"),
  });
};

export const useInvestments = () => {
  return useQuery<Investment[]>({
    queryKey: ["investments"],
    queryFn: () => api.get("/investments"),
  });
};

export const useGoals = () => {
  return useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: () => api.get("/goals"),
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Account, "id" | "created_at" | "updated_at">) =>
      api.post("/accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Transaction, "id" | "created_at" | "updated_at">) =>
      api.post("/transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<CreditCard, "id" | "created_at" | "updated_at">) =>
      api.post("/credit-cards", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
    },
  });
};

export const useCreateInvestment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Investment, "id" | "created_at" | "updated_at">) =>
      api.post("/investments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Goal, "id" | "created_at" | "updated_at">) =>
      api.post("/goals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

// UPDATE hooks
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Account> }) =>
      api.put(`/accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useUpdateCreditCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreditCard> }) =>
      api.put(`/credit-cards/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Transaction> }) =>
      api.put(`/transactions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useUpdateInvestment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Investment> }) =>
      api.put(`/investments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Goal> }) =>
      api.put(`/goals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

// DELETE hooks
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.delete(`/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useDeleteCreditCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.delete(`/credit-cards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useDeleteInvestment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.delete(`/investments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.delete(`/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

// ==================== SHOPPING LISTS ====================

export const useShoppingLists = (status?: string, month?: string) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (month) params.append("month", month);
  const queryString = params.toString() ? `?${params.toString()}` : "";
  
  return useQuery<ShoppingList[]>({
    queryKey: ["shopping-lists", status, month],
    queryFn: () => api.get(`/shopping-lists${queryString}`),
  });
};

export const useShoppingList = (id: number) => {
  return useQuery<ShoppingList>({
    queryKey: ["shopping-lists", id],
    queryFn: () => api.get(`/shopping-lists/${id}`),
    enabled: !!id,
  });
};

export const useCreateShoppingList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<ShoppingList, "id" | "items" | "created_at" | "updated_at" | "completed_at"> & { items?: Omit<ShoppingItem, "id" | "shopping_list_id" | "created_at" | "updated_at">[] }) =>
      api.post("/shopping-lists", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });
};

export const useUpdateShoppingList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      data, 
      createTransactions, 
      accountId 
    }: { 
      id: number; 
      data: Partial<Omit<ShoppingList, "id" | "items" | "created_at" | "updated_at" | "completed_at">>; 
      createTransactions?: boolean;
      accountId?: number;
    }) => {
      // Construir query params
      const params = new URLSearchParams();
      if (createTransactions) params.append("create_transactions", "true");
      if (accountId) params.append("account_id", accountId.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : "";
      
      return api.put(`/shopping-lists/${id}${queryString}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useDeleteShoppingList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.delete(`/shopping-lists/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });
};

export const useDuplicateShoppingList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newName, newMonth }: { id: number; newName: string; newMonth?: string }) =>
      api.post(`/shopping-lists/${id}/duplicate?new_name=${encodeURIComponent(newName)}${newMonth ? `&new_month=${newMonth}` : ""}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });
};

// ==================== SHOPPING ITEMS ====================

export const useCreateShoppingItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, data }: { listId: number; data: Omit<ShoppingItem, "id" | "shopping_list_id" | "created_at" | "updated_at"> }) =>
      api.post(`/shopping-lists/${listId}/items`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      queryClient.invalidateQueries({ queryKey: ["shopping-lists", variables.listId] });
    },
  });
};

export const useUpdateShoppingItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, itemId, data }: { listId: number; itemId: number; data: Partial<Omit<ShoppingItem, "id" | "shopping_list_id" | "created_at" | "updated_at">> }) =>
      api.put(`/shopping-lists/${listId}/items/${itemId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      queryClient.invalidateQueries({ queryKey: ["shopping-lists", variables.listId] });
    },
  });
};

export const useDeleteShoppingItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: number; itemId: number }) =>
      api.delete(`/shopping-lists/${listId}/items/${itemId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      queryClient.invalidateQueries({ queryKey: ["shopping-lists", variables.listId] });
    },
  });
};

