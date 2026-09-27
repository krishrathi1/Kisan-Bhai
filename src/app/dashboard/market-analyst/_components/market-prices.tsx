"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Search, ExternalLink, ShieldCheck, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/contexts/language-context';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { INDIAN_STATES } from '@/lib/mandi-service';

interface MarketData {
  timestamp: string;
  commodity: string;
  location: string;
  price: string;
  change: string;
  state?: string;
  district?: string;
  market?: string;
  variety?: string;
  grade?: string;
  arrivalDate?: string;
  minPrice?: string;
  maxPrice?: string;
  modalPrice?: string;
  source: string;
  sourceUrl?: string;
}

interface MarketPricesResponse {
  success: boolean;
  data: MarketData[];
  timestamp: string;
  count: number;
  source?: string;
  state?: string;
  district?: string;
  error?: string;
  isFallback?: boolean;
}

interface CachedMarketEntry {
  data: MarketData[];
  source?: string;
  isFallback?: boolean;
  count: number;
  cachedAt: string;
  cacheDate: string; // YYYY-MM-DD for daily auto-expiry
}

const CACHE_PREFIX = 'krishi_mandi_cache_';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCacheKey = (state: string, district: string) =>
  `${CACHE_PREFIX}${state || 'all'}_${district || 'all'}`;

function getFromCache(state: string, district: string): CachedMarketEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = getCacheKey(state, district);
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item) as CachedMarketEntry;
      const today = getTodayDateString();
      // Daily Auto-Update: Only return cached data if it is from TODAY
      if (parsed.cacheDate === today && parsed.data && parsed.data.length > 0) {
        return parsed;
      }
      // If from a previous day, auto-clear so fresh daily prices are fetched
      localStorage.removeItem(key);
    }
  } catch (e) {
    // localStorage not available or error
  }
  return null;
}

function setToCache(state: string, district: string, entry: Omit<CachedMarketEntry, 'cacheDate'>) {
  if (typeof window === 'undefined') return;
  try {
    const key = getCacheKey(state, district);
    const todayEntry: CachedMarketEntry = {
      ...entry,
      cacheDate: getTodayDateString(),
    };
    localStorage.setItem(key, JSON.stringify(todayEntry));
  } catch (e) {
    // ignore storage quota issues
  }
}

