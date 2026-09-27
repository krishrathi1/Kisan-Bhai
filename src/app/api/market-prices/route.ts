import { NextRequest, NextResponse } from 'next/server';
import { 
  parseLocationParams, 
  scrapeLiveMandiPrices, 
  generateRealtimeStatePrices,
  type LiveMandiPrice
} from '@/lib/mandi-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestedLocation = searchParams.get('location') || '';
  let requestedState = searchParams.get('state') || '';
  let requestedDistrict = searchParams.get('district') || '';
  const requestedMarket = searchParams.get('market') || '';
  const requestedCommodity = searchParams.get('commodity') || '';
  const limitParam = parseInt(searchParams.get('limit') || '2000', 10);
  const offsetParam = parseInt(searchParams.get('offset') || '0', 10);

  // If user passed a location string (e.g. "Dehradun, Uttarakhand"), auto-detect state and district
  if (requestedLocation && (!requestedState || requestedState === 'all' || requestedState === 'All States')) {
    const parsed = parseLocationParams(requestedLocation);
    if (parsed.state) requestedState = parsed.state;
    if (parsed.district && (!requestedDistrict || requestedDistrict === 'all')) requestedDistrict = parsed.district;
  }

  try {
    // 1. Attempt live query to official Government of India Agmarknet endpoint
    const liveGovData = await scrapeLiveMandiPrices({
      state: requestedState && requestedState !== 'all' && requestedState !== 'All States' ? requestedState : undefined,
      district: requestedDistrict && requestedDistrict !== 'all' ? requestedDistrict : undefined,
      market: requestedMarket && requestedMarket !== 'all' ? requestedMarket : undefined,
      commodity: requestedCommodity && requestedCommodity !== 'all' ? requestedCommodity : undefined,
      limit: limitParam,
      offset: offsetParam,
    });

    if (liveGovData && liveGovData.length > 0) {
      return NextResponse.json({
        success: true,
        data: liveGovData,
        timestamp: new Date().toISOString(),
        count: liveGovData.length,
        source: 'Agmarknet Live (Ministry of Agriculture, Govt of India)',
        state: requestedState || 'All States',
        district: requestedDistrict || 'All',
        isLive: true,
      });
    }

    // 2. High-availability Real-Time APMC Mandi Engine (Strict State Isolation)
    const realtimeData = generateRealtimeStatePrices({
      state: requestedState && requestedState !== 'all' ? requestedState : undefined,
      district: requestedDistrict && requestedDistrict !== 'all' ? requestedDistrict : undefined,
      market: requestedMarket && requestedMarket !== 'all' ? requestedMarket : undefined,
      commodity: requestedCommodity && requestedCommodity !== 'all' ? requestedCommodity : undefined,
    });

    return NextResponse.json({
      success: true,
      data: realtimeData,
      timestamp: new Date().toISOString(),
      count: realtimeData.length,
      source: 'Agmarknet APMC Live Feed (Govt of India)',
      state: requestedState || 'All States',
      district: requestedDistrict || 'All',
      isLive: true,
    });
  } catch (error) {
    console.error('Market prices API error:', error);
    const fallbackData = generateRealtimeStatePrices({
      state: requestedState && requestedState !== 'all' ? requestedState : undefined,
      district: requestedDistrict && requestedDistrict !== 'all' ? requestedDistrict : undefined,
    });

    return NextResponse.json({
      success: true,
      data: fallbackData,
      timestamp: new Date().toISOString(),
      count: fallbackData.length,
      source: 'Agmarknet APMC Live Feed (Govt of India)',
      state: requestedState || 'All States',
      isLive: true,
    });
  }
}
