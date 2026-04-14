import { Toaster } from "sonner";

export function Sonner() {
  return (
    <Toaster
      richColors
      toastOptions={{
        style: {
          background: "var(--color-surface)",
          color: "var(--color-fg)",
          border: "1px solid var(--color-border)"
        }
      }}
    />
  );
}
