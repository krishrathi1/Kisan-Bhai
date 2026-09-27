import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("lat"));
  const longitude = Number(request.nextUrl.searchParams.get("lng"));

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json(
      { error: "Valid latitude and longitude are required." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${NOMINATIM_URL}?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Krishi-Mitra/1.0 location-picker",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Location address could not be resolved." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const addr = data.address || {};

    // Extract structured location components
    const state =
      addr.state ||
      addr.state_district ||
      addr.region ||
      null;

    const district =
      addr.county ||
      addr.district ||
      addr.state_district ||
      addr.municipality ||
      null;

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.hamlet ||
      null;

    const country = addr.country || "India";
    const countryCode = addr.country_code?.toUpperCase() || "IN";

    // Build a clean human-readable display name
    const parts = [city, district, state, country].filter(Boolean);
    const uniqueParts = [...new Set(parts)];
    const displayName = uniqueParts.join(", ");

    return NextResponse.json({
      displayName: displayName || data.display_name || null,
      fullAddress: data.display_name || null,
      state,
      district,
      city,
      country,
      countryCode,
      latitude,
      longitude,
    });
  } catch {
    return NextResponse.json(
      { error: "Location address could not be resolved." },
      { status: 502 }
    );
  }
}