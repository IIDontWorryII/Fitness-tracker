import React from "react";
import { Provider as PaperProvider, MD3DarkTheme } from "react-native-paper";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#7C3AED", // purple accent (change later if you want)
    secondary: "#22D3EE",
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
