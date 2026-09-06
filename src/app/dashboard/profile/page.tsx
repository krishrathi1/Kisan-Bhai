"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Upload, Link2, ExternalLink, ShieldCheck, Award, Phone, Lock, Copy, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useTranslation } from "@/contexts/language-context";
import { translateText } from "@/ai/flows/translate-text";
import { FarmerIdCard } from "@/components/farmer-id-card";
import { fetchUserCertificates, type FasalCertificate } from "@/lib/fasal-db";

const districts = [
    { value: "Port Blair, Andaman & Nicobar", label: "Port Blair, Andaman & Nicobar" },
    { value: "Visakhapatnam, Andhra Pradesh", label: "Visakhapatnam, Andhra Pradesh" },
    { value: "Itanagar, Arunachal Pradesh", label: "Itanagar, Arunachal Pradesh" },
    { value: "Guwahati, Assam", label: "Guwahati, Assam" },
    { value: "Patna, Bihar", label: "Patna, Bihar" },
    { value: "Chandigarh, Chandigarh", label: "Chandigarh, Chandigarh" },
    { value: "Raipur, Chhattisgarh", label: "Raipur, Chhattisgarh" },
    { value: "Silvassa, Dadra & Nagar Haveli", label: "Silvassa, Dadra & Nagar Haveli" },
    { value: "Daman, Daman & Diu", label: "Daman, Daman & Diu" },
    { value: "New Delhi, Delhi", label: "New Delhi, Delhi" },
    { value: "Panaji, Goa", label: "Panaji, Goa" },
    { value: "Ahmedabad, Gujarat", label: "Ahmedabad, Gujarat" },
    { value: "Surat, Gujarat", label: "Surat, Gujarat" },
    { value: "Vadodara, Gujarat", label: "Vadodara, Gujarat" },
    { value: "Faridabad, Haryana", label: "Faridabad, Haryana" },
    { value: "Shimla, Himachal Pradesh", label: "Shimla, Himachal Pradesh" },
    { value: "Srinagar, Jammu & Kashmir", label: "Srinagar, Jammu & Kashmir" },
    { value: "Ranchi, Jharkhand", label: "Ranchi, Jharkhand" },
    { value: "Bengaluru, Karnataka", label: "Bengaluru, Karnataka" },
    { value: "Mysuru, Karnataka", label: "Mysuru, Karnataka" },
    { value: "Thiruvananthapuram, Kerala", label: "Thiruvananthapuram, Kerala" },
    { value: "Kavaratti, Lakshadweep", label: "Kavaratti, Lakshadweep" },
    { value: "Bhopal, Madhya Pradesh", label: "Bhopal, Madhya Pradesh" },
    { value: "Indore, Madhya Pradesh", label: "Indore, Madhya Pradesh" },
    { value: "Pune, Maharashtra", label: "Pune, Maharashtra" },
    { value: "Mumbai, Maharashtra", label: "Mumbai, Maharashtra" },
    { value: "Nagpur, Maharashtra", label: "Nagpur, Maharashtra" },
    { value: "Nashik, Maharashtra", label: "Nashik, Maharashtra" },
    { value: "Aurangabad, Maharashtra", label: "Aurangabad, Maharashtra" },
    { value: "Imphal, Manipur", label: "Imphal, Manipur" },
    { value: "Shillong, Meghalaya", label: "Shillong, Meghalaya" },
    { value: "Aizawl, Mizoram", label: "Aizawl, Mizoram" },
    { value: "Kohima, Nagaland", label: "Kohima, Nagaland" },
    { value: "Bhubaneswar, Odisha", label: "Bhubaneswar, Odisha" },
    { value: "Puducherry, Puducherry", label: "Puducherry, Puducherry" },
    { value: "Ludhiana, Punjab", label: "Ludhiana, Punjab" },
    { value: "Amritsar, Punjab", label: "Amritsar, Punjab" },
    { value: "Jaipur, Rajasthan", label: "Jaipur, Rajasthan" },
    { value: "Jodhpur, Rajasthan", label: "Jodhpur, Rajasthan" },
    { value: "Gangtok, Sikkim", label: "Gangtok, Sikkim" },
    { value: "Chennai, Tamil Nadu", label: "Chennai, Tamil Nadu" },
    { value: "Coimbatore, Tamil Nadu", label: "Coimbatore, Tamil Nadu" },
    { value: "Hyderabad, Telangana", label: "Hyderabad, Telangana" },
    { value: "Agartala, Tripura", label: "Agartala, Tripura" },
    { value: "Lucknow, Uttar Pradesh", label: "Lucknow, Uttar Pradesh" },
    { value: "Kanpur, Uttar Pradesh", label: "Kanpur, Uttar Pradesh" },
    { value: "Dehradun, Uttarakhand", label: "Dehradun, Uttarakhand" },
    { value: "Kolkata, West Bengal", label: "Kolkata, West Bengal" },
];

