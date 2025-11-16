import "../global.css";
import { Slot } from "expo-router";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';

export default function Layout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ThemeProvider>
        <Slot />
      </ThemeProvider>
    </ClerkProvider>
  );
}