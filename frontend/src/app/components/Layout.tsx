import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, AlertCircle, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

export function Layout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Incidents", href: "/incidents", icon: AlertCircle },
  ];

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href || 
          (item.href === "/incidents" && location.pathname.startsWith("/incidents"));
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-lg font-semibold">AI RCA System</h1>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center justify-between min-w-0">
            <h1 className="text-base sm:text-xl font-semibold truncate">AI-Assisted Incident Analysis & RCA System</h1>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0"></div>
                <span className="hidden md:inline">All Systems Operational</span>
                <span className="md:hidden">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:top-16 lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-white">
          <nav className="flex flex-1 flex-col gap-1 p-4">
            <NavLinks />
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:pl-64 w-full min-w-0">
          <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}