"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Mic, Volume2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/language-context";
import { annapurnaChat } from "@/ai/flows/annapurna-chat-flow";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const langVoiceMap: Record<string, string> = {
  hi: "hi-IN",
  pa: "pa-IN",
  kn: "kn-IN",
  bn: "bn-IN",
  bho: "hi-IN",
  en: "en-IN",
};

export function VoiceModal({ isOpen, onClose }: VoiceModalProps) {
  const { t, language } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const getSample = (key: string, fallbackEn: string, fallbackHi: string, fallbackPa: string) => {
    const val = t(`landing.voiceModal.${key}`);
    if (val && !val.startsWith("landing.voiceModal.")) return val;
    if (language === "hi") return fallbackHi;
    if (language === "pa") return fallbackPa;
    return fallbackEn;
  };

  const sampleQueries = [
    getSample(
      "sample1",
      "🌾 What is the current market price of Wheat in my area?",
      "🌾 मेरे क्षेत्र में आज गेहूं का ताजा मंडी भाव क्या है?",
      "🌾 ਮੇਰੇ ਇਲਾਕੇ ਵਿੱਚ ਅੱਜ ਕਣਕ ਦਾ ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?"
    ),
    getSample(
      "sample2",
      "🐛 How do I treat yellow leaf spots on my paddy crop?",
      "🐛 धान के पत्तों पर पीले धब्बों का क्या इलाज है?",
      "🐛 ਝੋਨੇ ਦੇ ਪੱਤਿਆਂ 'ਤੇ ਪੀਲੇ ਧੱਬਿਆਂ ਦਾ ਕੀ ਇਲਾਜ ਹੈ?"
    ),
    getSample(
      "sample3",
      "🏛️ Am I eligible for PM-Kisan 6,000 yearly scheme?",
      "🏛️ क्या मैं पीएम-किसान योजना के लिए पात्र हूँ?",
      "🏛️ ਕੀ ਮੈਂ ਪੀਐਮ-ਕਿਸਾਨ ਯੋਜਨਾ ਲਈ ਯੋਗ ਹਾਂ?"
    ),
    getSample(
      "sample4",
      "🌦️ Will it rain in the next 3 days for spraying pesticide?",
      "🌦️ क्या अगले 3 दिनों में बारिश होने की संभावना है?",
      "🌦️ ਕੀ ਅਗਲੇ 3 ਦਿਨਾਂ ਵਿੱਚ ਮੀਂਹ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ?"
    ),
  ];

  const activeVoiceLang = langVoiceMap[language] || "en-IN";

  const handleStartListening = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = activeVoiceLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
        setResponse(null);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        processQuery(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      // Fallback
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        processQuery(sampleQueries[0]);
      }, 1500);
    }
  };

  const processQuery = async (query: string) => {
    setTranscript(query);
    setIsProcessing(true);
    try {
      const output = await annapurnaChat({ query, language });
      const reply = output.response || t("landing.chatCard.aiMessage");
      setResponse(reply);
      speakResponse(reply);
    } catch {
      const fallback = t("landing.chatCard.aiMessage");
      setResponse(fallback);
      speakResponse(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = activeVoiceLang;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsListening(false);
      setTranscript("");
      setResponse(null);
      setIsSpeaking(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-3xl bg-[#FAF5E8] border-2 border-[#D8CABA] shadow-2xl text-[#281E15]">
        
        {/* Header */}
        <div className="bg-[#1A4A28] text-white p-5 flex items-center justify-between border-b border-[#12361D]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#C99A3A] shadow-xs shrink-0 relative">
              <Image
                src="/annapurna-avatar.jpg"
                alt="Annapurna AI"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <DialogTitle className="font-headline font-bold text-base text-[#FAF5E8]">
                {t("landing.voiceModal.title")}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#A7F3D0] font-medium">
                {t("landing.voiceModal.subtitle")}
              </DialogDescription>
            </div>
          </div>
          
          <Sparkles className="h-5 w-5 text-[#FDE047]" />
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-[#FBF7EE]">
          
          {/* Big Microphone Tap Target */}
          <div className="flex flex-col items-center justify-center py-3 space-y-2.5">
            <button
              onClick={handleStartListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer ${
                isListening
                  ? "bg-[#B85C38] text-white ring-8 ring-[#B85C38]/20 animate-pulse"
                  : "bg-[#245B35] hover:bg-[#1A4A28] text-white hover:scale-105"
              }`}
              title="Click to speak"
              aria-label="Start Voice Recording"
            >
              <Mic className="h-8 w-8 stroke-[2.5]" />
            </button>
            <p className="text-xs sm:text-sm font-bold text-[#281E15]">
              {isListening ? t("landing.voiceModal.listening") : t("landing.voiceModal.tapMic")}
            </p>
          </div>

          {/* Transcript / Result Box */}
          {(transcript || response) && (
            <div className="space-y-2.5 p-4 rounded-2xl bg-[#FFFFFF] border border-[#D8CABA] shadow-xs">
              {transcript && (
                <div className="text-xs sm:text-sm font-medium text-[#281E15]">
                  <span className="font-bold text-[#245B35]">{t("landing.voiceModal.youAsked")}</span> &quot;{transcript}&quot;
                </div>
              )}
              {response && (
                <div className="text-xs sm:text-sm text-[#3F2918] pt-2 border-t border-[#D8CABA]">
                  <div className="flex items-center gap-1.5 font-bold text-[#245B35] mb-1">
                    <Volume2 className={`h-4 w-4 ${isSpeaking ? "animate-pulse" : ""}`} />
                    <span>{t("landing.voiceModal.annapurnaReply")}</span>
                  </div>
                  <p className="leading-relaxed">{response}</p>
                </div>
              )}
            </div>
          )}

          {/* Suggested Prompts */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#756653] uppercase tracking-wider">
              {t("landing.voiceModal.tryAsking")}
            </span>
            <div className="space-y-1.5">
              {sampleQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => processQuery(q)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#E8F3EB] border border-[#D8CABA] text-xs text-[#281E15] font-medium transition-colors flex items-center justify-between group cursor-pointer shadow-2xs"
                >
                  <span className="truncate pr-2">• &quot;{q}&quot;</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#245B35] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <Button
            asChild
            className="w-full bg-[#245B35] hover:bg-[#1A4A28] text-[#FAF5E8] font-bold py-3.5 rounded-full shadow-md border border-[#194A28]"
          >
            <a href="/dashboard">
              <span>{t("landing.voiceModal.openChat")}</span>
              <ArrowRight className="h-4 w-4 ml-1 stroke-[2.5]" />
            </a>
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}
