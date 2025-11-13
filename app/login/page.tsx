"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap } from "lucide-react";
import type { UserType } from "@/lib/mock-data";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("Consumer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, userType }),
      });

      const data = await response.json();

      if (data.success) {
        document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;

        if (data.user.userType === "Meralco") {
          router.push("/dashboard/meralco");
        } else if (data.user.userType === "Barangay") {
          router.push("/dashboard/barangay");
        } else {
          router.push("/dashboard/consumer");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar fixed to top */}
      <nav className="w-full bg-[#fe5014] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-white" />
            {/* heading moved to footer per request */}
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/back">
              <Button className="bg-white text-[#fe5014] border-none hover:bg-gray-100">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main area: ONLY login form and small links (no secondary assets here) */}
      <main className="flex-1 w-full bg-[#fe5014] rounded-b-[100px] py-10">
        <div className="container mx-auto px-4 py-6 flex flex-col items-center gap-8">
          <div className="w-full max-w-md">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white text-[#fe5014] placeholder:text-[#fe5014]/70 shadow-inner focus:outline-none focus:ring-0 ring-0 border border-transparent"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white text-[#fe5014] placeholder:text-[#fe5014]/70 shadow-inner focus:outline-none focus:ring-0 ring-0 border border-transparent"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="userType" className="text-white">User Type</Label>
                <Select
                  value={userType}
                  onValueChange={(value) => setUserType(value as UserType)}
                >
                  <SelectTrigger className="bg-white text-[#fe5014] placeholder:text-[#fe5014]/70 shadow-inner focus:outline-none focus:ring-0 ring-0 border border-transparent">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Meralco">Meralco</SelectItem>
                    <SelectItem value="Barangay">Barangay</SelectItem>
                    <SelectItem value="Consumer">Consumer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="text-sm text-[#fe5014] bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-white hover:bg-white text-[#fe5014]"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* NEW: Secondary assets moved to their own full-width div under the login area */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-7 w-7 text-[#fe5014]" />
                <h3 className="text-md font-semibold text-[#fe5014]">Real-time Grid</h3>
              </div>
              <p className="text-sm text-[#fe5014]/90 mt-2">
                Visualize grid health and transformer loads with live updates.
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-7 w-7 text-[#fe5014]" />
                <h3 className="text-md font-semibold text-[#fe5014]">Analytics</h3>
              </div>
              <p className="text-sm text-[#fe5014]/90 mt-2">
                Track consumption trends and predictive insights for better planning.
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-7 w-7 text-[#fe5014]" />
                <h3 className="text-md font-semibold text-[#fe5014]">Access Control</h3>
              </div>
              <p className="text-sm text-[#fe5014]/90 mt-2">
                Role-based dashboards for Meralco, Barangay officials, and consumers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: GridPulse text moved here */}
      <footer className="w-full bg-white">
        <div className="container mx-auto px-4 py-6 flex items-center justify-center gap-3">
          <Zap className="h-6 w-6 text-[#fe5014]" />
          <span className="text-[#fe5014] font-semibold">GridPulse</span>
        </div>
      </footer>
    </div>
  );
}

