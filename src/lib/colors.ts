// Paleta de cores fixa e otimizada para UX
export const PRESET_COLORS = [
  { name: "Azul", value: "#3B82F6", lightBg: "#EFF6FF" },
  { name: "Verde", value: "#10B981", lightBg: "#ECFDF5" },
  { name: "Roxo", value: "#8B5CF6", lightBg: "#F5F3FF" },
  { name: "Rosa", value: "#EC4899", lightBg: "#FDF2F8" },
  { name: "Laranja", value: "#F59E0B", lightBg: "#FFFBEB" },
  { name: "Vermelho", value: "#EF4444", lightBg: "#FEF2F2" },
  { name: "Ciano", value: "#06B6D4", lightBg: "#ECFEFF" },
  { name: "Índigo", value: "#6366F1", lightBg: "#EEF2FF" },
  { name: "Amarelo", value: "#EAB308", lightBg: "#FEFCE8" },
  { name: "Cinza", value: "#6B7280", lightBg: "#F9FAFB" },
];

export const getColorName = (hex: string): string => {
  const color = PRESET_COLORS.find((c) => c.value.toLowerCase() === hex.toLowerCase());
  return color?.name || "Personalizada";
};

export const getColorByValue = (hex: string) => {
  return PRESET_COLORS.find((c) => c.value.toLowerCase() === hex.toLowerCase());
};

