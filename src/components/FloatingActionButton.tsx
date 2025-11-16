import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-50 flex items-center justify-center bg-gradient-primary text-white"
      size="icon"
    >
      <Bot className="h-8 w-8" />
    </Button>
  );
}
