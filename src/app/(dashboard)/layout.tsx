import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#02070b] text-white">

      {/* ONE SIDEBAR ONLY */}
      <Sidebar />

      {/* Main area */}
      <div className="ml-[190px] min-h-screen">

        {/* Header */}
        <PageHeader />

        {/* Page content */}
        <main className="p-4">
          {children}
        </main>

      </div>
    </div>
  );
}