import { TopNav } from "@/components/layout/TopNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="px-6 py-6">{children}</main>
    </div>
  );
}
