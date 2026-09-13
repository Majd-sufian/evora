import { NextResponse } from "next/server";
import { fetchAllCarbonIntensity } from "@/lib/api/electricityMaps";

export const revalidate = 600;

export async function GET() {
  try {
    const carbonIntensity = await fetchAllCarbonIntensity();
    return NextResponse.json({ carbonIntensity });
  } catch (error) {
    console.error("Failed to fetch carbon intensity from Electricity Maps", error);
    return NextResponse.json(
      { carbonIntensity: [], error: "Failed to fetch carbon intensity data" },
      { status: 502 }
    );
  }
}
