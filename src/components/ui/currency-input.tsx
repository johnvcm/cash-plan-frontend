import { forwardRef, InputHTMLAttributes, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, currency = "R$", ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (!isFocused) {
        if (value === 0) {
          setDisplayValue("");
        } else {
          setDisplayValue(
            value.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          );
        }
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setDisplayValue(input);
      
      // Permite apenas números, vírgula e ponto
      const cleanValue = input.replace(/[^\d,.-]/g, "");
      const numberValue = parseFloat(cleanValue.replace(",", ".")) || 0;
      onChange(numberValue);
    };

    const handleFocus = () => {
      setIsFocused(true);
      if (value === 0) {
        setDisplayValue("");
      } else {
        setDisplayValue(value.toString().replace(".", ","));
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (value === 0) {
        setDisplayValue("");
      } else {
        setDisplayValue(
          value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
          {currency}
        </span>
        <input
          type="text"
          inputMode="decimal"
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "flex h-11 w-full rounded-md border border-input bg-background pl-12 pr-3 py-2",
            "text-base font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };

