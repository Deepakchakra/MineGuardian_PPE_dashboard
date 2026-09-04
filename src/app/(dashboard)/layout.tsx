import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-[#02070b] text-white">
      <div className="flex h-screen min-h-0">

        {/* SINGLE SIDEBAR */}
        <Sidebar />

        {/* MAIN AREA */}
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">

          {/* SINGLE HEADER */}
          <PageHeader />

          {/* PAGE CONTENT */}
          <main className="min-h-0 flex-1 overflow-hidden p-5">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}