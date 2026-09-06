"use client";

import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/contexts/language-context";

export function FAQSection() {
  const { t } = useTranslation();

  const faqs = [
    {
      q: t("landing.faq.q1"),
      a: t("landing.faq.a1"),
    },
    {
      q: t("landing.faq.q2"),
      a: t("landing.faq.a2"),
    },
    {
      q: t("landing.faq.q3"),
      a: t("landing.faq.a3"),
    },
    {
      q: t("landing.faq.q4"),
      a: t("landing.faq.a4"),
    },
    {
      q: t("landing.faq.q5"),
      a: t("landing.faq.a5"),
    },
  ];

  return (
    <section id="about-us" className="bg-[#F7EFD9] py-16 sm:py-20 border-b border-[#D8CABA]/70 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5E8] border border-[#C7B99E] text-[#245B35] text-xs sm:text-sm font-bold shadow-xs">
            <span>🌿 {t("landing.faq.badge")} 🌿</span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black text-[#281E15]">
            {t("landing.faq.title")}
          </h2>
          <p className="text-sm text-[#5D4A3A] font-normal">
            {t("landing.faq.subtitle")}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3.5">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="bg-[#FAF5E8] border-2 border-[#D8CABA] hover:border-[#3F2918] rounded-2xl px-6 shadow-xs transition-colors"
            >
              <AccordionTrigger className="font-headline font-bold text-base text-[#281E15] hover:text-[#245B35] hover:no-underline py-4.5 text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-[#5D4A3A] leading-relaxed pb-4.5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </div>
    </section>
  );
}
