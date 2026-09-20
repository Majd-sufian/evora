"use client";

import { useEffect, useMemo, useState } from "react";
import { COUNTRIES } from "@/lib/data/countries";
import { useEvoraStore } from "@/lib/store";
import type { GeocodeResult } from "@/lib/types";

const GEOCODE_DEBOUNCE_MS = 400;
const MIN_GEOCODE_QUERY_LENGTH = 3;

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [placeResults, setPlaceResults] = useState<GeocodeResult[]>([]);
  const [geocoding, setGeocoding] = useState(false);
  const setSelectedCountry = useEvoraStore((s) => s.setSelectedCountry);
  const setViewLevel = useEvoraStore((s) => s.setViewLevel);
  const flyTo = useEvoraStore((s) => s.flyTo);

  const countryMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4);
  }, [query]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_GEOCODE_QUERY_LENGTH) {
      setPlaceResults([]);
      return;
    }

    setGeocoding(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { results: GeocodeResult[] };
        setPlaceResults(data.results ?? []);
      } catch (error) {
        console.error("Geocode search failed", error);
        setPlaceResults([]);
      } finally {
        setGeocoding(false);
      }
    }, GEOCODE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  function selectCountry(code: string) {
    setSelectedCountry(code);
    setViewLevel("country");
    setQuery("");
    setFocused(false);
  }

  function selectPlace(place: GeocodeResult) {
    flyTo({ lat: place.lat, lon: place.lon, label: place.label.split(",")[0] });
    setQuery("");
    setFocused(false);
  }

  const showDropdown = focused && (countryMatches.length > 0 || placeResults.length > 0 || geocoding);

  return (
    <div className="relative w-80">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search country, city, or address..."
        className="w-full rounded-sm border border-[#00D4FF33] bg-[#0A1520CC] px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary backdrop-blur-sm focus:outline-none focus:border-cyan"
      />
      {showDropdown && (
        <ul className="absolute left-0 right-0 top-full mt-1 max-h-80 overflow-y-auto rounded-sm border border-[#00D4FF33] bg-[#0A1520F5] backdrop-blur-sm">
          {countryMatches.length > 0 && (
            <li className="px-4 pt-2 text-[10px] uppercase tracking-wide text-text-secondary">Countries</li>
          )}
          {countryMatches.map((country) => (
            <li key={country.code}>
              <button
                type="button"
                onClick={() => selectCountry(country.code)}
                className="block w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-[#00D4FF1A]"
              >
                {country.name}
              </button>
            </li>
          ))}
          {(placeResults.length > 0 || geocoding) && (
            <li className="px-4 pt-2 text-[10px] uppercase tracking-wide text-text-secondary">
              {geocoding ? "Searching places…" : "Places"}
            </li>
          )}
          {placeResults.map((place, i) => (
            <li key={`${place.lat}-${place.lon}-${i}`}>
              <button
                type="button"
                onClick={() => selectPlace(place)}
                className="block w-full truncate px-4 py-2 text-left text-sm text-text-primary hover:bg-[#00D4FF1A]"
                title={place.label}
              >
                {place.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
