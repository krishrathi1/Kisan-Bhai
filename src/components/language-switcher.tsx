"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation, Language } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { Languages, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const languages: { code: Language; name: string; native: string }[] = [
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी' },
  { code: 'en', name: 'English', native: 'English' },
];

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  const { updateUserProfile } = useAuth();

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);

    if (updateUserProfile) {
      updateUserProfile({ language: langCode }).catch(() => {});
    }

    const selected = languages.find((l) => l.code === langCode);
    toast({
      title: t('landing.languageStrip.toastTitle', { name: selected?.native || langCode }),
      description: t('landing.languageStrip.toastDesc', { name: selected?.name || langCode }),
    });
  };

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20 shadow-sm transition-all"
        >
          <Languages className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs uppercase font-bold tracking-wider">{currentLangObj.code}</span>
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-card border border-border shadow-xl rounded-xl p-1.5 min-w-[180px] z-50 animate-in fade-in-80"
      >
        <div className="space-y-0.5">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  isSelected 
                    ? "bg-primary text-primary-foreground font-bold shadow-sm" 
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{lang.native}</span>
                  <span className={`text-[10px] ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {lang.name}
                  </span>
                </div>
                {isSelected && <Check className="h-4 w-4 shrink-0 stroke-[3]" />}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
