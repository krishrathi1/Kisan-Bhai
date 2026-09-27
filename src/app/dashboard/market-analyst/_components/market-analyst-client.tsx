"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Bell } from 'lucide-react';
import { MarketPrices } from './market-prices';
import { PriceAlerts } from './price-alerts';

export function MarketAnalystClient() {
  return (
    <Tabs defaultValue="live-prices" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="live-prices" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Live Prices
        </TabsTrigger>
        <TabsTrigger value="price-alerts" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Price Alerts
        </TabsTrigger>
      </TabsList>

      <TabsContent value="live-prices" className="mt-6">
        <MarketPrices />
      </TabsContent>

      <TabsContent value="price-alerts" className="mt-6">
        <PriceAlerts />
      </TabsContent>
    </Tabs>
  );
}
