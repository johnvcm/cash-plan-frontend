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

