import { Home, ShoppingCart, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center py-3 px-2 rounded-t-lg transition-all",
                isActive
                  ? "bg-gradient-to-t from-primary/10 to-transparent text-primary"
                  : "text-muted-foreground hover:text-primary"
              )
            }
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">الرئيسية</span>
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center py-3 px-2 rounded-t-lg transition-all",
                isActive
                  ? "bg-gradient-to-t from-primary/10 to-transparent text-primary"
                  : "text-muted-foreground hover:text-primary"
              )
            }
          >
            <ShoppingCart className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">السلة</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center py-3 px-2 rounded-t-lg transition-all",
                isActive
                  ? "bg-gradient-to-t from-primary/10 to-transparent text-primary"
                  : "text-muted-foreground hover:text-primary"
              )
            }
          >
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">الإعدادات</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
