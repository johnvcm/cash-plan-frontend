import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCardCard } from "@/components/CreditCardCard";
import { Plus } from "lucide-react";
import { useCreditCards, useDeleteCreditCard, CreditCard } from "@/hooks/use-api";
import { CreditCardForm } from "@/components/forms/CreditCardForm";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { toast } from "sonner";

const Cartoes = () => {
  const { data: cards, isLoading } = useCreditCards();
  const deleteCard = useDeleteCreditCard();
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<number | null>(null);

  const handleEdit = (card: CreditCard) => {
    setSelectedCard(card);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (cardToDelete) {
      try {
        await deleteCard.mutateAsync(cardToDelete);
        toast.success("Cartão deletado com sucesso!");
        setDeleteDialogOpen(false);
        setCardToDelete(null);
      } catch (error) {
        toast.error("Erro ao deletar cartão");
      }
    }
  };

  const handleNewCard = () => {
    setSelectedCard(undefined);
    setFormOpen(true);
  };

  const totalUsed = cards?.reduce((sum, card) => sum + card.used, 0) || 0;
  const totalLimit = cards?.reduce((sum, card) => sum + card.limit, 0) || 0;
  const availableLimit = totalLimit - totalUsed;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Carregando cartões...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Cartões de Crédito</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie seus cartões e limites</p>
        </div>
        <Button
          className="bg-gradient-primary hover:bg-primary-hover w-full sm:w-auto"
          onClick={handleNewCard}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Cartão
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total utilizado</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {formatCurrency(totalUsed / 100)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Limite total</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {formatCurrency(totalLimit / 100)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Limite disponível</p>
            <p className="text-2xl font-bold text-success mt-2">
              {formatCurrency(availableLimit / 100)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Meus Cartões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {cards && cards.length > 0 ? (
            cards.map((card) => (
              <CreditCardCard
                key={card.id}
                {...card}
                onEdit={() => handleEdit(card)}
                onDelete={() => {
                  setCardToDelete(card.id);
                  setDeleteDialogOpen(true);
                }}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum cartão cadastrado
            </p>
          )}
        </CardContent>
      </Card>

      <CreditCardForm
        open={formOpen}
        onOpenChange={setFormOpen}
        card={selectedCard}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Deletar Cartão"
        description="Tem certeza que deseja deletar este cartão? Esta ação não pode ser desfeita."
        isLoading={deleteCard.isPending}
      />
    </div>
  );
};

export default Cartoes;
