import { Toaster } from "sonner";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <Toaster position="top-right" />
    </div>
  );
}
