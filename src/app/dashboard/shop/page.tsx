"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Tractor, Store, Phone, MapPin, ShieldCheck, CheckCircle2, 
  Clock, PlusCircle, Wrench, Sparkles, Search, Filter, 
  ArrowLeft, Award, Send, Check, Truck, Trash2, MessageSquare, 
  ShoppingCart, AlertCircle, Eye, ChevronRight, Navigation,
  Compass, ExternalLink, HelpCircle, Layers, CheckCheck
} from "lucide-react";
import { 
  VERIFIED_EQUIPMENT_STORES, 
  INITIAL_RENTAL_LISTINGS, 
  type EquipmentStore, 
  type RentalListing 
} from "@/lib/store-equipment-data";
import { ALL_INDIAN_STATES_FILTER } from "@/lib/schemes-master-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/contexts/language-context";

const MACHINERY_CATEGORIES = [
  "All Machinery",
  "Small Tractor",
  "Tractor (Medium/Heavy)",
  "Power Tiller",
  "Rotavator",
  "Combine Harvester",
  "Seed Drill / Super Seeder",
  "Drone Sprayer",
  "Water Pump & Pipes",
  "Laser Land Leveler",
  "Thresher / Straw Reaper",
  "Cultivator & Harrow",
] as const;

const POPULAR_LOCATIONS = [
  "All India",
  "Pune",
  "Dehradun",
  "Ludhiana",
  "Nashik",
  "Lucknow",
  "Jaipur",
  "Karnal",
  "Indore",
  "Bhopal",
  "Patna",
  "Bengaluru",
  "Ahmedabad",
];

const POPULAR_EQUIPMENTS = [
  { label: "All Machinery", value: "All Machinery", icon: "🚜" },
  { label: "Small Tractor (15-30 HP)", value: "Small Tractor", icon: "🚜" },
  { label: "Heavy Tractor (40+ HP)", value: "Tractor (Medium/Heavy)", icon: "🚜" },
  { label: "Rotavator", value: "Rotavator", icon: "⚙️" },
  { label: "Power Tiller", value: "Power Tiller", icon: "🌱" },
  { label: "Combine Harvester", value: "Combine Harvester", icon: "🌾" },
  { label: "Drone Sprayer", value: "Drone Sprayer", icon: "🚁" },
  { label: "Water Pump / Solar", value: "Water Pump & Pipes", icon: "💧" },
  { label: "Seed Drill / Seeder", value: "Seed Drill / Super Seeder", icon: "🌾" },
];

