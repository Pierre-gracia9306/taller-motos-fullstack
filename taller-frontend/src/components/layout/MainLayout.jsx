export default function MainLayout({ children, header, sidebar }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {header}

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden lg:block">
          {sidebar}
        </aside>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
