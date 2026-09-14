import { NextResponse } from "next/server";
import { fetchAllDayAheadPrices } from "@/lib/api/entsoe";

export const revalidate = 900;

export async function GET() {
  try {
    const prices = await fetchAllDayAheadPrices();
    return NextResponse.json({ prices });
  } catch (error) {
    console.error("Failed to fetch day-ahead prices from ENTSO-E", error);
    return NextResponse.json(
      { prices: [], error: "Failed to fetch grid price data" },
      { status: 502 }
    );
  }
}
