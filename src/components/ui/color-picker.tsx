import { PRESET_COLORS } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn("grid grid-cols-5 gap-3", className)}>
      {PRESET_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className={cn(
            "relative h-12 w-full rounded-lg transition-all",
            "hover:scale-110 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            value === color.value && "ring-2 ring-primary ring-offset-2"
          )}
          style={{ backgroundColor: color.value }}
          aria-label={`Selecionar cor ${color.name}`}
        >
          {value === color.value && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="h-5 w-5 text-white drop-shadow-lg" strokeWidth={3} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

