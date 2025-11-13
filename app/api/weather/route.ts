import { NextResponse } from "next/server";
import { generateMockWeather } from "@/lib/mock-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || "Manila";

    const weather = generateMockWeather(city);

    return NextResponse.json({
      success: true,
      data: weather,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

