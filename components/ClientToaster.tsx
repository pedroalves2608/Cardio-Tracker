"use client";

import { Toaster } from "sonner";

export function ClientToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{ duration: 4000 }}
    />
  );
}
