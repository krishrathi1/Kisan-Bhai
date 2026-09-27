
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { recommendCrops, type RecommendCropsOutput } from '@/ai/flows/recommend-crops';
import { Bot, Leaf, Droplets, Sun, Sparkles, ArrowRight, Mic, Square, CheckCircle, CalendarDays, Wheat, Carrot, Grape, MapPin, TrendingUp, RefreshCw, Layers, Coins } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/contexts/language-context';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { LocationPicker, type LocationData } from '@/components/location-picker';
import {
  getSoilsForState,
  getSoilSelectLabel,
  type SupportedLanguage,
} from '@/lib/soil-data';
import { Badge } from '@/components/ui/badge';

const iconMap = {
  Leaf: <Leaf className="h-8 w-8 text-primary" />,
  Sprout: <Icons.sprout className="h-8 w-8 text-primary" />,
  Carrot: <Carrot className="h-8 w-8 text-primary" />,
  Wheat: <Wheat className="h-8 w-8 text-primary" />,
  Grape: <Grape className="h-8 w-8 text-primary" />,
};
type CropIcon = keyof typeof iconMap;

const RecommendCropsInputClientSchema = z.object({
  location: z.string().min(1),
  farmType: z.enum(['irrigated', 'rainfed']),
  landSize: z.string().min(1),
  soilType: z.string().optional(),
  waterSource: z.string().optional(),
  season: z.string().optional(),
  previousCrop: z.string().optional(),
  budget: z.string().optional(),
  cropPreference: z.string().optional(),
  language: z.string(),
  // Extended location fields
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

type RecommendationFormValues = z.infer<typeof RecommendCropsInputClientSchema>;

export function CropRecommenderClient() {
  const { t, language } = useTranslation();
  const { userProfile } = useAuth();
  const lang = language as SupportedLanguage;

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendCropsOutput | null>(null);
  const [recordingField, setRecordingField] = useState<keyof RecommendationFormValues | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const { handleSubmit, control, setValue, watch, formState: { errors } } = useForm<RecommendationFormValues>({
    resolver: zodResolver(RecommendCropsInputClientSchema),
    defaultValues: {
      location: '',
      farmType: 'irrigated',
      landSize: '',
      soilType: '',
      waterSource: '',
      season: 'kharif',
      previousCrop: '',
      budget: '',
      cropPreference: '',
      language: language,
    }
  });

  useEffect(() => {
    if (userProfile?.location) {
      setValue('location', userProfile.location);
    }
    setValue('language', language);
  }, [userProfile, setValue, language]);

  // ── Location-aware soil types ──────────────────────────────────────────────
  const currentState = selectedLocation?.state || null;
  const soils = getSoilsForState(currentState);

  // Reset soil type when state changes
  useEffect(() => {
    setValue('soilType', '');
  }, [currentState, setValue]);

  // ── Handle map location change ─────────────────────────────────────────────
  const handleLocationChange = (locationData: LocationData) => {
    setSelectedLocation(locationData);
    setValue('location', locationData.displayName);
    setValue('latitude', locationData.latitude);
    setValue('longitude', locationData.longitude);
    setValue('state', locationData.state || '');
    setValue('district', locationData.district || '');
    setValue('city', locationData.city || '');
    setValue('country', locationData.country || 'India');
  };

  // ── Voice input ────────────────────────────────────────────────────────────
  const handleMicClick = (field: keyof RecommendationFormValues) => {
    if (!SpeechRecognition) {
      toast({ title: t('toast.browserNotSupported'), description: t('toast.noVoiceSupport'), variant: "destructive" });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    const langMap: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN', kn: 'kn-IN', bn: 'bn-IN', bho: 'bho-IN' };
    recognition.lang = langMap[language] || 'en-IN';
    recognition.onstart = () => setRecordingField(field);
    recognition.onresult = (event: any) => setValue(field, event.results[0][0].transcript);
    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        toast({ title: t('toast.noSpeechDetected'), description: t('toast.tryAgain'), variant: "destructive" });
      } else {
        toast({ title: t('toast.voiceError'), description: event.error, variant: "destructive" });
      }
    };
    recognition.onend = () => setRecordingField(null);
    recognition.start();
  };

  const onSubmit = async (data: RecommendationFormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const recommendationResult = await recommendCrops({
        ...data,
        language: language, // always use current selected language
      });
      setResult(recommendationResult);
    } catch (error) {
      console.error(error);
      toast({
        title: t('toast.recommendationFailed'),
        description: t('toast.errorGeneratingRecommendation'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const waterSources = ["borewell", "canal", "rain-only", "tank", "river"];
  const seasons = ["kharif", "rabi", "zaid"];

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <Card className="lg:col-span-5 xl:col-span-4 shadow-sm border border-border/80">
        <CardHeader>
          <CardTitle className="font-headline font-bold text-xl">{t('cropRecommender.client.formTitle')}</CardTitle>
          <CardDescription className="text-xs leading-relaxed">{t('cropRecommender.client.formDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* ── STEP 1: Location Picker ─────────────────────────────────── */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {t('cropRecommender.client.locationLabel') || t('profile.location')}
              </Label>
              <LocationPicker
                onLocationChange={handleLocationChange}
                value={watch('location')}
              />
              {errors.location && (
                <p className="text-xs text-destructive">{t('cropRecommender.client.locationRequired') || 'Location is required.'}</p>
              )}
            </div>

            {/* ── STEP 2: Farm Type ─────────────────────────────────────────── */}
            <div>
              <Label className="text-sm font-medium">{t('cropRecommender.client.farmType')}</Label>
              <Controller
                name="farmType"
                control={control}
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-2 mt-2">
                    <Label
                      htmlFor="irrigated"
                      className="flex items-center gap-2 p-2.5 sm:p-3 border border-border/80 rounded-lg has-[:checked]:bg-secondary has-[:checked]:border-primary/60 cursor-pointer min-w-0 transition-all hover:bg-muted/50"
                    >
                      <RadioGroupItem value="irrigated" id="irrigated" className="shrink-0" />
                      <Droplets className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-xs sm:text-sm font-medium truncate">{t('cropRecommender.client.irrigated')}</span>
                    </Label>
                    <Label
                      htmlFor="rainfed"
                      className="flex items-center gap-2 p-2.5 sm:p-3 border border-border/80 rounded-lg has-[:checked]:bg-secondary has-[:checked]:border-primary/60 cursor-pointer min-w-0 transition-all hover:bg-muted/50"
                    >
                      <RadioGroupItem value="rainfed" id="rainfed" className="shrink-0" />
                      <Sun className="h-4 w-4 text-orange-500 shrink-0" />
                      <span className="text-xs sm:text-sm font-medium truncate">{t('cropRecommender.client.rainfed')}</span>
                    </Label>
                  </RadioGroup>
                )}
              />
            </div>

            {/* ── STEP 3: Land Size ─────────────────────────────────────────── */}
            <div>
              <Label htmlFor="landSize">{t('cropRecommender.client.landSize')}</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Controller
                  name="landSize"
                  control={control}
                  render={({ field }) => (
                    <Input id="landSize" {...field} placeholder={t('cropRecommender.client.landSizePlaceholder') || 'e.g., 2 acres'} className="min-w-0 flex-1" />
                  )}
                />
                <Button type="button" variant={recordingField === 'landSize' ? "destructive" : "outline"} size="icon" onClick={() => handleMicClick('landSize')} disabled={!!recordingField} className="shrink-0">
                  {recordingField === 'landSize' ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              {errors.landSize && <p className="text-xs text-destructive mt-1">{t('cropRecommender.client.landSizeRequired') || 'Land size is required.'}</p>}
            </div>

            {/* ── STEP 4: Soil Type (Location-Aware) ───────────────────────── */}
            <div>
              <Label htmlFor="soilType" className="flex items-center justify-between">
                <span>{t('cropRecommender.client.soilType')}</span>
                {currentState && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {currentState}
                  </Badge>
                )}
              </Label>
              {currentState && (
                <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
                  {t('cropRecommender.client.soilsForState') || 'Showing soils documented for'} {currentState}
                </p>
              )}
              <Controller name="soilType" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('cropRecommender.client.selectSoilType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {soils.map(soil => (
                      <SelectItem key={soil.key} value={soil.key}>
                        {getSoilSelectLabel(soil, lang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>

            {/* ── STEP 5: Water Source ──────────────────────────────────────── */}
            <div>
              <Label htmlFor="waterSource">{t('cropRecommender.client.waterSource')}</Label>
              <Controller name="waterSource" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder={t('cropRecommender.client.selectWaterSource')} /></SelectTrigger>
                  <SelectContent>
                    {waterSources.map(type => <SelectItem key={type} value={type}>{t(`cropRecommender.client.waterSources.${type}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>

            {/* ── STEP 6: Season ────────────────────────────────────────────── */}
            <div>
              <Label htmlFor="season">{t('cropRecommender.client.currentSeason')}</Label>
              <Controller name="season" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder={t('cropRecommender.client.selectSeason') || 'Select a season'} /></SelectTrigger>
                  <SelectContent>
                    {seasons.map(type => <SelectItem key={type} value={type}>{t(`cropRecommender.client.seasons.${type}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>

            {/* ── STEP 7: Previous Crop ──────────────────────────────────────── */}
            <div>
              <Label htmlFor="previousCrop">{t('cropRecommender.client.previousCrop')}</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Controller
                  name="previousCrop"
                  control={control}
                  render={({ field }) => (
                    <Input id="previousCrop" {...field} placeholder={t('cropRecommender.client.previousCropPlaceholder') || 'e.g., Wheat'} />
                  )}
                />
                <Button type="button" variant={recordingField === 'previousCrop' ? "destructive" : "outline"} size="icon" onClick={() => handleMicClick('previousCrop')} disabled={!!recordingField}>
                  {recordingField === 'previousCrop' ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* ── STEP 8: Budget ────────────────────────────────────────────── */}
            <div>
              <Label htmlFor="budget">{t('cropRecommender.client.budget')}</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Controller
                  name="budget"
                  control={control}
                  render={({ field }) => (
                    <Input id="budget" {...field} placeholder={t('cropRecommender.client.budgetPlaceholder') || 'e.g., 10,000 INR'} />
                  )}
                />
                <Button type="button" variant={recordingField === 'budget' ? "destructive" : "outline"} size="icon" onClick={() => handleMicClick('budget')} disabled={!!recordingField}>
                  {recordingField === 'budget' ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* ── STEP 9: Crop Preference ───────────────────────────────────── */}
            <div>
              <Label htmlFor="cropPreference">{t('cropRecommender.client.cropPreference')}</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Controller
                  name="cropPreference"
                  control={control}
                  render={({ field }) => (
                    <Input id="cropPreference" {...field} placeholder={t('cropRecommender.client.cropPreferencePlaceholder')} />
                  )}
                />
                <Button type="button" variant={recordingField === 'cropPreference' ? "destructive" : "outline"} size="icon" onClick={() => handleMicClick('cropPreference')} disabled={!!recordingField}>
                  {recordingField === 'cropPreference' ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full !mt-6">
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? t('cropRecommender.client.gettingRecommendations') : t('cropRecommender.client.getRecommendations')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Results Panel ──────────────────────────────────────────────────── */}
      <div className="lg:col-span-7 xl:col-span-8">
        <h2 className="text-2xl font-bold mb-4 font-headline">{t('cropRecommender.client.resultsTitle')}</h2>

        {result?.recommendations && !isLoading && (
          <div className="space-y-6">
            {/* Field Assessment Executive Summary */}
            {result.fieldSummary && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                    Field Suitability Analysis (खेत विश्लेषण)
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-900/90 dark:text-emerald-300/90 leading-relaxed">
                    {result.fieldSummary}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {result.recommendations.map((rec, index) => (
                <Card key={index} className="overflow-hidden border border-border/80 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-border/70 shadow-xs">
                          {iconMap[rec.icon as CropIcon] || iconMap.Leaf}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-lg font-bold font-headline">{rec.cropName}</CardTitle>
                            {rec.variety && (
                              <Badge variant="secondary" className="text-xs font-semibold">
                                {rec.variety}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-2 mt-1 text-xs">
                            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Sowing Window: <strong>{rec.plantingDates}</strong></span>
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="w-fit bg-emerald-700 hover:bg-emerald-800 text-white text-xs">
                        Top Pick #{index + 1}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4 text-xs sm:text-sm">
                    {/* Why this crop matches your filled details */}
                    <div className="p-3 bg-muted/30 rounded-xl border border-border/60">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        Agronomic Match for Your Farm
                      </h4>
                      <p className="text-foreground leading-relaxed">
                        {rec.reasoning}
                      </p>
                    </div>

                    {/* Key Detail Grids tailored to inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rec.yieldEstimate && (
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> Expected Yield & Revenue
                          </span>
                          <p className="text-xs text-foreground/90 font-medium">
                            {rec.yieldEstimate}
                          </p>
                        </div>
                      )}

                      {rec.soilSuitability && (
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 space-y-1">
                          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 uppercase">
                            <Layers className="h-3.5 w-3.5 text-amber-600" /> Soil Compatibility
                          </span>
                          <p className="text-xs text-foreground/90">
                            {rec.soilSuitability}
                          </p>
                        </div>
                      )}

                      {rec.irrigationPlan && (
                        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-1">
                          <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 uppercase">
                            <Droplets className="h-3.5 w-3.5 text-blue-600" /> Irrigation & Moisture
                          </span>
                          <p className="text-xs text-foreground/90">
                            {rec.irrigationPlan}
                          </p>
                        </div>
                      )}

                      {rec.cropRotationBenefit && (
                        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 space-y-1">
                          <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5 uppercase">
                            <RefreshCw className="h-3.5 w-3.5 text-purple-600" /> Crop Rotation Impact
                          </span>
                          <p className="text-xs text-foreground/90">
                            {rec.cropRotationBenefit}
                          </p>
                        </div>
                      )}

                      {rec.budgetFeasibility && (
                        <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/15 space-y-1 md:col-span-2">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5 uppercase">
                            <Coins className="h-3.5 w-3.5 text-slate-600" /> Budget & Input Feasibility
                          </span>
                          <p className="text-xs text-foreground/90">
                            {rec.budgetFeasibility}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Key Benefits List */}
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        {t('cropRecommender.client.keyBenefits')}
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {rec.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 bg-muted/20 p-2 rounded-lg border border-border/40">
                            <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                            <span className="leading-snug">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-muted/10 border-t py-3 px-5 flex justify-end">
                    <Button asChild size="sm" variant="outline" className="text-xs">
                      <Link href={`/dashboard/learn?q=${encodeURIComponent(rec.cropName)}`}>
                        {t('cropRecommender.client.learnMore')} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isLoading && <LoadingSkeleton />}

        {!result && !isLoading && (
          <Card className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[50vh]">
            <CardContent className='p-0'>
              <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">{t('cropRecommender.client.resultsPlaceholder')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full" />
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-start gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className='flex-1 space-y-2'>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardHeader>
          <CardContent className="flex-grow space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
);