export function MarketPrices() {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [apiSource, setApiSource] = useState<string>('Agmarknet (Govt of India)');
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  // Initialize selected state from user profile location if available
  useEffect(() => {
    if (userProfile?.location) {
      const loc = userProfile.location.toLowerCase();
      for (const s of INDIAN_STATES) {
        if (s === 'All States') continue;
        if (loc.includes(s.toLowerCase())) {
          setSelectedState(s);
          break;
        }
      }
    }
  }, [userProfile?.location]);

  const fetchMarketData = async (
    stateToFetch = selectedState,
    districtToFetch = selectedDistrict,
    forceRefresh = false
  ) => {
    // Check daily cache first if user has not explicitly clicked refresh
    if (!forceRefresh) {
      const cached = getFromCache(stateToFetch, districtToFetch);
      if (cached && cached.data && cached.data.length > 0) {
        setMarketData(cached.data);
        if (cached.source) setApiSource(cached.source);
        setIsFallback(Boolean(cached.isFallback));
        setLastUpdated(cached.cachedAt);
        setIsFromCache(true);
        return;
      }
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (stateToFetch && stateToFetch !== 'All States') {
        params.set('state', stateToFetch);
      }
      if (districtToFetch && districtToFetch !== 'all') {
        params.set('district', districtToFetch);
      }
      // If no state explicitly chosen yet, try user profile location
      if ((!stateToFetch || stateToFetch === 'All States') && userProfile?.location) {
        params.set('location', userProfile.location);
      }
      params.set('limit', '2000');
      // Cache-busting parameter to ensure fresh live data on explicit refresh
      params.set('_t', Date.now().toString());

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/market-prices${queryString}`, { cache: 'no-store' });
      const result: MarketPricesResponse = await response.json();

      if (result.success) {
        setMarketData(result.data);
        if (result.source) setApiSource(result.source);
        setIsFallback(Boolean(result.isFallback));
        const refreshTime = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastUpdated(refreshTime);
        setIsFromCache(false);

        // Store fetched data in daily cache
        setToCache(stateToFetch, districtToFetch, {
          data: result.data,
          source: result.source,
          isFallback: result.isFallback,
          count: result.count,
          cachedAt: refreshTime,
        });

        toast({
          title: forceRefresh ? "🔄 Mandi Prices Refreshed" : "✅ Live Mandi Prices Loaded",
          description: `Loaded ${result.count} commodities for ${stateToFetch} (${refreshTime})`,
        });
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: "❌ Failed to fetch market data",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when selected state changes (uses cache if already visited)
  useEffect(() => {
    setSelectedDistrict('all');
    setSelectedCommodity('all');
    fetchMarketData(selectedState, 'all', false);
  }, [selectedState]);

  // Extract unique districts in current state data
  const uniqueDistricts = useMemo(() => {
    const districts = marketData.map((d) => d.district).filter(Boolean) as string[];
    return Array.from(new Set(districts)).sort();
  }, [marketData]);

  // Extract unique commodities in current data
  const uniqueCommodities = useMemo(() => {
    const commodities = marketData.map((d) => {
      // Strip parenthetical variety to group main commodities in selector
      return d.commodity.replace(/\s*\([^)]*\)/, '').trim();
    }).filter(Boolean);
    return Array.from(new Set(commodities)).sort();
  }, [marketData]);

  // Extract unique sources
  const uniqueSources = useMemo(() => {
    return Array.from(new Set(marketData.map((item) => item.source).filter(Boolean))).sort();
  }, [marketData]);

  // Client-side filtering across the currently loaded authentic records
  const filteredData = useMemo(() => {
    return marketData.filter((item) => {
      // 1. Search filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          item.commodity.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          (item.district && item.district.toLowerCase().includes(query)) ||
          (item.variety && item.variety.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }

      // 2. District filter
      if (selectedDistrict !== 'all' && item.district !== selectedDistrict) {
        return false;
      }

      // 3. Commodity filter
      if (selectedCommodity !== 'all') {
        const itemBaseCommodity = item.commodity.replace(/\s*\([^)]*\)/, '').trim();
        if (itemBaseCommodity !== selectedCommodity && !item.commodity.includes(selectedCommodity)) {
          return false;
        }
      }

      // 4. Source filter
      if (selectedSource !== 'all' && item.source !== selectedSource) {
        return false;
      }

      return true;
    });
  }, [marketData, searchTerm, selectedDistrict, selectedCommodity, selectedSource]);

  const getChangeColor = (change: string) => {
    if (!change) return 'text-muted-foreground';
    const num = parseFloat(change.replace(/[^\d.-]/g, ''));
    if (isNaN(num)) return 'text-muted-foreground';
    if (num > 0) return 'text-emerald-600 font-semibold';
    if (num < 0) return 'text-rose-600 font-semibold';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change: string) => {
    if (!change) return <Minus className="h-4 w-4" />;
    const num = parseFloat(change.replace(/[^\d.-]/g, ''));
    if (isNaN(num)) return <Minus className="h-4 w-4" />;
    if (num > 0) return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    if (num < 0) return <TrendingDown className="h-4 w-4 text-rose-600" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Live indicator, current scope, and refresh button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-xl font-bold font-headline">Live APMC Mandi Prices</h2>
            <Badge variant="outline" className="text-xs bg-white/80 dark:bg-slate-900 border-emerald-200">
              <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" />
              Official Agmarknet Feed
            </Badge>
            <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300">
              <Calendar className="h-3 w-3 mr-1 text-emerald-600" />
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Badge>
            {selectedState !== 'All States' && (
              <Badge className="bg-emerald-700 text-white text-xs hover:bg-emerald-800">
                <MapPin className="h-3 w-3 mr-1" />
                {selectedState}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
            <span>
              Real-time daily modal transactions from <strong className="text-foreground">{apiSource}</strong>
            </span>
            {lastUpdated && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {isFromCache ? '⚡ Cached at ' : '🔄 Updated at '} {lastUpdated}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchMarketData(selectedState, selectedDistrict, true)}
            disabled={isLoading}
            size="sm"
            className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-4 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Fetching Mandis...' : 'Refresh Live Prices'}
          </Button>
        </div>
      </div>

      {/* Primary Filters: State, District, Commodity, Search */}
      <Card className="border border-border/80 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* State Selector */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">1. Select State (All India)</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="text-xs h-9 font-medium">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District Selector */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">2. Select District</label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
                disabled={uniqueDistricts.length === 0}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">All Districts ({uniqueDistricts.length})</SelectItem>
                  {uniqueDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Commodity Selector */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">3. Select Crop</label>
              <Select
                value={selectedCommodity}
                onValueChange={setSelectedCommodity}
                disabled={uniqueCommodities.length === 0}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="All Crops" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">All Crops ({uniqueCommodities.length})</SelectItem>
                  {uniqueCommodities.map((comm) => (
                    <SelectItem key={comm} value={comm}>
                      {comm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">4. Search Mandi / Crop</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. Potato, Onion, Khanna, Lasalgaon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs h-9"
                />
              </div>
            </div>
          </div>

          {/* Quick Active Filters Summary Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
            <div className="flex items-center gap-3 flex-wrap">
              <span>
                State: <strong className="text-foreground">{selectedState}</strong>
              </span>
              {selectedDistrict !== 'all' && (
                <span>
                  District: <strong className="text-foreground">{selectedDistrict}</strong>
                </span>
              )}
              {selectedCommodity !== 'all' && (
                <span>
                  Crop: <strong className="text-foreground">{selectedCommodity}</strong>
                </span>
              )}
              <span>
                Matching Mandis: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{filteredData.length}</strong>
              </span>
            </div>
            {(selectedDistrict !== 'all' || selectedCommodity !== 'all' || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSelectedDistrict('all');
                  setSelectedCommodity('all');
                  setSearchTerm('');
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Price Details Table */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="py-4 px-6 border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>📋 Official APMC Mandi Rates</span>
              {isFallback && (
                <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-[11px]">
                  Offline Benchmark Mode
                </Badge>
              )}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              Showing {filteredData.length} authentic records
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="text-left py-3.5 px-4 font-semibold">Commodity & Variety</th>
                    <th className="text-left py-3.5 px-4 font-semibold">Mandi Market Yard</th>
                    <th className="text-left py-3.5 px-4 font-semibold">Arrival Date</th>
                    <th className="text-left py-3.5 px-4 font-semibold">Modal Price (₹/Q)</th>
                    <th className="text-left py-3.5 px-4 font-semibold">Min - Max (₹/Q)</th>
                    <th className="text-left py-3.5 px-4 font-semibold">Official Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground text-sm">{item.commodity}</div>
                        {item.variety && item.variety !== 'Other' && (
                          <div className="text-[11px] text-muted-foreground">Variety: {item.variety}</div>
                        )}
                        {item.grade && item.grade !== 'FAQ' && (
                          <Badge variant="outline" className="text-[10px] mt-0.5 px-1.5 py-0 h-4">
                            Grade: {item.grade}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{item.market || item.location}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 inline text-emerald-600" />
                          {item.district ? `${item.district}, ` : ''}{item.state}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          <Calendar className="h-3 w-3" />
                          {item.arrivalDate || item.timestamp.split(' ')[0]}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm sm:text-base">
                          ₹{item.price}
                        </div>
                        <div className="text-[10px] text-muted-foreground">per quintal</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.minPrice && item.maxPrice ? (
                          <div className="text-xs font-medium text-foreground">
                            ₹{item.minPrice} - ₹{item.maxPrice}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <a
                          href={item.sourceUrl || 'https://agmarknet.gov.in'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 group"
                        >
                          <Badge
                            variant="outline"
                            className="text-[11px] font-semibold py-1 px-2.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition-transform group-hover:scale-105"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600 inline" />
                            <span>{item.source || 'Agmarknet'}</span>
                            <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 ml-1 shrink-0" />
                          </Badge>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm space-y-2">
              <p className="font-semibold text-foreground">No commodities found matching current filters.</p>
              <p className="text-xs">
                Try selecting a different State or District from the dropdowns above to view active mandis.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSelectedState('All States');
                  setSelectedDistrict('all');
                  setSelectedCommodity('all');
                  setSearchTerm('');
                }}
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
