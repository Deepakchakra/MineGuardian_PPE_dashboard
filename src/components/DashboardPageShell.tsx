export default function DashboardPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full">

      <div className="mb-5">
        <h1 className="text-xl font-semibold text-white">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}

    </section>
  );
}