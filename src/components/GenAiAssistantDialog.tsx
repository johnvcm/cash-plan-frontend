import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { Loader2, Sparkles, Trash2, Send, Bot, User } from "lucide-react";

interface Message {
  text: string;
  isUser: boolean;
  error?: boolean;
  sql_query?: string;
}

interface GenAiAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenAiAssistantDialog({ open, onOpenChange }: GenAiAssistantDialogProps) {
  const initialMessage: Message = {
    text: "Olá! 👋 Sou seu assistente financeiro inteligente.\n\nPosso te ajudar a:\n• Consultar seus dados financeiros\n• Adicionar transações\n• Criar contas, metas e investimentos\n\nÉ só conversar comigo naturalmente!",
    isUser: false,
  };
  
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClearChat = () => {
    setMessages([initialMessage]);
  };

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/genai/chat", { 
        prompt: currentInput
      });
      
      const assistantMessage: Message = {
        text: response.response,
        isUser: false,
        error: response.error || false,
        sql_query: response.sql_query,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        text: "Erro: Não consegui obter uma resposta. Verifique sua conexão.",
        isUser: false,
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">Assistente Financeiro IA</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Converse naturalmente comigo
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              disabled={loading || messages.length <= 1}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!message.isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.isUser
                      ? "bg-gradient-primary text-white rounded-tr-sm"
                      : message.error
                      ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm"
                      : "bg-muted/80 rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  {message.sql_query && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-xs opacity-70 font-mono bg-black/10 rounded px-2 py-1">
                        {message.sql_query}
                      </p>
                    </div>
                  )}
                </div>
                {message.isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted/80 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Pensando...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-background/95 backdrop-blur">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Digite sua mensagem..."
                disabled={loading}
                className="pr-4 py-5 rounded-xl resize-none"
              />
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !input.trim()}
              size="icon"
              className="h-10 w-10 rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Pressione Enter para enviar • Shift+Enter para nova linha
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
