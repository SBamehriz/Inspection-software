import { Button } from "@/components/ui/button";
import { useSignOut } from "@/lib/auth";
import { Smartphone, LogOut, Package } from "lucide-react";
import { Link, useLocation } from "wouter";

interface User {
  id: number;
  username: string;
  role: string;
}

interface NavigationProps {
  user: User;
}

export default function Navigation({ user }: NavigationProps) {
  const signOut = useSignOut();
  const [location] = useLocation();
  
  // Extract current order from URL parameters or global state
  // For now, we'll simulate this
  const currentOrder = "ORD-2024-001"; // This would come from global state

  const handleSignOut = () => {
    signOut.mutate();
  };

  return (
    <nav className="bg-astora-black text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Smartphone className="text-astora-red text-2xl" />
          <Link href="/">
            <h1 className="text-xl font-bold cursor-pointer hover:text-astora-red transition-colors">
              Astora Inspection System
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-6">
          <span className="text-sm">Inspector: {user.username}</span>
          
          {currentOrder && (
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span className="text-sm">
                Order: <span className="text-astora-red font-semibold">{currentOrder}</span>
              </span>
            </div>
          )}
          
          <Button
            onClick={handleSignOut}
            variant="destructive"
            size="sm"
            className="bg-astora-red hover:bg-astora-dark-red"
            disabled={signOut.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {signOut.isPending ? "Signing out..." : "Logout"}
          </Button>
        </div>
      </div>
    </nav>
  );
}
