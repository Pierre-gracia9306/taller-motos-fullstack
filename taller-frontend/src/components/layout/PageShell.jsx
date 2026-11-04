import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function PageShell({ title, userName = 'Usuario', children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar title={title} userName={userName} />

      <div className="mx-auto flex max-w-7xl">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
