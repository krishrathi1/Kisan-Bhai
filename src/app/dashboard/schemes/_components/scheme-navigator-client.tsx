
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { navigateGovernmentSchemes, type NavigateGovernmentSchemesOutput } from '@/ai/flows/navigate-government-schemes';
import { Bot, CheckCircle, ExternalLink, Mic, Target, Search, Square } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useTranslation } from '@/contexts/language-context';

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));


export function SchemeNavigatorClient() {
  const { t, language } = useTranslation();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<NavigateGovernmentSchemesOutput | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      toast({
        title: t('toast.emptyQuery'),
        description: t('toast.enterSchemeQuestion'),
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const schemeResult = await navigateGovernmentSchemes({ query, language });
      setResult(schemeResult);
    } catch (error) {
      console.error(error);
      toast({
        title: t('toast.searchFailed'),
        description: t('toast.errorFetchingScheme'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMicClick = () => {
    if (!SpeechRecognition) {
      toast({
        title: t('toast.browserNotSupported'),
        description: t('toast.noVoiceSupport'),
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Set language for speech recognition
    const langMap: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN', kn: 'kn-IN', bn: 'bn-IN', bho: 'bho-IN' };
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.onerror = (event: any) => {
       if (event.error === 'no-speech') {
        toast({
            title: t('toast.noSpeechDetected'),
            description: t('toast.tryAgain'),
            variant: "destructive",
        });
      } else {
        toast({
            title: t('toast.voiceError'),
            description: event.error,
            variant: "destructive",
        });
      }
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6 text-primary"/>
            {t('schemes.client.title')}
        </CardTitle>
        <CardDescription>{t('schemes.client.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <Textarea
            placeholder={t('schemes.client.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isLoading || isRecording} className="flex-1">
              {isLoading ? t('schemes.client.searching') : t('schemes.client.findScheme')}
            </Button>
            <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={handleMicClick} disabled={isLoading}>
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="sr-only">{isRecording ? t('schemes.client.stopRecording') : t('schemes.client.useVoice')}</span>
            </Button>
          </div>
        </form>

        {isLoading && <LoadingSkeleton />}
        
        {result && !isLoading && (
            <div className="border-t pt-4 space-y-3">
                <div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 mb-1">
                    AI Recommended Scheme
                  </Badge>
                  <h3 className="font-bold text-sm text-foreground">{result.schemeName}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.answer}</p>
                <Alert className="bg-emerald-500/5 border-emerald-500/20 py-2.5">
                    <Target className="h-4 w-4 text-emerald-600" />
                    <AlertTitle className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{t('schemes.client.eligibility')}</AlertTitle>
                    <AlertDescription className="text-xs text-foreground mt-0.5">{result.eligibility}</AlertDescription>
                </Alert>
                <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1.5 border border-border/60">
                  <span className="font-bold text-foreground block">📄 In-Page Application Steps:</span>
                  <p className="text-[11px] text-muted-foreground">1. Keep your Aadhaar, Land Record (Khatauni/7-12), and Bank Passbook ready.</p>
                  <p className="text-[11px] text-muted-foreground">2. Visit your local Common Service Centre (CSC) or Gram Panchayat office.</p>
                  <p className="text-[11px] text-muted-foreground">3. Submit Aadhaar eKYC for direct bank account seeding.</p>
                </div>
                <Button 
                  onClick={() => {
                    toast({
                      title: "✅ Scheme Saved to Profile",
                      description: `${result.schemeName} guidance saved. Follow the in-page checklist to apply!`,
                    });
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9"
                >
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                  Save Scheme Checklist
                </Button>
            </div>
        )}

        {!result && !isLoading && (
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <Bot className="mx-auto h-8 w-8 mb-2" />
                <p>{t('schemes.client.resultPlaceholder')}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

const LoadingSkeleton = () => (
    <div className="border-t pt-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
    </div>
);