export default function ProfilePage() {
  const { user, userProfile, updateUserProfile, uploadProfileImage, loading, sessionToken } = useAuth();
  const { t, language } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Canonical, untranslated state
  const [canonicalDisplayName, setCanonicalDisplayName] = useState("Harsh Uppal");
  const [canonicalCrops, setCanonicalCrops] = useState("Wheat, Mustard, Paddy");
  const [farmerId, setFarmerId] = useState("BM-KSN-2026-7842");

  // Translated state for display
  const [displayDisplayName, setDisplayDisplayName] = useState("Harsh Uppal");
  const [displayCrops, setDisplayCrops] = useState("Wheat, Mustard, Paddy");
  
  const [email, setEmail] = useState("harshuppal300@gmail.com");
  const [phone, setPhone] = useState("8905905953");
  const [location, setLocation] = useState("Haryana, India");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [certificates, setCertificates] = useState<FasalCertificate[]>([]);

  useEffect(() => {
    if (userProfile) {
      const name = userProfile.displayName || "Harsh Uppal";
      const crops = userProfile.crops || "Wheat, Mustard, Paddy";
      const fid = userProfile.farmerId || "BM-KSN-2026-7842";
      const userPhone = userProfile.phone || "8905905953";

      setCanonicalDisplayName(name);
      setCanonicalCrops(crops);
      setDisplayDisplayName(name);
      setDisplayCrops(crops);
      setFarmerId(fid);
      setEmail(userProfile.email || user?.email || "harshuppal300@gmail.com");
      setPhone(userPhone);
      setLocation(userProfile.location || "Haryana, India");
    } else if (user) {
      setEmail(user.email || "harshuppal300@gmail.com");
    }

    // Fetch verified certificates for profile
    fetchUserCertificates(sessionToken, user?.id || "demo-farmer-001")
      .then((list) => setCertificates(list))
      .catch((err) => console.warn("Failed to load certificates for profile", err));
  }, [user, userProfile, sessionToken]);

  // Handle translation
  useEffect(() => {
    const translateFields = async () => {
      setIsTranslating(true);
      if (language === "en") {
        setDisplayDisplayName(canonicalDisplayName);
        setDisplayCrops(canonicalCrops);
      } else {
        const [translatedName, translatedCrops] = await Promise.all([
          canonicalDisplayName ? translateText({ text: canonicalDisplayName, targetLanguage: language }) : Promise.resolve({ translatedText: "" }),
          canonicalCrops ? translateText({ text: canonicalCrops, targetLanguage: language }) : Promise.resolve({ translatedText: "" }),
        ]);
        setDisplayDisplayName(translatedName.translatedText || canonicalDisplayName);
        setDisplayCrops(translatedCrops.translatedText || canonicalCrops);
      }
      setIsTranslating(false);
    };

    if ((userProfile?.language || "en") !== language && canonicalDisplayName) {
      translateFields();
    } else {
      setDisplayDisplayName(canonicalDisplayName);
      setDisplayCrops(canonicalCrops);
    }
  }, [language, canonicalDisplayName, canonicalCrops, userProfile?.language]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "HU";
    const names = name.split(" ");
    if (names.length > 1) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const [copiedId, setCopiedId] = useState(false);

  const handleCopyFarmerId = async () => {
    try {
      await navigator.clipboard.writeText(farmerId);
      setCopiedId(true);
      toast({
        title: "Unique Kisan ID Copied",
        description: `${farmerId} copied to clipboard.`,
      });
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Please copy the ID manually.",
        variant: "destructive",
      });
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName: canonicalDisplayName,
        email,
        phone,
        location,
        crops: canonicalCrops,
        farmerId,
      });
      toast({
        title: t("toast.profileUpdated") || "Profile Updated",
        description: t("toast.profileUpdatedDesc") || "Your details and Kisan ID have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to update profile", error);
      toast({
        title: t("toast.updateFailed") || "Update Failed",
        description: t("toast.updateFailedDesc") || "Could not save profile changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        await uploadProfileImage(file);
        toast({
          title: t("toast.photoUpdated") || "Photo Updated",
          description: t("toast.photoUpdatedDesc") || "Your profile image has been updated.",
        });
      } catch (error) {
        // Handled in useAuth
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayDisplayName(e.target.value);
    setCanonicalDisplayName(e.target.value);
  };

  const handleCropsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayCrops(e.target.value);
    setCanonicalCrops(e.target.value);
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 font-headline flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            {t("profile.title") || "Farmer Profile & Digital ID"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("profile.description") || "Manage your digital identity, personal details, and verified farming credentials."}
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("profile.backToDashboard") || "Back to Dashboard"}
          </Link>
        </Button>
      </div>

      {/* Main Grid: Digital ID Card (Left) & Profile Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Digital ID Card */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-primary/20 bg-gradient-to-b from-card to-muted/20 shadow-xl overflow-hidden">
            <CardHeader className="pb-3 text-center">
              <CardTitle className="text-lg font-headline flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Kisan Digital Identity Card
              </CardTitle>
              <CardDescription className="text-xs">
                Your verified digital identity inside the BeejMantra ecosystem.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <FarmerIdCard
                userProfile={{
                  ...userProfile,
                  uid: userProfile?.uid || user?.id || "demo-farmer-001",
                  photoURL: userProfile?.photoURL ?? null,
                  email,
                  phone,
                  displayName: displayDisplayName,
                  location,
                  crops: displayCrops,
                  farmerId,
                }}
              />
            </CardContent>
          </Card>

          {/* Verified Certificates Badge */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" />
                  My Fasal Certificates ({certificates.length})
                </span>
                <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-primary">
                  <Link href="/dashboard/fasal-certificate">
                    + New
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {certificates.length > 0 ? (
                certificates.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-border/70 bg-muted/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-foreground">🌾 {c.crop} ({c.quantity})</p>
                      <p className="text-muted-foreground font-mono text-[11px]">{c.id}</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="h-7 text-[11px] px-2.5">
                      <Link href={`/verify/${c.id}`} target="_blank">
                        Verify <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No crop certificates generated yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-7">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t("profile.cardTitle") || "Profile Information"}</CardTitle>
              <CardDescription>
                {t("profile.cardDescription") || "Update your contact details, district, and crop preferences."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Avatar */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-muted/30 border border-border/50">
                <Avatar className="h-20 w-20 border-2 border-primary shadow-md">
                  <AvatarImage
                    src={userProfile?.photoURL || "/desi-farmer-hero.jpg"}
                    alt={canonicalDisplayName}
                  />
                  <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">
                    {getInitials(canonicalDisplayName)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2 text-center sm:text-left">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="rounded-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? t("profile.uploading") || "Uploading..." : t("profile.changePhoto") || "Change Photo"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    Recommended: Square JPG, PNG or WebP under 2MB.
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Farmer Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">{t("profile.fullName") || "Full Name"}</Label>
                  <Input
                    id="name"
                    value={displayDisplayName}
                    onChange={handleNameChange}
                    className="rounded-xl"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t("profile.email") || "Email Address"}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Phone / Mobile Number</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 8905905953"
                      className="rounded-xl pl-10 font-mono font-semibold"
                    />
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Unique Kisan ID - Official Immutable Identity */}
                <div className="space-y-2.5 md:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/5 to-emerald-500/10 border-2 border-emerald-500/30 shadow-xs relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <Label htmlFor="farmerId" className="text-sm font-bold text-foreground flex items-center gap-1.5 cursor-default">
                        Unique Kisan ID
                        <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30">
                          Permanent Record
                        </span>
                      </Label>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      <Lock className="w-3 h-3" />
                      <span>Non-Editable</span>
                    </div>
                  </div>

                  {/* Tamper-Proof Box */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-inner">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600/15 dark:bg-emerald-400/15 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono font-black text-base sm:text-lg tracking-wider text-foreground select-all">
                          {farmerId}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Cryptographically verified farmer registration ID
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyFarmerId}
                      className="rounded-lg h-8 px-3 text-xs font-semibold shrink-0 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copy ID
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                    <span>🔒</span>
                    <span><strong>Government & Blockchain Linked:</strong> This unique Kisan ID is permanently anchored to your digital identity and cannot be edited or transferred.</span>
                  </p>
                </div>

                {/* Location */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">{t("profile.location") || "District & State"}</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location" className="rounded-xl">
                      <SelectValue placeholder={t("profile.selectDistrict") || "Select District"} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district.value} value={district.value}>
                          {district.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Crops */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="crops">{t("profile.myCrops") || "My Primary Crops"}</Label>
                  <Input
                    id="crops"
                    value={displayCrops}
                    onChange={handleCropsChange}
                    placeholder="e.g. Wheat, Mustard, Paddy, Cotton"
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("profile.myCropsDescription") || "Used to customize AI recommendations, mandi prices, and weather advisories."}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving || isUploading || isTranslating}
                  className="rounded-full px-7 py-5 font-bold shadow-md"
                >
                  {isSaving ? t("profile.saving") || "Saving..." : t("profile.saveChanges") || "Save Changes & Update ID"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

const ProfileSkeleton = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <Skeleton className="h-[420px] w-full rounded-3xl" />
        </div>
        <div className="lg:col-span-7">
          <Skeleton className="h-[420px] w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
};
