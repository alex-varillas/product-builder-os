import "./app.css";
import { AppLanguageProvider } from "@/components/app/AppLanguageContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLanguageProvider>
      <div className="app-shell">{children}</div>
    </AppLanguageProvider>
  );
}
