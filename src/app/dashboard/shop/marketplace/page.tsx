
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BadgeIndianRupee, CheckCircle2, LocateFixed, MapPin, Mic, PackageSearch, Phone, Search, ShoppingCart, Square, Tractor, Wrench, AlertCircle } from "lucide-react";
import { useTranslation } from "@/contexts/language-context";
import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeSearchQuery } from "@/ai/flows/analyze-search-query";

const productsData = [
  { key: "organicFertilizer", price: "₹450", hint: "bag of organic fertilizer" },
  { key: "pesticideSpray", price: "₹700", hint: "agricultural pesticide bottle" },
  { key: "highYieldSeeds", price: "₹1200", hint: "packet of seeds" },
  { key: "gardeningToolsSet", price: "₹1500", hint: "set of gardening tools" },
  { key: "dripIrrigationKit", price: "₹2500", hint: "drip irrigation system" },
  { key: "soilTestKit", price: "₹900", hint: "soil testing kit" },
  { key: "protectiveGloves", price: "₹250", hint: "gardening gloves" },
  { key: "powerSprayer", price: "₹3500", hint: "agricultural power sprayer" },
  { key: "greenhousePolythene", price: "₹4200", hint: "greenhouse plastic sheet" },
  { key: "waterPump", price: "₹5500", hint: "agricultural water pump" },
  { key: "cowManure", price: "₹300", hint: "bag of cow manure" },
  { key: "neemOil", price: "₹850", hint: "bottle of neem oil" },
];

const productImages: Record<string, string> = {
  organicFertilizer: "/images/mustard_crop.jpg",
  pesticideSpray: "/images/cotton_crop.jpg",
  highYieldSeeds: "/images/wheat_crop.jpg",
  gardeningToolsSet: "/images/private_marketplace.jpg",
  dripIrrigationKit: "/images/rice_paddy_crop.jpg",
  soilTestKit: "/images/pm_kisan_scheme.jpg",
  protectiveGloves: "/images/gov_store.jpg",
  powerSprayer: "/images/private_marketplace.jpg",
  greenhousePolythene: "/images/sunset_farm.jpg",
  waterPump: "/images/rice_paddy_crop.jpg",
  cowManure: "/images/mustard_crop.jpg",
  neemOil: "/images/cotton_crop.jpg",
};

type EquipmentMode = "buy" | "rent";

const equipmentListings = [
  { equipment: "Tractor (45 HP)", type: "rent" as EquipmentMode, shop: "Kisan Machinery Hub", locations: ["pune", "nashik", "maharashtra"], distance: "4.2 km", price: "₹1,200 / day", availability: "Available today", phone: "tel:+919876543210" },
  { equipment: "Power Tiller", type: "buy" as EquipmentMode, shop: "GreenField Agro Centre", locations: ["pune", "satara", "maharashtra"], distance: "7.8 km", price: "₹1,18,000", availability: "In stock", phone: "tel:+919876543211" },
  { equipment: "Rotavator (6 ft)", type: "rent" as EquipmentMode, shop: "Punjab Farm Rentals", locations: ["ludhiana", "amritsar", "punjab"], distance: "5.1 km", price: "₹900 / day", availability: "Available tomorrow", phone: "tel:+919876543212" },
  { equipment: "Solar Water Pump", type: "buy" as EquipmentMode, shop: "Suryodaya Irrigation", locations: ["jaipur", "kota", "rajasthan"], distance: "6.4 km", price: "₹72,500", availability: "Delivery in 3 days", phone: "tel:+919876543213" },
  { equipment: "Mini Combine Harvester", type: "rent" as EquipmentMode, shop: "Namma Agri Rentals", locations: ["bengaluru", "bangalore", "mandya", "karnataka"], distance: "9.6 km", price: "₹2,500 / day", availability: "Available this week", phone: "tel:+919876543214" },
];

const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

