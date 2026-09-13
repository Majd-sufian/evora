import { NextResponse } from "next/server";
import { fetchAllStations } from "@/lib/api/openChargeMap";

export const revalidate = 300;

export async function GET() {
  try {
    const stations = await fetchAllStations();
    return NextResponse.json({ stations });
  } catch (error) {
    console.error("Failed to fetch stations from OpenChargeMap", error);
    return NextResponse.json(
      { stations: [], error: "Failed to fetch station data" },
      { status: 502 }
    );
  }
}
