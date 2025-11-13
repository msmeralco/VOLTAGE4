"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, BarChart3, MapPin, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-orange-600">
      {/* Navbar */}
      <nav className="bg-white backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-[#fe5014]" />
            <span className="text-2xl font-bold text-[#fe5014]">
              GridPulse
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-[#fe5014] hover:text-orange-500 transition-colors"
            >
              Home
            </Link>
            <Link
              href="#about"
              className="text-[#fe5014] hover:text-orange-500 transition-colors"
            >
              About
            </Link>
            <Link href="/login">
              <Button
                className="bg-[#fe5014] hover:bg-orange-600 text-white border-none"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[#fe5014] container mx-auto px-4 pt-10 pb-5 text-center rounded-t-[100px]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-white mb-6">
            GridPulse
          </h1>
          <p className="text-2xl text-white mb-4 font-semibold">
            Powering Smarter Energy Insights
          </p>
          <p className="text-sm text-white mb-8 max-w-3xl mx-auto">
            A comprehensive energy monitoring and analytics platform for Meralco,
            Barangay administrators, and consumers.<br></br> Monitor grid health,
            transformer loads, and consumption patterns in real-time.
          </p>
          {/* <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-[#fe5014] hover:bg-orange-600 text-white"
              >
                Get Started
              </Button>
            </Link>
            <Link href="#about">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#fe5014] text-[#fe5014] hover:bg-orange-50"
              >
                Learn More
              </Button>
            </Link>
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="container mx-auto px-4 bg-[#fe5014]">
        {/* <h2 className="text-4xl font-bold text-center mb-12 text-[#fe5014]">
          Key Features
        </h2> */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group bg-white p-6 rounded-lg shadow-lg border border-[#fe5014] hover:bg-[#fe5014] transition-all hover:scale-105">
            <MapPin className="h-12 w-12 text-[#fe5014] mb-4 group-hover:text-white" />
            <h3 className="text-xl font-semibold mb-2 text-[#fe5014] group-hover:text-white">
              Interactive Maps
            </h3>
            <p className="text-[#fe5014]/90 group-hover:text-white/90">
              Visualize transformers and households on interactive maps with
              real-time grid health indicators.
            </p>
          </div>
          <div className="group bg-white p-6 rounded-lg shadow-lg border border-[#fe5014] hover:bg-[#fe5015] transition-all hover:scale-105">
            <BarChart3 className="h-12 w-12 text-[#fe5014] mb-4 group-hover:text-white" />
            <h3 className="text-xl font-semibold mb-2 text-[#fe5014] group-hover:text-white">
              Analytics & Insights
            </h3>
            <p className="text-[#fe5014]/90 group-hover:text-white/90">
              Track consumption trends, grid health metrics, and predictive
              insights for better energy management.
            </p>
          </div>
          <div className="group bg-white p-6 rounded-lg shadow-lg border border-[#fe5014] hover:bg-[#fe5014] transition-all hover:scale-105">
            <Shield className="h-12 w-12 text-[#fe5014] mb-4 group-hover:text-white" />
            <h3 className="text-xl font-semibold mb-2 text-[#fe5014] group-hover:text-white">
              Multi-Level Access
            </h3>
            <p className="text-[#fe5014]/90 group-hover:text-white/90">
              Role-based dashboards for Meralco administrators, Barangay officials,
              and individual consumers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#fe5014]">
        <div className="container mx-auto px-4 text-center text-[white] bg-[#fe5014] py-8">
          <p>&copy; 2025 GridPulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
