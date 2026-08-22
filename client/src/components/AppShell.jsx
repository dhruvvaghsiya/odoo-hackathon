import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Header />
      <div className="flex flex-1 items-start">
        <Navigation />
        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
