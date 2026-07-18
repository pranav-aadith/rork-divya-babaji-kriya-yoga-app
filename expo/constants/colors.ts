const colors = {
  primary: "#E07B39",
  primaryLight: "#F5A66B",
  primaryDark: "#C45D1F",
  secondary: "#5B3E8C",
  secondaryLight: "#7B5EAC",
  accent: "#D4A574",
  
  background: "#FDF8F3",
  backgroundDark: "#F5EDE4",
  cardBackground: "#FFFFFF",
  
  text: "#2D2A26",
  textSecondary: "#6B6560",
  textLight: "#9A948D",
  textOnPrimary: "#FFFFFF",
  
  border: "#E8DFD4",
  divider: "#F0E8DE",
  
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  
  overlay: "rgba(45, 42, 38, 0.6)",
  
  gradientStart: "#E07B39",
  gradientEnd: "#F5A66B",
};

export default {
  light: {
    ...colors,
    tint: colors.primary,
    tabIconDefault: colors.textLight,
    tabIconSelected: colors.primary,
  },
};
