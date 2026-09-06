"use client";

import { Star, MapPin, Quote, Award } from "lucide-react";
import { useTranslation } from "@/contexts/language-context";
import { CardBottomTrim } from "./desi-folk-art";

export function FarmerStories() {
  const { t } = useTranslation();

  const stories = [
    {
      name: t("landing.farmerStories.story1.name"),
      location: t("landing.farmerStories.story1.location"),
      crop: t("landing.farmerStories.story1.crop"),
      quote: t("landing.farmerStories.story1.quote"),
      rating: 5,
    },
    {
      name: t("landing.farmerStories.story2.name"),
      location: t("landing.farmerStories.story2.location"),
      crop: t("landing.farmerStories.story2.crop"),
      quote: t("landing.farmerStories.story2.quote"),
      rating: 5,
    },
    {
      name: t("landing.farmerStories.story3.name"),
      location: t("landing.farmerStories.story3.location"),
      crop: t("landing.farmerStories.story3.crop"),
      quote: t("landing.farmerStories.story3.quote"),
      rating: 5,
    },
  ];

  return (
    <section id="for-farmers" className="bg-[#F7EFD9] py-16 sm:py-20 border-b border-[#D8CABA]/70 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5E8] border border-[#C7B99E] text-[#245B35] text-xs sm:text-sm font-bold shadow-xs">
            <span>🌿 {t("landing.farmerStories.badge")} 🌿</span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black text-[#281E15] leading-tight">
            {t("landing.farmerStories.title")}
          </h2>
          <p className="text-sm sm:text-base text-[#5D4A3A] font-normal">
            {t("landing.farmerStories.subtitle")}
          </p>
        </div>

        {/* Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {stories.map((story, idx) => (
            <div
              key={idx}
              className="bg-[#FAF5E8] rounded-3xl p-6 sm:p-7 border-2 border-[#D8CABA] shadow-sm hover:shadow-md hover:border-[#3F2918] transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#C99A3A]">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-[#245B35]/30" />
                </div>

                <p className="text-xs sm:text-sm text-[#3F2918] italic leading-relaxed">
                  &quot;{story.quote}&quot;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#D8CABA] flex items-center justify-between">
                <div>
                  <h4 className="font-headline font-bold text-sm text-[#281E15]">
                    {story.name}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-[#5D4A3A] mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-[#245B35]" />
                    <span>{story.location}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#D8CABA] text-[#245B35]">
                  {story.crop}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
