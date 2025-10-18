import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, ChevronRight, Check, X, Copy, Archive } from "lucide-react";
import {
  useShoppingLists,
  useDeleteShoppingList,
  useUpdateShoppingList,
  ShoppingList,
} from "@/hooks/use-api";
import { ShoppingListForm } from "@/components/forms/ShoppingListForm";
import { ShoppingListDetail } from "@/components/ShoppingListDetail";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { CompleteShoppingListDialog } from "@/components/CompleteShoppingListDialog";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

const ListaCompras = () => {
  const { data: lists, isLoading } = useShoppingLists();
  const deleteList = useDeleteShoppingList();
  const updateList = useUpdateShoppingList();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<ShoppingList | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [listToComplete, setListToComplete] = useState<ShoppingList | null>(null);
  const [listToDelete, setListToDelete] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed" | "archived">("all");

  const handleNewList = () => {
    setSelectedList(undefined);
    setFormOpen(true);
  };

  const handleOpenList = (list: ShoppingList) => {
    setSelectedList(list);
    setDetailOpen(true);
  };

  const handleDelete = async () => {
    if (listToDelete) {
      try {
        await deleteList.mutateAsync(listToDelete);
        toast.success("Lista deletada com sucesso!");
        setDeleteDialogOpen(false);
        setListToDelete(null);
      } catch (error) {
        toast.error("Erro ao deletar lista");
      }
    }
  };

  const handleArchive = async (list: ShoppingList) => {
    try {
      await updateList.mutateAsync({
        id: list.id,
        data: { status: list.status === "archived" ? "active" : "archived" },
      });
      toast.success(
        list.status === "archived" ? "Lista desarquivada!" : "Lista arquivada!"
      );
    } catch (error) {
      toast.error("Erro ao arquivar lista");
    }
  };

  const handleComplete = async (list: ShoppingList) => {
    if (list.status === "completed") {
      // Reabrir lista
      try {
        await updateList.mutateAsync({
          id: list.id,
          data: { status: "active" },
        });
        toast.success("Lista reaberta!");
      } catch (error) {
        toast.error("Erro ao reabrir lista");
      }
    } else {
      // Abrir diálogo de conclusão
      setListToComplete(list);
      setCompleteDialogOpen(true);
    }
  };

  const handleConfirmComplete = async (createTransactions: boolean, accountId?: number) => {
    if (!listToComplete) return;

    try {
      await updateList.mutateAsync({
        id: listToComplete.id,
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
      setListToComplete(null);
    } catch (error) {
      toast.error("Erro ao concluir lista");
    }
  };

  const filteredLists = lists?.filter((list) => {
    if (filterStatus === "all") return true;
    return list.status === filterStatus;
  });

  const activeLists = filteredLists?.filter((list) => list.status === "active") || [];
  const completedLists = filteredLists?.filter((list) => list.status === "completed") || [];
  const archivedLists = filteredLists?.filter((list) => list.status === "archived") || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success";
      case "completed":
        return "bg-primary/10 text-primary";
      case "archived":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativa";
      case "completed":
        return "Concluída";
      case "archived":
        return "Arquivada";
      default:
        return status;
    }
  };

  const getProgressPercentage = (list: ShoppingList) => {
    if (list.items.length === 0) return 0;
    const purchasedItems = list.items.filter((item) => item.is_purchased).length;
    return (purchasedItems / list.items.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Carregando listas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
            Lista de Compras
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Organize suas compras de supermercado
          </p>
        </div>
        <Button
          className="bg-gradient-primary hover:bg-primary-hover w-full sm:w-auto h-12 sm:h-10"
          onClick={handleNewList}
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nova Lista
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("all")}
          className="whitespace-nowrap"
        >
          Todas ({lists?.length || 0})
        </Button>
        <Button
          variant={filterStatus === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("active")}
          className="whitespace-nowrap"
        >
          Ativas ({activeLists.length})
        </Button>
        <Button
          variant={filterStatus === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("completed")}
          className="whitespace-nowrap"
        >
          Concluídas ({completedLists.length})
        </Button>
        <Button
          variant={filterStatus === "archived" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("archived")}
          className="whitespace-nowrap"
        >
          Arquivadas ({archivedLists.length})
        </Button>
      </div>

      {/* Listas */}
      {filteredLists && filteredLists.length > 0 ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1">
          {filteredLists.map((list) => {
            const progress = getProgressPercentage(list);
            const purchasedItems = list.items.filter((item) => item.is_purchased).length;

            return (
              <Card
                key={list.id}
                className="shadow-card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleOpenList(list)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
                          {list.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            list.status
                          )}`}
                        >
                          {getStatusLabel(list.status)}
                        </span>
                      </div>

                      {list.month && (
                        <p className="text-xs text-muted-foreground">
                          {(() => {
                            const [y, m] = list.month.split("-");
                            const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
                            return new Intl.DateTimeFormat("pt-BR", {
                              month: "long",
                              year: "numeric",
                              timeZone: "UTC"
                            }).format(d);
                          })()}
                        </p>
                      )}

                      {/* Progresso */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {purchasedItems} de {list.items.length} itens
                          </span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-success h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Valores */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-xs text-muted-foreground">Estimado</p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(list.total_estimated)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Gasto</p>
                          <p className="text-sm font-semibold text-primary">
                            {formatCurrency(list.total_spent)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Economia</p>
                          <p
                            className={`text-sm font-semibold ${
                              list.total_estimated - list.total_spent >= 0
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {formatCurrency(list.total_estimated - list.total_spent)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Botões de ação rápida - Mobile-first */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete(list);
                      }}
                    >
                      {list.status === "completed" ? (
                        <>
                          <X className="mr-1 h-4 w-4" />
                          Reabrir
                        </>
                      ) : (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Concluir
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchive(list);
                      }}
                    >
                      <Archive className="mr-1 h-4 w-4" />
                      {list.status === "archived" ? "Desarquivar" : "Arquivar"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setListToDelete(list.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-8 sm:p-12 text-center">
            <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-base sm:text-lg font-medium text-foreground mb-2">
              Nenhuma lista encontrada
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Crie sua primeira lista de compras e organize suas compras de supermercado
            </p>
            <Button onClick={handleNewList} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Criar Lista
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dica */}
      <Card className="shadow-card bg-gradient-card">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">💡 Dica Inteligente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Deslize os itens para a esquerda para marcar como comprado ou editar! Você também
            pode duplicar listas antigas para reutilizar itens frequentes.
          </p>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ShoppingListForm
        open={formOpen}
        onOpenChange={setFormOpen}
        list={selectedList}
      />

      {selectedList && (
        <ShoppingListDetail
          open={detailOpen}
          onOpenChange={setDetailOpen}
          list={selectedList}
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Deletar Lista de Compras"
        description="Tem certeza que deseja deletar esta lista? Todos os itens serão perdidos. Esta ação não pode ser desfeita."
        isLoading={deleteList.isPending}
      />

      {listToComplete && (
        <CompleteShoppingListDialog
          open={completeDialogOpen}
          onOpenChange={setCompleteDialogOpen}
          onConfirm={handleConfirmComplete}
          listName={listToComplete.name}
          totalSpent={listToComplete.total_spent}
          isLoading={updateList.isPending}
        />
      )}
    </div>
  );
};

export default ListaCompras;

