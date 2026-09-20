import { NextRequest, NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/data/countries";
import { GeocodeResult } from "@/lib/types";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const COVERED_COUNTRY_CODES = COUNTRIES.map((c) => c.code.toLowerCase()).join(",");

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", COVERED_COUNTRY_CODES);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        // Nominatim's usage policy requires a descriptive User-Agent identifying the app.
        "User-Agent": "Evora-EV-Dashboard/1.0 (portfolio project)",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = (await res.json()) as { display_name: string; lat: string; lon: string }[];
    const results: GeocodeResult[] = data.map((entry) => ({
      label: entry.display_name,
      lat: parseFloat(entry.lat),
      lon: parseFloat(entry.lon),
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Geocode request failed", error);
    return NextResponse.json({ results: [] });
  }
}
