import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FolderOpen, Home } from "lucide-react";
import logoUrl from "@assets/ifa_logo_design (1)_1761497147285.png";

interface HeaderProps {
  showModelsButton?: boolean;
  showHomeButton?: boolean;
}

export function Header({ showModelsButton = false, showHomeButton = false }: HeaderProps) {
  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 hover-elevate active-elevate-2 p-2 -ml-2 rounded-lg cursor-pointer">
            <img 
              src={logoUrl} 
              alt="IFA Logo" 
              className="h-12 w-auto"
              data-testid="logo-image"
            />
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {showHomeButton && (
            <Link href="/">
              <Button variant="outline" data-testid="button-home">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          )}
          {showModelsButton && (
            <Link href="/models">
              <Button variant="outline" data-testid="button-view-models">
                <FolderOpen className="w-4 h-4 mr-2" />
                Saved Models
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
