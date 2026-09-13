"use client";

import { useMemo, useState } from "react";
import { COUNTRIES } from "@/lib/data/countries";
import { useEvoraStore } from "@/lib/store";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const setSelectedCountry = useEvoraStore((s) => s.setSelectedCountry);
  const setViewLevel = useEvoraStore((s) => s.setViewLevel);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  function selectCountry(code: string) {
    setSelectedCountry(code);
    setViewLevel("country");
    setQuery("");
    setFocused(false);
  }

  return (
    <div className="relative w-80">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search country..."
        className="w-full rounded-sm border border-[#00D4FF33] bg-[#0A1520CC] px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary backdrop-blur-sm focus:outline-none focus:border-cyan"
      />
      {focused && matches.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1 overflow-hidden rounded-sm border border-[#00D4FF33] bg-[#0A1520F5] backdrop-blur-sm">
          {matches.map((country) => (
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
        </ul>
      )}
    </div>
  );
}
