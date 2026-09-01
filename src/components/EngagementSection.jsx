import { WeeklyChallenge } from "@/components/WeeklyChallenge";
import { DailyPrompt }     from "@/components/DailyPrompt";

export function EngagementSection() {
  return (
    <section id="desafio" className="py-12 section-alt relative">
      <div className="section-divider mb-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        <WeeklyChallenge />
        <DailyPrompt />
      </div>

      <div className="section-divider mt-8" />
    </section>
  );
}
