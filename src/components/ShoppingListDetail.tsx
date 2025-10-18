import { useState, useMemo, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Check, X, Edit, Trash2, ChevronDown, ChevronUp, Copy, CheckCircle } from "lucide-react";
import {
  ShoppingList,
  ShoppingItem,
  useCreateShoppingItem,
  useUpdateShoppingItem,
  useDeleteShoppingItem,
  useDuplicateShoppingList,
  useUpdateShoppingList,
} from "@/hooks/use-api";
import { CurrencyInput } from "@/components/ui/currency-input";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CompleteShoppingListDialog } from "@/components/CompleteShoppingListDialog";

// Componente separado para o item (evitar hooks dentro de loops)
interface ShoppingItemCardProps {
  item: ShoppingItem;
  isCurrentlySwiped: boolean;
  isPurchased: boolean;
  isUpdating: boolean;
  onSwipe: (itemId: number) => void;
  onUnswipe: () => void;
  onTogglePurchased: (item: ShoppingItem) => void;
  onDelete: (itemId: number) => void;
}

function formatMonthYYYYMM(ym: string, locale = "pt-BR") {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  // Criar data em UTC para evitar problemas de timezone
  const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

function ShoppingItemCard({
  item,
  isCurrentlySwiped,
  isPurchased,
  isUpdating,
  onSwipe,
  onUnswipe,
  onTogglePurchased,
  onDelete,
}: ShoppingItemCardProps) {
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      console.log("👈 Swiped LEFT:", item.name);
      onSwipe(item.id);
    },
    onSwipedRight: () => {
      console.log("👉 Swiped RIGHT:", item.name);
      if (isCurrentlySwiped) {
        onUnswipe();
      } else {
        // Swipe para direita = marcar como comprado
        onTogglePurchased(item);
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
    trackTouch: true,
    delta: 50,
  });

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("✅ Checkbox clicked for item:", item.name);
    onTogglePurchased(item);
  };

  return (
    <div className="relative overflow-hidden rounded-lg" {...handlers}>
      {/* Ações de swipe (fundo) */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-end px-4 gap-2 transition-opacity pointer-events-none",
          isCurrentlySwiped ? "opacity-100 bg-destructive/10" : "opacity-0"
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Item (frente) */}
      <div
        className={cn(
          "relative bg-background border border-border rounded-lg p-3 transition-all duration-300 touch-pan-y",
          isCurrentlySwiped && "-translate-x-20",
          isPurchased && "opacity-60",
          isUpdating && "scale-95 bg-primary/5"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox com área maior de clique e animação */}
          <div 
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 -ml-2 -mt-2 cursor-pointer active:scale-90 transition-transform"
            onClick={handleCheckboxClick}
            style={{ touchAction: "manipulation" }}
          >
            <div
              className={cn(
                "w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200",
                isPurchased
                  ? "bg-success border-success scale-110"
                  : "border-muted-foreground hover:border-success hover:scale-105",
                isUpdating && "animate-pulse"
              )}
            >
              {isPurchased && (
                <Check 
                  className="h-4 w-4 text-white animate-in zoom-in duration-200" 
                  strokeWidth={3} 
                />
              )}
            </div>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-medium text-sm transition-all duration-300",
                isPurchased && "line-through text-muted-foreground"
              )}
            >
              {item.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{item.quantity}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-medium">
                {formatCurrency(item.estimated_price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ShoppingListDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: ShoppingList;
}

const CATEGORIES = [
  "Frutas",
  "Verduras e Legumes",
  "Carnes e Peixes",
  "Laticínios",
  "Padaria",
  "Bebidas",
  "Limpeza",
  "Higiene Pessoal",
  "Mercearia",
  "Congelados",
  "Outros",
];

interface NewItemForm {
  name: string;
  category: string;
  quantity: string;
  estimated_price: number;
}

export function ShoppingListDetail({ open, onOpenChange, list }: ShoppingListDetailProps) {
  const createItem = useCreateShoppingItem();
  const updateItem = useUpdateShoppingItem();
  const deleteItem = useDeleteShoppingItem();
  const duplicateList = useDuplicateShoppingList();
  const updateList = useUpdateShoppingList();

  const [addingItem, setAddingItem] = useState(false);
  const [swipedItemId, setSwipedItemId] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIES));
  const [editingName, setEditingName] = useState(false);
  const [editingMonth, setEditingMonth] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [listName, setListName] = useState(list.name);
  const [listMonth, setListMonth] = useState(list.month || "");
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [localPurchasedItems, setLocalPurchasedItems] = useState<Set<number>>(new Set());
  const [localItems, setLocalItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState<NewItemForm>({
    name: "",
    category: "Outros",
    quantity: "",
    estimated_price: 0,
  });

  // Atualizar nome da lista quando prop mudar
  useEffect(() => {
    setListName(list.name);
    setListMonth(list.month || "");
  }, [list.name, list.month]);

  // Sincronizar localItems com list.items
  useEffect(() => {
    setLocalItems(list.items);
  }, [list.items]);

  // Inicializar purchased items localmente
  useEffect(() => {
    const purchased = new Set(list.items.filter(item => item.is_purchased).map(item => item.id));
    setLocalPurchasedItems(purchased);
  }, [list.items]);

  // Agrupar itens por categoria (usando localItems para responsividade)
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, ShoppingItem[]> = {};
    localItems.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [localItems]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleTogglePurchased = async (item: ShoppingItem) => {
    console.log("🔄 Toggle purchased:", item.name, "Current:", item.is_purchased);
    
    // Optimistic update - atualiza UI imediatamente
    const newPurchased = new Set(localPurchasedItems);
    const willBePurchased = !localPurchasedItems.has(item.id);
    
    if (willBePurchased) {
      newPurchased.add(item.id);
    } else {
      newPurchased.delete(item.id);
    }
    
    setLocalPurchasedItems(newPurchased);
    setUpdatingItemId(item.id);
    
    // Visual feedback
    setTimeout(() => setUpdatingItemId(null), 600);
    
    try {
      await updateItem.mutateAsync({
        listId: list.id,
        itemId: item.id,
        data: {
          is_purchased: willBePurchased,
          actual_price: willBePurchased ? item.estimated_price : item.actual_price,
        },
      });
      console.log("✅ Toggle success!");
    } catch (error) {
      console.error("❌ Toggle error:", error);
      // Reverter em caso de erro
      setLocalPurchasedItems(new Set(localPurchasedItems));
      toast.error("Erro ao atualizar item");
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity) {
      toast.error("Preencha nome e quantidade");
      return;
    }

    // Resetar formulário ANTES de criar (para parecer instantâneo)
    const savedNewItem = { ...newItem };
    setNewItem({
      name: "",
      category: "Outros",
      quantity: "",
      estimated_price: 0,
    });
    setAddingItem(false);

    // Garantir que categoria está expandida
    setExpandedCategories((prev) => new Set([...prev, savedNewItem.category]));

    try {
      console.log("➕ Creating item on backend...");
      
      const createdItem = await createItem.mutateAsync({
        listId: list.id,
        data: {
          name: savedNewItem.name,
          category: savedNewItem.category,
          quantity: savedNewItem.quantity,
          estimated_price: savedNewItem.estimated_price,
          actual_price: null,
          is_purchased: false,
          notes: null,
          order: localItems.length,
        },
      });
      
      console.log("✅ Item created:", createdItem);
      
      // React Query já invalida e refetch automaticamente!
      // Mas vamos adicionar no localItems também para ser instantâneo
      setLocalItems((prev) => [...prev, createdItem]);
      
      toast.success("Item adicionado!");
    } catch (error) {
      console.error("❌ Error creating item:", error);
      
      // Restaurar formulário em caso de erro
      setNewItem(savedNewItem);
      setAddingItem(true);
      
      toast.error("Erro ao adicionar item");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    console.log("🗑️ Deleting item optimistically:", itemId);
    
    // Salvar item para possível restauração
    const itemToDelete = localItems.find((item) => item.id === itemId);
    if (!itemToDelete) return;

    // Optimistic update - remove item imediatamente da UI
    setLocalItems((prev) => prev.filter((item) => item.id !== itemId));
    
    // Remover dos purchased também se necessário
    if (localPurchasedItems.has(itemId)) {
      setLocalPurchasedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }

    try {
      await deleteItem.mutateAsync({ listId: list.id, itemId });
      console.log("✅ Item deleted on backend");
      toast.success("Item removido!");
    } catch (error) {
      console.error("❌ Error deleting item:", error);
      
      // Reverter em caso de erro - adicionar item de volta
      setLocalItems((prev) => [...prev, itemToDelete].sort((a, b) => a.order - b.order));
      
      // Restaurar purchased status se necessário
      if (itemToDelete.is_purchased) {
        setLocalPurchasedItems((prev) => new Set([...prev, itemId]));
      }
      
      toast.error("Erro ao remover item");
    }
  };

  const handleDuplicateList = async () => {
    try {
      const now = new Date();
      const newMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      await duplicateList.mutateAsync({
        id: list.id,
        newName: `${list.name} (Cópia)`,
        newMonth: newMonth,
      });
      toast.success("Lista duplicada com sucesso!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao duplicar lista");
    }
  };

  const handleSaveListName = async () => {
    if (!listName.trim()) {
      toast.error("Nome não pode estar vazio");
      return;
    }
    
    try {
      await updateList.mutateAsync({
        id: list.id,
        data: { name: listName.trim() },
      });
      setEditingName(false);
      toast.success("Nome atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar nome");
      setListName(list.name);
    }
  };

  const handleSaveListMonth = async () => {
    try {
      await updateList.mutateAsync({
        id: list.id,
        data: { month: listMonth || null },
      });
      setEditingMonth(false);
      toast.success("Mês atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar mês");
      setListMonth(list.month || "");
    }
  };

  const handleCompleteList = async (createTransactions: boolean, accountId?: number) => {
    try {
      await updateList.mutateAsync({
        id: list.id,
        data: { status: "completed" },
        createTransactions,
        accountId,
      });
      
      if (createTransactions) {
        toast.success("Lista concluída e despesas registradas!");
      } else {
        toast.success("Lista concluída!");
      }
      
      setCompleteDialogOpen(false);
      onOpenChange(false); // Fechar o diálogo após concluir
    } catch (error) {
      toast.error("Erro ao concluir lista");
    }
  };

  // Usar estado local para cálculo de progresso (responsividade instantânea)
  const totalItems = localItems.length;
  const purchasedItemsCount = localPurchasedItems.size;
  const progressPercentage = totalItems > 0 ? (purchasedItemsCount / totalItems) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
          <DialogTitle className="text-lg sm:text-xl flex items-center justify-between gap-2">
            {editingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveListName();
                    } else if (e.key === "Escape") {
                      setListName(list.name);
                      setEditingName(false);
                    }
                  }}
                  autoFocus
                  className="h-8 text-lg font-semibold"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveListName}
                  disabled={updateList.isPending}
                >
                  <Check className="h-4 w-4 text-success" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setListName(list.name);
                    setEditingName(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <span 
                  className="truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setEditingName(true)}
                >
                  {list.name}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingName(true)}
                    className="flex-shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDuplicateList}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {editingMonth ? (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="month"
                  value={listMonth}
                  onChange={(e) => setListMonth(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveListMonth();
                    } else if (e.key === "Escape") {
                      setListMonth(list.month || "");
                      setEditingMonth(false);
                    }
                  }}
                  autoFocus
                  className="h-8 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveListMonth}
                  disabled={updateList.isPending}
                >
                  <Check className="h-3 w-3 text-success" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setListMonth(list.month || "");
                    setEditingMonth(false);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div 
                className="cursor-pointer hover:text-foreground transition-colors flex items-center gap-2"
                onClick={() => setEditingMonth(true)}
              >
                {listMonth ? formatMonthYYYYMM(listMonth) : "Clique para adicionar mês"}
                <Edit className="h-3 w-3 opacity-50" />
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Progresso */}
        <div className="px-4 sm:px-6 py-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {purchasedItemsCount} de {totalItems} itens comprados
            </span>
            <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-success h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <span className="text-muted-foreground">Estimado: </span>
              <span className="font-medium">{formatCurrency(list.total_estimated)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Gasto: </span>
              <span className="font-medium text-primary">{formatCurrency(list.total_spent)}</span>
            </div>
          </div>
        </div>

        {/* Lista de itens */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {Object.keys(itemsByCategory).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(itemsByCategory).map(([category, items]) => {
                const isExpanded = expandedCategories.has(category);
                // Usar estado local para contagem responsiva
                const categoryPurchased = items.filter((item) => localPurchasedItems.has(item.id)).length;
                const categoryTotal = items.length;

                return (
                  <div key={category} className="space-y-2">
                    {/* Cabeçalho da categoria */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{category}</span>
                        <span className="text-xs text-muted-foreground">
                          ({categoryPurchased}/{categoryTotal})
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {/* Itens da categoria */}
                    {isExpanded && (
                      <div className="space-y-2">
                        {items.map((item) => (
                          <ShoppingItemCard
                            key={item.id}
                            item={item}
                            isCurrentlySwiped={swipedItemId === item.id}
                            isPurchased={localPurchasedItems.has(item.id)}
                            isUpdating={updatingItemId === item.id}
                            onSwipe={setSwipedItemId}
                            onUnswipe={() => setSwipedItemId(null)}
                            onTogglePurchased={handleTogglePurchased}
                            onDelete={handleDeleteItem}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                Nenhum item na lista ainda
              </p>
            </div>
          )}
        </div>

        {/* Adicionar item */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t border-border space-y-3">
          {/* Botão de Concluir Lista - Só mostra se a lista estiver ativa */}
          {list.status === "active" && !addingItem && (
            <Button
              onClick={() => setCompleteDialogOpen(true)}
              className="w-full h-11 bg-success hover:bg-success/90"
              size="lg"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Concluir Lista
            </Button>
          )}

          {addingItem ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="item-name" className="text-xs">
                    Item
                  </Label>
                  <Input
                    id="item-name"
                    placeholder="Ex: Arroz"
                    className="h-10"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="item-quantity" className="text-xs">
                    Quantidade
                  </Label>
                  <Input
                    id="item-quantity"
                    placeholder="Ex: 5kg"
                    className="h-10"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="item-category" className="text-xs">
                    Categoria
                  </Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="item-price" className="text-xs">
                    Preço Estimado
                  </Label>
                  <CurrencyInput
                    id="item-price"
                    value={newItem.estimated_price}
                    onChange={(value) => setNewItem({ ...newItem, estimated_price: value })}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAddingItem(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddItem} className="flex-1" disabled={createItem.isPending}>
                  {createItem.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setAddingItem(true)}
              className="w-full h-11"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Adicionar Item
            </Button>
          )}
        </div>
      </DialogContent>

      {/* Diálogo de Conclusão */}
      <CompleteShoppingListDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        onConfirm={handleCompleteList}
        listName={list.name}
        totalSpent={list.total_spent}
        isLoading={updateList.isPending}
      />
    </Dialog>
  );
}

