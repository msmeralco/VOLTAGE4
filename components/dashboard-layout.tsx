"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export function DashboardLayout({ title, children }: { title?: string; children: React.ReactNode; }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    document.cookie = "auth-token=; path=/; max-age=0";
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fe5014]">
      {/* Top bar */}
      <header className="w-full bg-[#fe5014] sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-2xl font-bold text-white">
              GridPulse
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:bg-[#fe5014]/60"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-[#fe5014]" />
              ) : (
                <Menu className="h-6 w-6 text-[#fe5014]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="container mx-auto px-4 py-3">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-[#fe5014] hover:bg-[#fe5014]/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {title && (
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
        )}
        <div className="container mx-auto px-4 pb-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>&copy; 2025 GridPulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

