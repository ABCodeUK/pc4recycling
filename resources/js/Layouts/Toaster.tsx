import { Toaster } from "sonner";

export default function AppLayout({ children }) {
  return (
    <div>
      <Toaster position="top-right" />
    </div>
  );
}
