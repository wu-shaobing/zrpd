import { useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { VowelsSection } from './features/vowels/VowelsSection';
import { ConsonantsSection } from './features/consonants/ConsonantsSection';
import { GameSection } from './features/game/GameSection';
import { AchievementSection } from './features/game/AchievementSection';
import { RulesSection } from './features/rules/RulesSection';
import { useProgress } from './hooks/useProgress';
import { preloadPhonemeSprites } from './hooks/usePhonemeAudio';

function App() {
  useProgress();
  const sectionsRef = useRef<HTMLElement>(null);

  // 预加载音频 sprites（可选，如果音频文件不存在会自动降级到 TTS）
  useEffect(() => {
    // 延迟预加载，优先加载页面内容
    const timer = setTimeout(() => {
      preloadPhonemeSprites().catch(() => {
        // 音频文件不存在时静默失败，不显示警告
        // 系统会自动降级到 Tauri TTS 或 Web Speech API
        if (process.env.NODE_ENV === 'development') {
          console.info('音频 sprite 未生成，将使用 TTS 播放。如需本地音频，请运行: ./scripts/generate-phonemes.sh');
        }
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Section visibility observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8" role="main" ref={sectionsRef}>
        {/* Welcome Section */}
        <section className="section mb-12 text-center" aria-labelledby="intro-title">
          <h2 id="intro-title" className="text-3xl md:text-4xl font-bold text-indigo-600 mb-4">
            <span className="inline-block mr-2" aria-hidden="true">🌈</span>
            让英语发音变得有趣！
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            快来探索26个字母的神奇发音规则，跟着小卡片一起学习自然拼读吧！
          </p>
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
              A
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
              B
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
              C
            </div>
          </div>
        </section>

        <VowelsSection />
        <ConsonantsSection />
        <GameSection />
        <AchievementSection />
        <RulesSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
