import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
