"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, BarChart3, MapPin, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              GridPulse
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
            >
              Home
            </Link>
            <Link
              href="#about"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
            >
              About
            </Link>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            GridPulse
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-4">
            Powering Smarter Energy Insights
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            A comprehensive energy monitoring and analytics platform for Meralco,
            Barangay administrators, and consumers. Monitor grid health, transformer
            loads, and consumption patterns in real-time.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                Get Started
              </Button>
            </Link>
            <Link href="#about">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Key Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <MapPin className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Interactive Maps
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Visualize transformers and households on interactive maps with
              real-time grid health indicators.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <BarChart3 className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Analytics & Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track consumption trends, grid health metrics, and predictive
              insights for better energy management.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <Shield className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Multi-Level Access
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Role-based dashboards for Meralco administrators, Barangay officials,
              and individual consumers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 GridPulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

