"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, LocateFixed, MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";

export type LocationData = {
  displayName: string;
  state: string | null;
  district: string | null;
  city: string | null;
  country: string;
  latitude: number;
  longitude: number;
};

type LocationPickerProps = {
  /** Called whenever the user picks a location */
  onLocationChange: (location: LocationData) => void;
  /** Current display value shown in the input */
  value?: string;
};

type Coordinates = { lat: number; lng: number };

// ─── Google Maps typings ────────────────────────────────────────────────────
type GoogleMap = {
  setCenter: (c: Coordinates) => void;
  setZoom: (z: number) => void;
  addListener: (event: string, handler: (e: { latLng: GoogleLatLng }) => void) => void;
};
type GoogleLatLng = { lat: () => number; lng: () => number };
type GoogleMarker = {
  setPosition: (p: Coordinates) => void;
  addListener: (event: string, handler: (e: { latLng: GoogleLatLng }) => void) => void;
};
type GoogleGeocoder = {
  geocode: (req: { location: Coordinates }, cb: (results: Array<{ formatted_address: string }>, status: string) => void) => void;
};
type GoogleAutocomplete = {
  addListener: (event: string, handler: () => void) => void;
  getPlace: () => { formatted_address?: string; geometry?: { location: GoogleLatLng } };
};

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: { center: Coordinates; zoom: number; mapTypeControl?: boolean; fullscreenControl?: boolean; streetViewControl?: boolean }) => GoogleMap;
        Marker: new (opts: { map: GoogleMap; position: Coordinates; draggable: boolean }) => GoogleMarker;
        Geocoder: new () => GoogleGeocoder;
        places?: {
          Autocomplete: new (input: HTMLInputElement, opts?: { types?: string[]; componentRestrictions?: { country: string } }) => GoogleAutocomplete;
        };
      };
    };
    L?: any;
  }
}

const DEFAULT_CENTER: Coordinates = { lat: 20.5937, lng: 78.9629 };
const GOOGLE_SCRIPT_ID = "google-maps-javascript-api";
const LEAFLET_SCRIPT_ID = "leaflet-javascript-api";
const LEAFLET_CSS_ID = "leaflet-css-api";

