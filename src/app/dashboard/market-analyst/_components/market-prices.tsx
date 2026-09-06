"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Search, Filter, ExternalLink, ShieldCheck, Radio } from 'lucide-react';
import { useTranslation } from '@/contexts/language-context';
import { toast } from '@/hooks/use-toast';

interface MarketData {
  timestamp: string;
  commodity: string;
  location: string;
  price: string;
  change: string;
  state?: string;
  variety?: string;
  source: string;
  sourceUrl?: string;
}

interface MarketPricesResponse {
  success: boolean;
  data: MarketData[];
  timestamp: string;
  count: number;
  source?: string;
  error?: string;
}

export function MarketPrices() {
  const { t } = useTranslation();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [filteredData, setFilteredData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [apiSource, setApiSource] = useState<string>('Agmarknet & e-NAM Web Feed');

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/market-prices', { cache: 'no-store' });
      const result: MarketPricesResponse = await response.json();
      
      if (result.success) {
        setMarketData(result.data);
        setFilteredData(result.data);
        if (result.source) setApiSource(result.source);
        toast({
          title: "✅ Live Mandi Prices Updated",
          description: `Fetched ${result.count} commodities from verified feeds`,
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

  useEffect(() => {
    fetchMarketData();
  }, []);

  useEffect(() => {
    let filtered = marketData;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by commodity
    if (selectedCommodity !== 'all') {
      filtered = filtered.filter(item => item.commodity === selectedCommodity);
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.location === selectedLocation);
    }

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(item => item.source === selectedSource);
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedCommodity, selectedLocation, selectedSource, marketData]);

  const getUniqueCommodities = () => {
    return Array.from(new Set(marketData.map(item => item.commodity))).sort();
  };

  const getUniqueLocations = () => {
    return Array.from(new Set(marketData.map(item => item.location))).sort();
  };

  const getUniqueSources = () => {
    return Array.from(new Set(marketData.map(item => item.source).filter(Boolean))).sort();
  };

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

  const getSourceBadgeStyle = (source: string = '') => {
    if (source.includes('Agmarknet')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (source.includes('e-NAM')) {
      return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    }
    if (source.includes('NCDEX')) {
      return 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
    }
    return 'bg-slate-50 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header with Live indicator and refresh button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-xl font-bold font-headline">Live APMC Mandi Prices</h2>
            <Badge variant="outline" className="text-xs bg-white/80 dark:bg-slate-900 border-emerald-200">
              <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" />
              Verified Feed
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time modal spot prices from <strong className="text-foreground">{apiSource}</strong>
          </p>
        </div>
        <Button onClick={fetchMarketData} disabled={isLoading} size="sm" className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-4 shadow-sm">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Scraping Feeds...' : 'Refresh Prices'}
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="border border-border/80 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search commodity or mandi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="All Commodities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Commodities</SelectItem>
                {getUniqueCommodities().map(commodity => (
                  <SelectItem key={commodity} value={commodity}>{commodity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="All Mandis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Mandis</SelectItem>
                {getUniqueLocations().map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Price Sources</SelectItem>
                {getUniqueSources().map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Price Details Table */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="py-4 px-6 border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>📋 Price Details</span>
            <span className="text-xs font-normal text-muted-foreground">Showing {filteredData.length} records</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="text-left py-3 px-4 font-semibold">Commodity</th>
                    <th className="text-left py-3 px-4 font-semibold">Location / Mandi</th>
                    <th className="text-left py-3 px-4 font-semibold">Price (₹/Q)</th>
                    <th className="text-left py-3 px-4 font-semibold">24h Change</th>
                    <th className="text-left py-3 px-4 font-semibold">Price Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {item.commodity}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="font-medium bg-background text-xs">
                          {item.location}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-700 dark:text-emerald-400 text-sm sm:text-base">
                        ₹{item.price}
                      </td>
                      <td className={`py-3.5 px-4`}>
                        <span className={`inline-flex items-center gap-1 text-xs ${getChangeColor(item.change)}`}>
                          {getChangeIcon(item.change)}
                          {item.change ? `${item.change}` : '0.00'}
                        </span>
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
                            className={`text-[11px] font-semibold py-1 px-2.5 rounded-full border ${getSourceBadgeStyle(item.source)} transition-transform group-hover:scale-105`}
                          >
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
            <div className="text-center py-12 text-muted-foreground text-sm">
              No commodities found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