export default function KrishiStorePage() {
  const { t } = useTranslation();
  const { userProfile } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>("buy-stores");

  // Search & Filter State
  const [equipmentQuery, setEquipmentQuery] = useState<string>("");
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Machinery");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  // Rental Listings (seeded + user-submitted)
  const [rentalListings, setRentalListings] = useState<RentalListing[]>(INITIAL_RENTAL_LISTINGS);
  const [userListingsCount, setUserListingsCount] = useState<number>(0);

  // Modal States
  const [inquiryStore, setInquiryStore] = useState<EquipmentStore | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<string>("");
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [bookingRental, setBookingRental] = useState<RentalListing | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Form State: Give Equipment on Rent
  const [newListing, setNewListing] = useState({
    equipmentTitle: "",
    equipmentType: "Small Tractor" as RentalListing['equipmentType'],
    model: "",
    hp: "",
    ownerName: userProfile?.name || "",
    phone: userProfile?.phone || "",
    rate: "",
    rateUnit: "hour" as 'hour' | 'day' | 'acre' | 'month',
    state: "Uttarakhand",
    district: "Dehradun",
    villageOrLocation: "",
    driverIncluded: true,
    availability: "Available Today",
    notes: "",
  });

  // Load saved user rental listings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("krishi_user_rentals");
      if (saved) {
        const userRentals: RentalListing[] = JSON.parse(saved);
        setUserListingsCount(userRentals.length);
        setRentalListings([...userRentals, ...INITIAL_RENTAL_LISTINGS]);
      }
    } catch (e) {
      console.warn("Could not load stored rentals", e);
    }
  }, []);

  // Initialize location from user profile if available
  useEffect(() => {
    if (userProfile?.location && !locationQuery) {
      const loc = userProfile.location.trim();
      setLocationQuery(loc);
      const match = ALL_INDIAN_STATES_FILTER.find(
        (s) => s.code !== "all" && loc.toLowerCase().includes(s.name.toLowerCase())
      );
      if (match) {
        setSelectedState(match.name);
        setNewListing((prev) => ({ ...prev, state: match.name }));
      }
    }
  }, [userProfile?.location]);

  // GPS Location Auto-Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Unavailable",
        description: "Your browser does not support automatic location detection. Please type your city/district manually.",
        variant: "destructive",
      });
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        // Default to state / detected center if available or prompt city
        const locDesc = userProfile?.location || "Nearby Local Area";
        setLocationQuery(locDesc);
        toast({
          title: "📍 Location Detected",
          description: `Location set to ${locDesc}. Showing nearest equipment shops and rentals.`,
        });
      },
      (err) => {
        setIsDetectingLocation(false);
        // Use user profile location or prompt
        if (userProfile?.location) {
          setLocationQuery(userProfile.location);
          toast({
            title: "📍 Profile Location Used",
            description: `Using your profile location: ${userProfile.location}`,
          });
        } else {
          toast({
            title: "Could Not Auto-Detect Location",
            description: "Please enter your city, district or state name in the location box.",
            variant: "destructive",
          });
        }
      },
      { timeout: 7000 }
    );
  };

  // Helper: check if equipment matches query
  const equipmentMatches = (itemEquipmentType: string, itemName: string, itemSpecs?: string, itemBrands?: string[]) => {
    // 1. Category selector
    if (selectedCategory !== "All Machinery" && itemEquipmentType !== selectedCategory) {
      return false;
    }

    // 2. Equipment query text
    if (!equipmentQuery.trim()) return true;
    const q = equipmentQuery.toLowerCase().trim();

    const target = `${itemEquipmentType} ${itemName} ${itemSpecs || ""} ${(itemBrands || []).join(" ")}`.toLowerCase();

    // Word-based matching for robust search (e.g. "small tractor" or "rotavator 5ft")
    const words = q.split(/\s+/).filter(Boolean);
    return words.every(word => target.includes(word));
  };

  // Helper: check if store matches location
  const locationMatches = (city: string, district: string, state: string, address: string) => {
    // State dropdown check
    if (selectedState !== "all" && state.toLowerCase() !== selectedState.toLowerCase()) {
      return false;
    }

    // Location query text
    if (!locationQuery.trim()) return true;
    const loc = locationQuery.toLowerCase().trim();

    if (loc === "all india" || loc === "all" || loc === "nationwide") return true;

    const fullLoc = `${city} ${district} ${state} ${address}`.toLowerCase();
    const locTokens = loc.split(/[\s,]+/).filter(Boolean);

    // If any token of the location query matches city, district, or state
    return locTokens.some(token => fullLoc.includes(token));
  };

  // Filtered Equipment Stores (Dealerships to BUY equipment)
  const filteredStores = useMemo(() => {
    return VERIFIED_EQUIPMENT_STORES.filter((store) => {
      // 1. Location match
      const locMatch = locationMatches(store.city, store.district, store.state, store.address);
      if (!locMatch) return false;

      // 2. Equipment match: Does store offer equipment matching user's query?
      if (selectedCategory !== "All Machinery" || equipmentQuery.trim()) {
        const hasMatchingCategory = store.categories.some(cat => 
          equipmentMatches(cat, store.name, "", store.brands)
        );
        const hasMatchingProduct = store.featuredProducts.some(prod => 
          equipmentMatches(prod.category, prod.name, prod.specs, store.brands)
        );
        if (!hasMatchingCategory && !hasMatchingProduct) {
          return false;
        }
      }

      return true;
    });
  }, [selectedState, selectedCategory, equipmentQuery, locationQuery]);

  // Stores in other locations if current location has limited/no results
  const otherLocationStores = useMemo(() => {
    if (filteredStores.length > 0 && locationQuery.trim() === "") return [];
    
    // Find stores outside the selected location that have matching equipment
    return VERIFIED_EQUIPMENT_STORES.filter((store) => {
      // Skip already shown stores
      if (filteredStores.some(s => s.id === store.id)) return false;

      // Check equipment match
      if (selectedCategory !== "All Machinery" || equipmentQuery.trim()) {
        const hasMatchingCategory = store.categories.some(cat => 
          equipmentMatches(cat, store.name, "", store.brands)
        );
        const hasMatchingProduct = store.featuredProducts.some(prod => 
          equipmentMatches(prod.category, prod.name, prod.specs, store.brands)
        );
        if (!hasMatchingCategory && !hasMatchingProduct) {
          return false;
        }
      }

      return true;
    });
  }, [filteredStores, selectedCategory, equipmentQuery, locationQuery]);

  // Filtered Rental Machinery (Available to RENT)
  const filteredRentals = useMemo(() => {
    return rentalListings.filter((rent) => {
      // 1. Location match
      const locMatch = locationMatches(rent.district, rent.district, rent.state, `${rent.villageOrLocation} ${rent.district}`);
      if (!locMatch) return false;

      // 2. Equipment match
      return equipmentMatches(rent.equipmentType, rent.equipmentTitle, `${rent.model} ${rent.notes || ""}`);
    });
  }, [rentalListings, selectedState, selectedCategory, equipmentQuery, locationQuery]);

  // Handle Form Submit: List My Equipment for Rent
  const handleListEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.equipmentTitle || !newListing.rate || !newListing.phone || !newListing.villageOrLocation) {
      toast({
        title: "❌ Incomplete Details",
        description: "Please fill in equipment title, rental rate, phone number, and location.",
        variant: "destructive",
      });
      return;
    }

    const createdListing: RentalListing = {
      id: `user-rent-${Date.now()}`,
      equipmentTitle: newListing.equipmentTitle,
      equipmentType: newListing.equipmentType,
      model: newListing.model || newListing.equipmentTitle,
      hp: newListing.hp || undefined,
      ownerName: newListing.ownerName || userProfile?.name || "Farmer Owner",
      ownerType: "Farmer",
      phone: newListing.phone,
      rate: parseFloat(newListing.rate),
      rateUnit: newListing.rateUnit,
      state: newListing.state,
      district: newListing.district,
      villageOrLocation: newListing.villageOrLocation,
      distance: "Near You (Local)",
      driverIncluded: newListing.driverIncluded,
      availability: newListing.availability,
      notes: newListing.notes,
      verified: true,
      listedAt: "Just now",
      isUserListing: true,
    };

    const updated = [createdListing, ...rentalListings];
    setRentalListings(updated);
    setUserListingsCount((prev) => prev + 1);

    // Save in localStorage
    try {
      const existingUserRentals = JSON.parse(localStorage.getItem("krishi_user_rentals") || "[]");
      localStorage.setItem("krishi_user_rentals", JSON.stringify([createdListing, ...existingUserRentals]));
    } catch (err) {
      console.warn("Storage error", err);
    }

    toast({
      title: "🎉 Equipment Successfully Listed for Rent!",
      description: `Your ${newListing.equipmentTitle} is now live and visible to farmers in ${newListing.villageOrLocation}, ${newListing.district}.`,
    });

    // Reset form
    setNewListing({
      equipmentTitle: "",
      equipmentType: "Small Tractor",
      model: "",
      hp: "",
      ownerName: userProfile?.name || "",
      phone: userProfile?.phone || "",
      rate: "",
      rateUnit: "hour",
      state: newListing.state,
      district: newListing.district,
      villageOrLocation: "",
      driverIncluded: true,
      availability: "Available Today",
      notes: "",
    });

    // Automatically navigate to the rent tab so user sees their listing
    setActiveTab("rent-equipment");
  };

  // Remove a user-created listing
  const handleDeleteUserListing = (id: string) => {
    const updated = rentalListings.filter((l) => l.id !== id);
    setRentalListings(updated);
    setUserListingsCount((prev) => Math.max(0, prev - 1));
    try {
      const existingUserRentals: RentalListing[] = JSON.parse(localStorage.getItem("krishi_user_rentals") || "[]");
      const filtered = existingUserRentals.filter((l) => l.id !== id);
      localStorage.setItem("krishi_user_rentals", JSON.stringify(filtered));
    } catch (e) {
      console.warn("Could not delete from storage", e);
    }
    toast({
      title: "🗑️ Listing Removed",
      description: "Your rental equipment listing has been taken down.",
    });
  };

  // Google Maps Search Generator for any location & equipment
  const googleMapsUrl = useMemo(() => {
    const equip = equipmentQuery.trim() || (selectedCategory !== "All Machinery" ? selectedCategory : "tractor farm equipment");
    const loc = locationQuery.trim() || (selectedState !== "all" ? selectedState : "India");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${equip} dealership store shop near ${loc}`)}`;
  }, [equipmentQuery, selectedCategory, locationQuery, selectedState]);

  // Open Inquiry for Purchasing from Store
  const handleOpenStoreInquiry = (store: EquipmentStore, productName?: string) => {
    setInquiryStore(store);
    setInquiryProduct(productName || (store.featuredProducts[0]?.name ?? "Farm Equipment"));
    setIsInquiryModalOpen(true);
  };

  // Open Booking for Renting Equipment
  const handleOpenRentalBooking = (rental: RentalListing) => {
    setBookingRental(rental);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
      {/* ========================================================================= */}
      {/* HEADER BANNER                                                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gradient-to-r from-emerald-600/15 via-emerald-500/10 to-transparent p-6 rounded-3xl border border-emerald-500/25 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <Tractor className="h-3.5 w-3.5 text-emerald-600" />
              Krishi Farm Machinery & Implement Network
            </span>
            <Badge variant="outline" className="text-xs border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" />
              Verified Dealerships & Farmer P2P Rentals
            </Badge>
            {userListingsCount > 0 && (
              <Badge className="bg-emerald-600 text-white text-xs hover:bg-emerald-700">
                ✨ {userListingsCount} Equipment Listed by You
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-foreground">
            Krishi Store & Farm Machinery Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl leading-relaxed">
            Find verified equipment dealerships near your location to purchase machinery with government SMAM subsidy, rent tractors and implements from local farmers, or list your own equipment for rent to earn extra income.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button 
            onClick={() => setActiveTab("give-on-rent")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md transition-all hover:scale-105"
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Rent Out Your Equipment
          </Button>
          <Button asChild variant="outline" className="rounded-xl shadow-sm text-xs h-10">
            <Link href="/dashboard">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED EQUIPMENT & LOCATION SEARCH BAR                                 */}
      {/* ========================================================================= */}
      <Card className="border-2 border-emerald-500/30 shadow-lg bg-card/90 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-transparent px-5 py-3 border-b flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            <Search className="h-4 w-4 text-emerald-600" />
            <span>Search Equipment Needed & Location</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Instant matching across authorized dealerships, stores & local farmer rentals
          </span>
        </div>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* 1. What Equipment Do You Need? */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Tractor className="h-3.5 w-3.5 text-emerald-600" />
                  1. Which Equipment do you need?
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  (e.g. Small Tractor, Rotavator, Drone)
                </span>
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={equipmentQuery}
                  onChange={(e) => setEquipmentQuery(e.target.value)}
                  placeholder="Type equipment (e.g. Small Tractor, Rotavator, Power Tiller, Harvester...)"
                  className="pl-10 h-11 text-xs font-medium rounded-xl border-input/80 focus:border-emerald-500 shadow-inner"
                />
                {equipmentQuery && (
                  <button
                    onClick={() => setEquipmentQuery("")}
                    className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 2. Your Location */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  2. Enter Your Location (City, District, State)
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Navigation className="h-3 w-3" />
                  {isDetectingLocation ? "Detecting..." : "Detect Location"}
                </button>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600" />
                <Input
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Enter your City, District, Village or State (e.g. Pune, Dehradun, Lucknow...)"
                  className="pl-10 pr-24 h-11 text-xs font-medium rounded-xl border-input/80 focus:border-emerald-500 shadow-inner"
                />
                {locationQuery ? (
                  <button
                    onClick={() => setLocationQuery("")}
                    className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground font-bold"
                  >
                    ✕ Clear
                  </button>
                ) : (
                  <div className="absolute right-2 top-1.5">
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="h-8 rounded-lg border border-input/60 bg-muted/30 px-2 text-[11px] font-semibold text-muted-foreground focus:outline-none"
                    >
                      <option value="all">Select State</option>
                      {ALL_INDIAN_STATES_FILTER.filter((s) => s.code !== "all").map((st) => (
                        <option key={st.code} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Filter Chips: Popular Equipments */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
              Popular:
            </span>
            {POPULAR_EQUIPMENTS.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setSelectedCategory(item.value);
                  setEquipmentQuery(item.value === "All Machinery" ? "" : item.value);
                }}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  (selectedCategory === item.value || (equipmentQuery.toLowerCase() === item.value.toLowerCase()))
                    ? "bg-emerald-600 text-white font-bold shadow-sm"
                    : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Quick Filter Chips: Popular Locations */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs border-t border-border/40 pt-2.5">
            <span className="text-[11px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-emerald-600" /> Cities:
            </span>
            {POPULAR_LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  if (loc === "All India") {
                    setLocationQuery("");
                    setSelectedState("all");
                  } else {
                    setLocationQuery(loc);
                  }
                }}
                className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] transition-all ${
                  (locationQuery.toLowerCase() === loc.toLowerCase() || (loc === "All India" && !locationQuery && selectedState === "all"))
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-800"
                    : "bg-background border border-border/60 hover:border-emerald-500/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Search Result Summary and Google Maps Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground">
                Showing results for:{" "}
                <strong className="text-foreground">
                  {equipmentQuery || (selectedCategory !== "All Machinery" ? selectedCategory : "All Farm Machinery")}
                </strong>{" "}
                in{" "}
                <strong className="text-foreground">
                  {locationQuery || (selectedState !== "all" ? selectedState : "All India")}
                </strong>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                {filteredStores.length} Stores to Buy
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold">
                {filteredRentals.length} Machinery on Rent
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="h-8 text-xs font-semibold rounded-lg border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  <Compass className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                  Open Live Stores on Google Maps
                  <ExternalLink className="h-3 w-3 ml-1 text-muted-foreground" />
                </a>
              </Button>
              {(equipmentQuery || locationQuery || selectedCategory !== "All Machinery" || selectedState !== "all") && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setEquipmentQuery("");
                    setLocationQuery("");
                    setSelectedCategory("All Machinery");
                    setSelectedState("all");
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* TABS NAVIGATION                                                           */}
      {/* ========================================================================= */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto p-1.5 rounded-2xl bg-muted/60 border border-border/80 shadow-sm">
          <TabsTrigger 
            value="buy-stores" 
            className="py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all data-[state=active]:bg-background data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
          >
            <Store className="h-4 w-4 text-emerald-600" />
            <span>Nearby Stores (Buy Equipment)</span>
            <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5">
              {filteredStores.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger 
            value="rent-equipment" 
            className="py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all data-[state=active]:bg-background data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
          >
            <Wrench className="h-4 w-4 text-blue-600" />
            <span>Rent Equipment Nearby</span>
            <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5">
              {filteredRentals.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger 
            value="give-on-rent" 
            className="py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Give on Rent (कमाई करें)</span>
            {userListingsCount > 0 && (
              <Badge className="ml-1 bg-white text-emerald-800 text-[10px] h-5 px-1.5 font-bold">
                {userListingsCount} Active
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: NEARBY STORES (BUY EQUIPMENT)                                      */}
        {/* ========================================================================= */}
        <TabsContent value="buy-stores" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-muted/20 p-4 rounded-xl border">
            <div>
              <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                <Store className="h-5 w-5 text-emerald-600" />
                Authorized Machinery Dealerships & Stores Near You
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Authorized stores offering brand new equipment, manufacturer warranty, and direct SMAM / DBT government subsidy assistance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border-emerald-300">
                {filteredStores.length} Stores Found
              </Badge>
            </div>
          </div>

          {/* Store Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStores.map((store) => (
              <Card key={store.id} className="border border-border/80 hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col overflow-hidden bg-card">
                <CardHeader className="p-4 pb-3 bg-muted/20 border-b space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <CardTitle className="text-base font-bold text-foreground">
                          {store.name}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{store.address}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                        {store.distance}
                      </span>
                      <div className="text-[11px] text-amber-600 font-bold mt-1">
                        ★ {store.rating} ({store.reviewsCount} reviews)
                      </div>
                    </div>
                  </div>

                  {/* Badges: Brands & Subsidy */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {store.subsidyApproved && (
                      <Badge className="bg-emerald-700 text-white text-[10px] font-semibold">
                        <Award className="h-3 w-3 mr-1" />
                        Govt SMAM 40-50% Subsidy Approved
                      </Badge>
                    )}
                    {store.brands.map((b) => (
                      <Badge key={b} variant="outline" className="text-[10px] bg-background">
                        {b}
                      </Badge>
                    ))}
                    <Badge variant="secondary" className="text-[10px]">
                      📍 {store.city}, {store.state}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 flex-1 space-y-4 text-xs">
                  {/* Featured In-Stock Equipment */}
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      🚜 Available Machinery & In-Stock Prices:
                    </span>
                    <div className="space-y-2.5">
                      {store.featuredProducts.map((prod, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-border/70 bg-muted/15 hover:bg-muted/30 transition-colors flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground text-xs">{prod.name}</span>
                              {prod.inStock && (
                                <span className="inline-flex items-center text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                                  <Check className="h-3 w-3 mr-0.5" /> In Stock
                                </span>
                              )}
                              <Badge variant="outline" className="text-[9px] h-4">
                                {prod.category}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{prod.specs}</p>
                            {prod.subsidyEligible && (
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                                • Eligible for DBT direct state agriculture subsidy
                              </span>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300 block">
                              {prod.price}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenStoreInquiry(store, prod.name)}
                              className="h-6 text-[10px] px-2 mt-1.5 block w-full text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300"
                            >
                              Get Quote
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-2 border-t bg-muted/10 grid grid-cols-3 gap-2 mt-auto">
                  <Button asChild variant="outline" className="w-full text-xs h-9">
                    <a href={`tel:${store.phone}`}>
                      <Phone className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                      Call Dealer
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full text-xs h-9">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.name} ${store.address}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                      Directions
                    </a>
                  </Button>
                  <Button 
                    onClick={() => handleOpenStoreInquiry(store)}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 font-semibold"
                  >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    Book Demo
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* If No Stores match exact query or location */}
          {filteredStores.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed rounded-2xl bg-muted/20 p-8 space-y-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto">
                <Store className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  No verified dealerships found in &ldquo;{locationQuery || selectedState}&rdquo; matching &ldquo;{equipmentQuery || selectedCategory}&rdquo;
                </h3>
                <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                  Don&apos;t worry! You can search live on Google Maps for local farm equipment shops in your exact locality, or view authorized dealerships across nearby districts that offer delivery.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                <Button asChild className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9">
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <Compass className="mr-1.5 h-4 w-4" />
                    Find Shops on Google Maps in {locationQuery || "Your Area"}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocationQuery("");
                    setSelectedState("all");
                    setSelectedCategory("All Machinery");
                    setEquipmentQuery("");
                  }}
                  className="text-xs h-9"
                >
                  Show All India Stores
                </Button>
              </div>
            </div>
          )}

          {/* Stores in Other Locations (When searching for a specific place) */}
          {locationQuery.trim() !== "" && otherLocationStores.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-border/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    Authorized Dealerships in Other Locations (Delivery Available)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    These regional equipment stores deliver tractors and machinery with on-site warranty across multiple districts.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {otherLocationStores.length} Stores Available
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherLocationStores.slice(0, 6).map((store) => (
                  <Card key={store.id} className="border hover:border-emerald-500/40 p-4 space-y-3 bg-card/60">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-foreground">{store.name}</h4>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-emerald-600" />
                          {store.city}, {store.state}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        ★ {store.rating}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-muted-foreground space-y-1">
                      <span className="font-semibold block text-foreground">Featured In-Stock:</span>
                      <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {store.featuredProducts[0]?.name} - {store.featuredProducts[0]?.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button asChild variant="outline" size="sm" className="w-1/2 text-[11px] h-7">
                        <a href={`tel:${store.phone}`}>
                          <Phone className="h-3 w-3 mr-1 text-emerald-600" /> Call
                        </a>
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleOpenStoreInquiry(store)}
                        className="w-1/2 text-[11px] h-7 bg-emerald-700 hover:bg-emerald-800 text-white"
                      >
                        Inquire
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: RENT EQUIPMENT NEARBY (P2P FARMER & CHC RENTALS)                   */}
        {/* ========================================================================= */}
        <TabsContent value="rent-equipment" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-900">
            <div>
              <h2 className="text-xl font-bold font-headline flex items-center gap-2 text-foreground">
                <Wrench className="h-5 w-5 text-blue-600" />
                Farm Machinery Available for Rent in Your Area
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rent tractors, tillers, rotavators, and sprayers directly from fellow farmers and village Custom Hiring Centers (CHCs) at affordable hourly and daily rates.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-blue-300 text-xs font-bold">
                {filteredRentals.length} Machinery Units on Rent
              </Badge>
            </div>
          </div>

          {/* User's own listings active notification banner */}
          {userListingsCount > 0 && (
            <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground">
                    You have {userListingsCount} active equipment listing{userListingsCount > 1 ? "s" : ""} on rent
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Nearby farmers searching for equipment in your location can view your contact details and book your machinery.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab("give-on-rent")} 
                size="sm" 
                variant="outline" 
                className="text-xs shrink-0 border-emerald-500/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
              >
                + List Another Equipment
              </Button>
            </div>
          )}

          {/* Rental Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRentals.map((rental) => (
              <Card 
                key={rental.id} 
                className={`border transition-all flex flex-col overflow-hidden bg-card ${
                  rental.isUserListing 
                    ? "border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20" 
                    : "border-border/80 hover:border-blue-500/50 hover:shadow-md"
                }`}
              >
                <CardHeader className={`p-4 pb-3 border-b space-y-1.5 ${rental.isUserListing ? "bg-emerald-50/50 dark:bg-emerald-950/30" : "bg-muted/15"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200">
                      {rental.equipmentType}
                    </Badge>
                    {rental.isUserListing ? (
                      <Badge className="bg-emerald-700 text-white text-[10px] font-bold">
                        ⭐ Your Active Listing
                      </Badge>
                    ) : (
                      <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">
                        {rental.distance}
                      </span>
                    )}
                  </div>

                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      {rental.equipmentTitle}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Model: <strong>{rental.model}</strong> {rental.hp && `(${rental.hp})`}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-4 flex-1 space-y-3.5 text-xs">
                  {/* Rate Card */}
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">
                        Rental Rate
                      </span>
                      <span className="text-xl font-black text-blue-950 dark:text-blue-100">
                        ₹{rental.rate}
                      </span>
                      <span className="text-xs text-muted-foreground"> / {rental.rateUnit}</span>
                    </div>
                    <Badge className={rental.driverIncluded ? "bg-emerald-700 text-white text-[10px]" : "bg-muted text-foreground text-[10px]"}>
                      {rental.driverIncluded ? "✓ Driver Included" : "Self-Operated"}
                    </Badge>
                  </div>

                  {/* Owner & Location Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Listed by:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        {rental.ownerName}
                        {rental.isUserListing && (
                          <Badge className="bg-emerald-700 text-white text-[9px] h-4 px-1">You</Badge>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium text-foreground flex items-center gap-1 text-right">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        {rental.villageOrLocation}, {rental.district}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {rental.availability}
                      </span>
                    </div>
                    {rental.notes && (
                      <p className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/50 italic leading-relaxed">
                        &ldquo;{rental.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-2 border-t bg-muted/10 flex items-center gap-2 mt-auto">
                  {rental.isUserListing ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUserListing(rental.id)}
                      className="w-full text-xs h-9 font-semibold"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Remove My Listing
                    </Button>
                  ) : (
                    <>
                      <Button asChild variant="outline" className="w-1/2 text-xs h-9 font-semibold">
                        <a href={`tel:${rental.phone}`}>
                          <Phone className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                          Call Owner
                        </a>
                      </Button>
                      <Button 
                        onClick={() => handleOpenRentalBooking(rental)}
                        className="w-1/2 bg-blue-700 hover:bg-blue-800 text-white text-xs h-9 font-semibold"
                      >
                        Book Rental
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredRentals.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed rounded-2xl bg-muted/20 p-8 space-y-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto">
                <Wrench className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  No rental machinery currently listed for &ldquo;{equipmentQuery || selectedCategory}&rdquo; in &ldquo;{locationQuery || selectedState}&rdquo;
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Be the first farmer in your village/district to list your equipment for rent and start earning extra income!
                </p>
              </div>

              <Button
                onClick={() => setActiveTab("give-on-rent")}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9"
              >
                <PlusCircle className="mr-1.5 h-4 w-4" />
                List Your Equipment Now
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: GIVE YOUR EQUIPMENT ON RENT (FARMER RENTAL LISTING FORM)           */}
        {/* ========================================================================= */}
        <TabsContent value="give-on-rent" className="space-y-6">
          <Card className="border-2 border-emerald-500/30 shadow-xl bg-card overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600/15 via-emerald-500/10 to-transparent p-6 border-b">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider mb-1">
                <PlusCircle className="h-4 w-4 text-emerald-600" />
                Farmer-to-Farmer Rental Service (अपनी मशीन किराए पर देकर कमाई करें)
              </div>
              <CardTitle className="text-2xl md:text-3xl font-extrabold font-headline">
                List Your Farm Equipment for Rent
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed mt-1">
                Earn extra income from your tractor, rotavator, or power tiller when you are not using it. Connect directly with nearby farmers in your village and district without any middlemen commission.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleListEquipment} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* 1. Equipment Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      1. Equipment Category *
                    </label>
                    <select
                      value={newListing.equipmentType}
                      onChange={(e) => setNewListing({ ...newListing, equipmentType: e.target.value as any })}
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
                    >
                      {MACHINERY_CATEGORIES.filter((c) => c !== "All Machinery").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Equipment Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      2. Equipment Name / Title *
                    </label>
                    <Input
                      value={newListing.equipmentTitle}
                      onChange={(e) => setNewListing({ ...newListing, equipmentTitle: e.target.value })}
                      placeholder="e.g. Mahindra Yuvraj 215 Mini Tractor"
                      className="h-11 text-xs rounded-xl shadow-sm"
                      required
                    />
                  </div>

                  {/* 3. Brand & Model */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      3. Make / Model & Year
                    </label>
                    <Input
                      value={newListing.model}
                      onChange={(e) => setNewListing({ ...newListing, model: e.target.value })}
                      placeholder="e.g. Swaraj 724 XM / 2023"
                      className="h-11 text-xs rounded-xl shadow-sm"
                    />
                  </div>

                  {/* 4. Horsepower / Capacity */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      4. Horsepower (HP) / Size
                    </label>
                    <Input
                      value={newListing.hp}
                      onChange={(e) => setNewListing({ ...newListing, hp: e.target.value })}
                      placeholder="e.g. 18 HP / 5 Ft / 500 Liters"
                      className="h-11 text-xs rounded-xl shadow-sm"
                    />
                  </div>

                  {/* 5. Rental Price */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      5. Rental Rate (₹) & Frequency *
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={newListing.rate}
                        onChange={(e) => setNewListing({ ...newListing, rate: e.target.value })}
                        placeholder="e.g. 350"
                        className="h-11 text-xs flex-1 rounded-xl shadow-sm"
                        required
                      />
                      <select
                        value={newListing.rateUnit}
                        onChange={(e) => setNewListing({ ...newListing, rateUnit: e.target.value as any })}
                        className="h-11 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
                      >
                        <option value="hour">per Hour (प्रति घंटा)</option>
                        <option value="day">per Day (प्रति दिन)</option>
                        <option value="acre">per Acre (प्रति एकड़)</option>
                        <option value="month">per Month (प्रति माह)</option>
                      </select>
                    </div>
                  </div>

                  {/* 6. Driver Included */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      6. Driver / Operator Included?
                    </label>
                    <select
                      value={newListing.driverIncluded ? "yes" : "no"}
                      onChange={(e) => setNewListing({ ...newListing, driverIncluded: e.target.value === "yes" })}
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
                    >
                      <option value="yes">Yes, Operator / Driver Included (चालक सहित)</option>
                      <option value="no">No, Self-Drive / Without Driver (बिना चालक)</option>
                    </select>
                  </div>

                  {/* 7. State */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      7. State *
                    </label>
                    <select
                      value={newListing.state}
                      onChange={(e) => setNewListing({ ...newListing, state: e.target.value })}
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
                    >
                      {ALL_INDIAN_STATES_FILTER.filter((s) => s.code !== "all").map((st) => (
                        <option key={st.code} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 8. District / City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      8. District / City *
                    </label>
                    <Input
                      value={newListing.district}
                      onChange={(e) => setNewListing({ ...newListing, district: e.target.value })}
                      placeholder="e.g. Pune, Dehradun, Lucknow..."
                      className="h-11 text-xs rounded-xl shadow-sm"
                      required
                    />
                  </div>

                  {/* 9. Village / Location Landmark */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      9. Village / Tehsil Location Landmark *
                    </label>
                    <Input
                      value={newListing.villageOrLocation}
                      onChange={(e) => setNewListing({ ...newListing, villageOrLocation: e.target.value })}
                      placeholder="e.g. Sahaspur Village, Near Petrol Pump"
                      className="h-11 text-xs rounded-xl shadow-sm"
                      required
                    />
                  </div>

                  {/* 10. Owner Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      10. Owner / Farmer Name *
                    </label>
                    <Input
                      value={newListing.ownerName}
                      onChange={(e) => setNewListing({ ...newListing, ownerName: e.target.value })}
                      placeholder="Your full name"
                      className="h-11 text-xs rounded-xl shadow-sm"
                      required
                    />
                  </div>

                  {/* 11. Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      11. Mobile / WhatsApp Number *
                    </label>
                    <Input
                      value={newListing.phone}
                      onChange={(e) => setNewListing({ ...newListing, phone: e.target.value })}
                      placeholder="e.g. +91 9897123456"
                      className="h-11 text-xs rounded-xl shadow-sm"
                      required
                    />
                  </div>

                  {/* 12. Availability */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      12. Availability Status
                    </label>
                    <select
                      value={newListing.availability}
                      onChange={(e) => setNewListing({ ...newListing, availability: e.target.value })}
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
                    >
                      <option value="Available Today">Available Today (आज ही उपलब्ध)</option>
                      <option value="Available from Tomorrow">Available from Tomorrow (कल से)</option>
                      <option value="Available This Weekend">Available This Weekend</option>
                      <option value="On 1-day Advance Booking">On 1-day Advance Booking</option>
                    </select>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    13. Special Notes / Free Implements Included (Optional)
                  </label>
                  <Input
                    value={newListing.notes}
                    onChange={(e) => setNewListing({ ...newListing, notes: e.target.value })}
                    placeholder="e.g. Comes with 3-tyne cultivator and small hydraulic trolley. Available within 10 km radius."
                    className="h-11 text-xs rounded-xl shadow-sm"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between flex-wrap gap-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    ✓ Your listing will appear live immediately to all nearby farmers in your district.
                  </p>
                  <Button
                    type="submit"
                    className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg h-11 transition-all hover:scale-105"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Publish Equipment for Rent
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* INQUIRY MODAL FOR BUYING EQUIPMENT FROM STORE                             */}
      {/* ========================================================================= */}
      {inquiryStore && (
        <Dialog open={isInquiryModalOpen} onOpenChange={setIsInquiryModalOpen}>
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Store className="h-5 w-5 text-emerald-600" />
                Equipment Inquiry & Price Quote
              </DialogTitle>
              <DialogDescription className="text-xs">
                Request a formal price quote or book a test-drive demo with {inquiryStore.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl border space-y-1">
                <span className="font-bold text-foreground block">{inquiryProduct}</span>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-600" />
                  {inquiryStore.address}
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                  Direct Dealer Contact: {inquiryStore.phone}
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-foreground block">Your Name</label>
                <Input defaultValue={userProfile?.name || ""} placeholder="Farmer Name" className="h-9 text-xs" />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-foreground block">Mobile Number for Dealer Callback</label>
                <Input defaultValue={userProfile?.phone || ""} placeholder="+91 98XXXXXXXX" className="h-9 text-xs" />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-foreground block">Inquiry Type</label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs">
                  <option>Price Quote with Govt SMAM Subsidy</option>
                  <option>Book On-Farm Demo / Test Drive</option>
                  <option>Financing & Bank Loan Assistance</option>
                  <option>Immediate Delivery & Stock Status</option>
                </select>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsInquiryModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsInquiryModalOpen(false);
                  toast({
                    title: "✅ Inquiry Sent to Dealership!",
                    description: `${inquiryStore.name} representative will call you shortly with quote and subsidy details.`,
                  });
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
              >
                Submit Inquiry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* BOOKING MODAL FOR RENTING EQUIPMENT                                       */}
      {/* ========================================================================= */}
      {bookingRental && (
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                Book Rental Equipment
              </DialogTitle>
              <DialogDescription className="text-xs">
                Connect with the owner to rent {bookingRental.equipmentTitle}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground text-sm">{bookingRental.equipmentTitle}</span>
                  <span className="font-extrabold text-blue-900 dark:text-blue-200 text-base">₹{bookingRental.rate}/{bookingRental.rateUnit}</span>
                </div>
                <p className="text-muted-foreground">Owner: {bookingRental.ownerName} ({bookingRental.phone})</p>
                <p className="text-muted-foreground">Location: {bookingRental.villageOrLocation}, {bookingRental.district}</p>
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold">{bookingRental.driverIncluded ? "✓ Driver / Operator Included" : "Self-Operated"}</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">Required On Date</label>
                <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="h-9 text-xs" />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">Estimated Duration</label>
                <div className="flex gap-2">
                  <Input type="number" defaultValue="4" className="h-9 text-xs flex-1" />
                  <span className="self-center text-xs text-muted-foreground">{bookingRental.rateUnit}s</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">Your Village / Farm Address</label>
                <Input placeholder="e.g. Near Primary School, Vikas Nagar" className="h-9 text-xs" defaultValue={userProfile?.location || ""} />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsBookingModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsBookingModalOpen(false);
                  toast({
                    title: "✅ Rental Booking Request Sent!",
                    description: `Owner ${bookingRental.ownerName} has been notified. You can also call directly at ${bookingRental.phone}.`,
                  });
                }}
                className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold"
              >
                Confirm Rental Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
