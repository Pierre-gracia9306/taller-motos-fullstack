import MainLayout from './MainLayout';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function PageShell({ title, userName = 'Usuario', children }) {
  return (
    <MainLayout
      header={<Navbar title={title} userName={userName} />}
      sidebar={<Sidebar />}
    >
      {children}
    </MainLayout>
  );
}