// Nominatim (OpenStreetMap) forward geocoding for search
async function nominatimSearch(query: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&countrycodes=in&limit=1&addressdetails=1`,
      { headers: { "User-Agent": "Krishi-Mitra/1.0 location-picker" } }
    );
    const data = await res.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
    }
  } catch { /* silent fail */ }
  return null;
}

export function LocationPicker({ onLocationChange, value }: LocationPickerProps) {
  const { t, language } = useTranslation();
  const mapElementRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Engine references
  const engineRef = useRef<"google" | "leaflet" | null>(null);
  const googleMapRef = useRef<GoogleMap | null>(null);
  const googleMarkerRef = useRef<GoogleMarker | null>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);

  const [isReady, setIsReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // ── Fetch structured location from our backend reverse geocoding API ───────
  const fetchLocationData = useCallback(async (coords: Coordinates): Promise<LocationData> => {
    const fallback: LocationData = {
      displayName: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
      state: null,
      district: null,
      city: null,
      country: "India",
      latitude: coords.lat,
      longitude: coords.lng,
    };

    try {
      const res = await fetch(`/api/location/reverse?lat=${coords.lat}&lng=${coords.lng}`);
      if (!res.ok) return fallback;
      const data = await res.json();
      if (data.error) return fallback;

      return {
        displayName: data.displayName || fallback.displayName,
        state: data.state || null,
        district: data.district || null,
        city: data.city || null,
        country: data.country || "India",
        latitude: data.latitude ?? coords.lat,
        longitude: data.longitude ?? coords.lng,
      };
    } catch {
      return fallback;
    }
  }, []);

  // ── Move marker + update location state and callback ───────────────────────
  const updateLocation = useCallback(async (coords: Coordinates) => {
    if (engineRef.current === "google") {
      googleMapRef.current?.setCenter(coords);
      googleMapRef.current?.setZoom(12);
      googleMarkerRef.current?.setPosition(coords);
    } else if (engineRef.current === "leaflet" && leafletMapRef.current) {
      leafletMapRef.current.setView([coords.lat, coords.lng], 12);
      if (leafletMarkerRef.current) {
        leafletMarkerRef.current.setLatLng([coords.lat, coords.lng]);
      }
    }

    const locationData = await fetchLocationData(coords);
    setSelectedLocation(locationData);
    onLocationChange(locationData);
  }, [fetchLocationData, onLocationChange]);

  // ── Initialize Maps Engine (Google Maps if API key provided, else Leaflet/OSM) ──
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (apiKey) {
      // 1. Google Maps Engine
      engineRef.current = "google";
      const initializeGoogle = () => setIsReady(Boolean(window.google?.maps));

      const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", initializeGoogle);
        if (window.google?.maps) initializeGoogle();
        return () => existing.removeEventListener("load", initializeGoogle);
      }

      const script = document.createElement("script");
      script.id = GOOGLE_SCRIPT_ID;
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
      script.addEventListener("load", initializeGoogle);
      document.head.appendChild(script);

      return () => script.removeEventListener("load", initializeGoogle);
    } else {
      // 2. Leaflet / OpenStreetMap Engine (Zero API Key Required)
      engineRef.current = "leaflet";

      // Load Leaflet CSS
      if (!document.getElementById(LEAFLET_CSS_ID)) {
        const link = document.createElement("link");
        link.id = LEAFLET_CSS_ID;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      const initializeLeaflet = () => {
        if (window.L) setIsReady(true);
      };

      if (window.L) {
        setIsReady(true);
        return;
      }

      let script = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = LEAFLET_SCRIPT_ID;
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        document.head.appendChild(script);
      }

      script.addEventListener("load", initializeLeaflet);
      return () => script?.removeEventListener("load", initializeLeaflet);
    }
  }, []);

  // ── Render Map once container and engine are ready ─────────────────────────
  useEffect(() => {
    if (!isReady || !mapElementRef.current) return;

    if (engineRef.current === "google" && window.google?.maps && !googleMapRef.current) {
      const map = new window.google.maps.Map(mapElementRef.current, {
        center: DEFAULT_CENTER,
        zoom: 5,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      });
      const marker = new window.google.maps.Marker({ map, position: DEFAULT_CENTER, draggable: true });
      googleMapRef.current = map;
      googleMarkerRef.current = marker;

      const pick = (e: { latLng: GoogleLatLng }) =>
        updateLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });

      map.addListener("click", pick);
      marker.addListener("dragend", pick);

      if (searchInputRef.current && window.google.maps.places) {
        const ac = new window.google.maps.places.Autocomplete(searchInputRef.current, {
          types: ["geocode"],
          componentRestrictions: { country: "in" },
        });
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          if (place.geometry?.location) {
            updateLocation({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
            setSearchQuery(place.formatted_address || "");
          }
        });
      }
    } else if (engineRef.current === "leaflet" && window.L && !leafletMapRef.current) {
      // Leaflet Map Initialization
      const L = window.L;
      const map = L.map(mapElementRef.current, {
        center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Custom icon or standard marker
      const marker = L.marker([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], { draggable: true }).addTo(map);

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        updateLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        updateLocation({ lat: pos.lat, lng: pos.lng });
      });

      leafletMapRef.current = map;
      leafletMarkerRef.current = marker;

      // Invalidate size after rendering to prevent gray tiles
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }
  }, [isReady, updateLocation]);

  // ── Search location handler ───────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearching(true);
    try {
      const result = await nominatimSearch(q);
      if (result) {
        await updateLocation({ lat: result.lat, lng: result.lng });
        setSearchQuery(result.displayName.split(",")[0] || q);
      } else {
        toast({
          title: t("locationPicker.notFound") || "Location not found",
          description: t("locationPicker.tryDifferent") || "Try a different search term.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, updateLocation, t]);

  // ── Browser geolocation ────────────────────────────────────────────────────
  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: t("locationPicker.unavailable") || "Location unavailable",
        description: t("locationPicker.browserNoSupport") || "Browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await updateLocation({ lat: coords.latitude, lng: coords.longitude });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        toast({
          title: t("locationPicker.permissionNeeded") || "Location permission needed",
          description: t("locationPicker.allowAccess") || "Allow location access and try again.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [updateLocation, t]);

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder={t("locationPicker.searchPlaceholder") || "Search village, district, city..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button type="button" size="icon" variant="outline" onClick={handleSearch} disabled={isSearching} title={t("locationPicker.searchLocation") || "Search"}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative overflow-hidden rounded-xl border border-border shadow-xs">
        <div ref={mapElementRef} className="h-64 w-full bg-muted/60" aria-label="Interactive map location picker" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("locationPicker.loading") || "Loading interactive map..."}
          </div>
        )}
        {/* Use My Location button */}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="absolute bottom-3 right-3 shadow-md z-10"
          onClick={useCurrentLocation}
          disabled={isLocating}
        >
          {isLocating
            ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            : <LocateFixed className="mr-1.5 h-4 w-4" />}
          {t("locationPicker.useMyLocation") || "Use my location"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <span>📍</span>
        <span>{t("locationPicker.hint") || "Click the map or drag the pin to choose your farm location."}</span>
      </p>

      {/* Selected Location Summary Card */}
      {selectedLocation && (
        <LocationSummary location={selectedLocation} language={language} t={t} />
      )}
    </div>
  );
}

// ── Selected Location Summary Card ──────────────────────────────────────────
function LocationSummary({ location, language: _language, t }: {
  location: LocationData;
  language: string;
  t: (key: string) => string;
}) {
  const parts = [location.city, location.district, location.state, location.country].filter(Boolean);
  const uniqueParts = [...new Set(parts)];

  return (
    <div className="mt-2 rounded-lg border border-primary/25 bg-primary/5 p-3 space-y-1.5 transition-all">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
        <MapPin className="h-4 w-4 shrink-0" />
        <span>{t("locationPicker.selectedLocation") || "Selected Location"}</span>
      </div>
      <p className="text-sm font-medium text-foreground pl-5">{uniqueParts.join(", ")}</p>
      <div className="flex flex-wrap gap-1.5 pl-5 pt-0.5">
        {location.state && (
          <Badge variant="secondary" className="text-xs font-medium">
            {t("locationPicker.state") || "State"}: {location.state}
          </Badge>
        )}
        {location.district && (
          <Badge variant="secondary" className="text-xs font-medium">
            {t("locationPicker.district") || "District"}: {location.district}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs font-mono">
          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Badge>
      </div>
    </div>
  );
}
