"use client";

import Image from "next/image";
import { useState } from "react";
import { Mic, Send, Volume2, Sparkles, CheckCheck } from "lucide-react";
import { useTranslation } from "@/contexts/language-context";

interface AnnapurnaChatCardProps {
  onOpenVoice: () => void;
}

export function AnnapurnaChatCard({ onOpenVoice }: AnnapurnaChatCardProps) {
  const { t, language } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      hi: "hi-IN",
      kn: "kn-IN",
      bn: "bn-IN",
      bho: "hi-IN",
      en: "en-IN",
    };
    utterance.lang = langMap[language] || "hi-IN";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative w-full max-w-[360px] sm:max-w-[400px] select-none group">
      {/* Main Chat Container */}
      <div className="bg-[#FAF5E8] rounded-3xl border-2 border-[#3F2918]/80 shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
        
        {/* Deep Green Header */}
        <div className="bg-[#1A4A28] px-4 py-3.5 flex items-center justify-between text-white border-b border-[#12361D]">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#C99A3A] shadow-xs">
              <Image
                src="/annapurna-avatar.jpg"
                alt="Annapurna AI"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-base text-[#FAF5E8] tracking-tight">
                  {t("landing.chatCard.headerTitle")}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
              </div>
              <span className="text-[11px] font-sans text-[#A7F3D0] font-medium tracking-wide">
                {t("landing.chatCard.headerSubtitle")}
              </span>
            </div>
          </div>

          {/* Voice Waveform & Sparkle */}
          <div className="flex items-center gap-2 text-[#A7F3D0]">
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-0.5 h-3 bg-[#A7F3D0] rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-0.5 h-4 bg-[#A7F3D0] rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-0.5 h-2.5 bg-[#A7F3D0] rounded-full animate-bounce [animation-delay:300ms]" />
              <span className="w-0.5 h-3.5 bg-[#A7F3D0] rounded-full animate-bounce [animation-delay:450ms]" />
            </div>
            <Sparkles className="w-4 h-4 text-[#FDE047]" />
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="p-4 space-y-3.5 bg-[#FBF7EE]/90">
          
          {/* User Bubble (Right) */}
          <div className="flex flex-col items-end">
            <div className="max-w-[85%] bg-[#FFFFFF] border border-[#D8CABA] rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-xs">
              <span className="block text-[11px] font-bold text-[#756653] mb-0.5">
                You
              </span>
              <p className="text-xs sm:text-[13px] font-medium text-[#281E15] leading-relaxed">
                {t("landing.chatCard.userMessage")}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#8C7A68]">
                <span>10:30 AM</span>
                <CheckCheck className="w-3.5 h-3.5 text-[#245B35]" />
              </div>
            </div>
          </div>

          {/* Annapurna Response Bubble (Left) */}
          <div className="flex flex-col items-start">
            <div className="max-w-[88%] bg-[#FFFFFF] border border-[#D8CABA] rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-3.5 h-3.5 rounded-full overflow-hidden relative">
                  <Image src="/annapurna-avatar.jpg" alt="Annapurna" fill className="object-cover" />
                </div>
                <span className="text-[11px] font-bold text-[#245B35]">
                  Annapurna
                </span>
              </div>
              <p className="text-xs sm:text-[13px] font-medium text-[#281E15] leading-relaxed">
                {t("landing.chatCard.aiMessage")}
              </p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-[#8C7A68]">
                <button
                  onClick={() => handleSpeak(t("landing.chatCard.aiMessage"))}
                  className="flex items-center gap-1 text-[#245B35] hover:text-[#1A4A28] font-semibold transition-colors"
                  aria-label="Listen message"
                >
                  <Volume2 className={`w-3 h-3 ${isSpeaking ? "animate-pulse" : ""}`} />
                  <span>Listen</span>
                </button>
                <span>10:31 AM</span>
              </div>
            </div>
          </div>

          {/* Input Bar */}
          <div className="pt-2">
            <div className="relative flex items-center bg-[#FFFFFF] border border-[#C7B99E] rounded-full pl-3.5 pr-1.5 py-1.5 shadow-inner">
              <input
                type="text"
                placeholder={t("landing.chatCard.inputPlaceholder")}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputText.trim()) {
                    onOpenVoice();
                  }
                }}
                className="w-full bg-transparent text-xs text-[#281E15] placeholder-[#8C7A68] outline-hidden pr-2 font-medium"
              />
              <button
                onClick={onOpenVoice}
                className="w-8 h-8 rounded-full bg-[#245B35] hover:bg-[#1A4A28] active:scale-90 text-[#FAF5E8] flex items-center justify-center transition-transform shadow-xs shrink-0"
                aria-label="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Pill Attached Below Card */}
      <div className="flex justify-center -mt-3.5 relative z-10">
        <button
          onClick={onOpenVoice}
          className="bg-[#1A4A28] hover:bg-[#245B35] active:scale-95 text-[#FAF5E8] text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md border border-[#FAF5E8]/30 transition-all hover:scale-105"
        >
          <Mic className="w-3.5 h-3.5 text-[#FDE047]" />
          <span>{t("landing.chatCard.voiceCta")}</span>
        </button>
      </div>
    </div>
  );
}
