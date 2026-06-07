import { Navbar } from "@/components/public/Navbar";
import { BottomNav } from "@/components/public/BottomNav";
import { Footer } from "@/components/public/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}
