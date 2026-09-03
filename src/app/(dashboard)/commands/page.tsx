"use client";

export default function DashboardPageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full w-full bg-[#02070b] text-white">
      {children}
    </div>
  );
}