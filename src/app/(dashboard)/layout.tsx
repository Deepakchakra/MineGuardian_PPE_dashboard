import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#02070b] text-white">
      <div className="flex min-h-screen">

        {/* SINGLE SIDEBAR */}
        <Sidebar />

        {/* MAIN AREA */}
        <div className="min-w-0 flex-1">

          {/* SINGLE HEADER */}
          <PageHeader />

          {/* PAGE CONTENT */}
          <main className="p-5">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}