export default function MarketplacePage() {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [equipmentMode, setEquipmentMode] = useState<EquipmentMode>('buy');
  const [isRecording, setIsRecording] = useState(false);
  const [isCheckingRelevance, setIsCheckingRelevance] = useState(false);
  const [isRelevant, setIsRelevant] = useState(true);

  const products = useMemo(() => productsData.map(product => ({
    ...product,
    name: t(`shop.marketplace.products.${product.key}`)
  })), [t]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, products]);

  const matchedEquipment = useMemo(() => {
    const normalizedLocation = location.trim().toLowerCase();
    return equipmentListings.filter((listing) => {
      const matchesMode = listing.type === equipmentMode;
      const matchesLocation = !normalizedLocation || listing.locations.some((place) => normalizedLocation.includes(place) || place.includes(normalizedLocation));
      return matchesMode && matchesLocation;
    });
  }, [equipmentMode, location]);
  
  useEffect(() => {
    const checkRelevance = async () => {
      if (searchQuery.trim() === '') {
        setIsRelevant(true);
        return;
      }
      
      // Only check relevance if there are no local results
      if (filteredProducts.length === 0) {
        setIsCheckingRelevance(true);
        try {
          const result = await analyzeSearchQuery({ query: searchQuery });
          setIsRelevant(result.isRelevant);
        } catch (error) {
          console.error("Relevance check failed", error);
          // Default to relevant to avoid showing the wrong message on API error
          setIsRelevant(true);
        } finally {
          setIsCheckingRelevance(false);
        }
      } else {
        // If there are local results, it's definitely relevant
        setIsRelevant(true);
      }
    };
    
    const debounceTimer = setTimeout(checkRelevance, 500);
    return () => clearTimeout(debounceTimer);

  }, [searchQuery, filteredProducts.length]);


  const handleMicClick = () => {
    if (!SpeechRecognition) {
      toast({ title: t('toast.browserNotSupported'), description: t('toast.noVoiceSupport'), variant: "destructive" });
      return;
    }
    
    const langMap: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN', kn: 'kn-IN', bn: 'bn-IN', bho: 'bho-IN' };
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => setSearchQuery(event.results[0][0].transcript);
    recognition.onerror = (event: any) => {
       if (event.error === 'no-speech') {
        toast({ title: t('toast.noSpeechDetected'), description: t('toast.tryAgain'), variant: "destructive" });
      } else {
        toast({ title: t('toast.voiceError'), description: event.error, variant: "destructive" });
      }
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="flex justify-between items-center mb-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">{t('shop.marketplace.title')}</h1>
            <p className="text-muted-foreground">
                {t('shop.marketplace.description')}
            </p>
        </div>
        <Button asChild variant="outline">
            <Link href="/dashboard/shop">
                <ArrowLeft className="mr-2 h-4 w-4"/> {t('shop.marketplace.backToStore')}
            </Link>
        </Button>
      </div>

      <section className="mb-10 rounded-2xl border bg-card p-5 shadow-sm md:p-7">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Tractor className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">{t('shop.marketplace.equipmentFinder.eyebrow')}</span>
            </div>
            <h2 className="text-2xl font-bold font-headline">{t('shop.marketplace.equipmentFinder.title')}</h2>
            <p className="mt-1 text-muted-foreground">{t('shop.marketplace.equipmentFinder.description')}</p>
          </div>
          <div className="flex shrink-0 rounded-lg border bg-background p-1">
            {(['buy', 'rent'] as EquipmentMode[]).map((mode) => (
              <Button key={mode} type="button" size="sm" variant={equipmentMode === mode ? 'default' : 'ghost'} onClick={() => setEquipmentMode(mode)}>
                {mode === 'buy' ? <ShoppingCart className="mr-2 h-4 w-4" /> : <Wrench className="mr-2 h-4 w-4" />}
                {t(`shop.marketplace.equipmentFinder.${mode}`)}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder={t('shop.marketplace.equipmentFinder.locationPlaceholder')} className="pl-9" aria-label={t('shop.marketplace.equipmentFinder.locationLabel')} />
          </div>
          <Button type="button" variant="outline" onClick={() => setLocation('Pune')}>
            <LocateFixed className="mr-2 h-4 w-4" />{t('shop.marketplace.equipmentFinder.useSampleLocation')}
          </Button>
        </div>

        {location.trim() && <p className="mb-4 text-sm text-muted-foreground">{t('shop.marketplace.equipmentFinder.showingResults', { location, mode: t(`shop.marketplace.equipmentFinder.${equipmentMode}`).toLowerCase() })}</p>}

        {matchedEquipment.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matchedEquipment.map((listing) => (
              <Card key={`${listing.shop}-${listing.equipment}`} className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary"><Wrench className="h-5 w-5" /></div>
                    <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">{listing.distance}</span>
                  </div>
                  <CardTitle className="text-lg">{listing.equipment}</CardTitle>
                  <p className="text-sm font-medium text-muted-foreground">{listing.shop}</p>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-muted-foreground"><BadgeIndianRupee className="h-4 w-4" />{t('shop.marketplace.equipmentFinder.price')}</span><strong>{listing.price}</strong></div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-primary" />{listing.availability}</div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2 pt-0">
                  <Button asChild className="w-full"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.shop}, ${listing.locations[0]}`)}`} target="_blank" rel="noreferrer"><MapPin className="mr-2 h-4 w-4" />{t('shop.marketplace.equipmentFinder.directions')}</a></Button>
                  <Button asChild variant="outline" className="w-full"><a href={listing.phone}><Phone className="mr-2 h-4 w-4" />{t('shop.marketplace.equipmentFinder.contact')}</a></Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Alert><PackageSearch className="h-4 w-4" /><AlertTitle>{t('shop.marketplace.equipmentFinder.noResultsTitle')}</AlertTitle><AlertDescription>{t('shop.marketplace.equipmentFinder.noResultsDescription')}</AlertDescription></Alert>
        )}
      </section>
      
       <div className="mb-8 flex items-center gap-2">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder={t('learn.searchPlaceholder')}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={handleMicClick}>
                {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                <span className="sr-only">{isRecording ? t('learn.stopRecording') : t('learn.startVoiceSearch')}</span>
            </Button>
        </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="aspect-square relative">
                  <Image src={productImages[product.key] || "/images/private_marketplace.jpg"} alt={product.name} layout="fill" objectFit="cover" data-ai-hint={product.hint} />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
                <p className="text-2xl font-bold text-primary mt-2">{product.price}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full">
                  <ShoppingCart className="mr-2 h-4 w-4" /> {t('shop.marketplace.addToCart')}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          searchQuery.trim() && !isCheckingRelevance && (
             <div className="sm:col-span-2 md:col-span-3 lg:col-span-4">
                {isRelevant ? (
                    <NoProductsFoundAlert query={searchQuery} />
                ) : (
                    <IrrelevantProductAlert />
                )}
             </div>
          )
        )}
      </div>
    </div>
  );
}

const NoProductsFoundAlert = ({ query }: { query: string }) => {
    const { t } = useTranslation();
    return (
        <Alert>
            <PackageSearch className="h-4 w-4" />
            <AlertTitle>{t('shop.marketplace.comingSoonTitle')}</AlertTitle>
            <AlertDescription>
                {t('shop.marketplace.comingSoonMessage', { query })}
            </AlertDescription>
        </Alert>
    );
};

const IrrelevantProductAlert = () => {
    const { t } = useTranslation();
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('shop.marketplace.irrelevantProductTitle')}</AlertTitle>
            <AlertDescription>
                {t('shop.marketplace.irrelevantProductMessage')}
            </AlertDescription>
        </Alert>
    );
};
