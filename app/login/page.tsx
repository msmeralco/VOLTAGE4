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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        // Store token in cookie
        document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        
        // Redirect based on user type
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-10 w-10 text-orange-500" />
            <span className="text-2xl font-bold ml-2 text-gray-900 dark:text-white">
              GridPulse
            </span>
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userType">User Type</Label>
              <Select value={userType} onValueChange={(value) => setUserType(value as UserType)}>
                <SelectTrigger>
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
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-orange-500">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

