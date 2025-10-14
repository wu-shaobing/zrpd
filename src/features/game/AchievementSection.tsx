import { LearningStatsCard } from '../../components/phoneme/LearningStatsCard';
import { usePhonicsStore } from '../../stores/phonicsStore';

export function AchievementSection() {
  const stats = usePhonicsStore((state) => state.stats);

  return (
    <section className="section mb-16" id="achievement">
      <LearningStatsCard stats={stats} />
    </section>
  );
}
