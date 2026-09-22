import { ChargingStation } from "@/lib/types";

/**
 * Placeholder station points used until the OpenChargeMap client (build step 8)
 * replaces this with live data.
 */
export const MOCK_STATIONS: ChargingStation[] = [
  { id: "m1", name: "Berlin Mitte Hub", lat: 52.52, lon: 13.405, countryCode: "DE", status: "available", powerKw: 150, state: "Berlin" },
  { id: "m2", name: "Munich Airport", lat: 48.3538, lon: 11.7861, countryCode: "DE", status: "in-use", powerKw: 350, state: "Bayern" },
  { id: "m3", name: "Paris Bercy", lat: 48.8384, lon: 2.3823, countryCode: "FR", status: "available", powerKw: 50, state: "Île-de-France" },
  { id: "m4", name: "Lyon Part-Dieu", lat: 45.7603, lon: 4.8595, countryCode: "FR", status: "unavailable", powerKw: 22, state: "Auvergne-Rhône-Alpes" },
  { id: "m5", name: "London Kings Cross", lat: 51.5308, lon: -0.1238, countryCode: "GB", status: "available", powerKw: 150, state: "Greater London" },
  { id: "m6", name: "Manchester Central", lat: 53.4794, lon: -2.2453, countryCode: "GB", status: "in-use", powerKw: 50, state: "Greater Manchester" },
  { id: "m7", name: "Madrid Retiro", lat: 40.4152, lon: -3.6844, countryCode: "ES", status: "available", powerKw: 100, state: "Madrid" },
  { id: "m8", name: "Milan Centrale", lat: 45.4859, lon: 9.2044, countryCode: "IT", status: "available", powerKw: 175, state: "Lombardia" },
  { id: "m9", name: "Rome Termini", lat: 41.9009, lon: 12.5019, countryCode: "IT", status: "unavailable", powerKw: 50, state: "Lazio" },
  { id: "m10", name: "Amsterdam Zuid", lat: 52.3392, lon: 4.8728, countryCode: "NL", status: "available", powerKw: 350, state: "Noord-Holland" },
  { id: "m11", name: "Rotterdam Centraal", lat: 51.9244, lon: 4.4692, countryCode: "NL", status: "in-use", powerKw: 150, state: "Zuid-Holland" },
  { id: "m12", name: "Oslo Fornebu", lat: 59.8975, lon: 10.6265, countryCode: "NO", status: "available", powerKw: 250, state: "Viken" },
  { id: "m13", name: "Bergen Sentrum", lat: 60.3913, lon: 5.3221, countryCode: "NO", status: "available", powerKw: 150, state: "Vestland" },
  { id: "m14", name: "Stockholm Norrmalm", lat: 59.3346, lon: 18.0632, countryCode: "SE", status: "in-use", powerKw: 150, state: "Stockholm" },
  { id: "m15", name: "Warsaw Centrum", lat: 52.2297, lon: 21.0122, countryCode: "PL", status: "available", powerKw: 100, state: "Mazowieckie" },
  { id: "m16", name: "Vienna Mitte", lat: 48.2082, lon: 16.3738, countryCode: "AT", status: "available", powerKw: 150, state: "Wien" },
  { id: "m17", name: "Zurich HB", lat: 47.3769, lon: 8.5417, countryCode: "CH", status: "unavailable", powerKw: 50, state: "Zürich" },
  { id: "m18", name: "Brussels Midi", lat: 50.8357, lon: 4.3358, countryCode: "BE", status: "available", powerKw: 175, state: "Brussels" },
  { id: "m19", name: "Copenhagen Norreport", lat: 55.6832, lon: 12.5714, countryCode: "DK", status: "in-use", powerKw: 150, state: "Hovedstaden" },
  { id: "m20", name: "Lisbon Oriente", lat: 38.7681, lon: -9.0989, countryCode: "PT", status: "available", powerKw: 50, state: "Lisboa" },
];
