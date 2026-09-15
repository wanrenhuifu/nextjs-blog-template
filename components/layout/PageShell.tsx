import { Footer } from "./Footer";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-svh bg-app transition-colors duration-300">
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
