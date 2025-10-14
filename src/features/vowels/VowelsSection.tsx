import { Volume2, Languages } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';
import vowelsData from '../../data/vowels.json';

export function VowelsSection() {
  const { speak } = useSpeech();

  return (
    <section className="section mb-16" id="vowels" aria-labelledby="vowels-title">
      <div className="flex items-center mb-8">
        <div
          className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg"
          aria-hidden="true"
        >
          <Languages />
        </div>
        <h2 id="vowels-title" className="text-2xl md:text-3xl font-bold">
          元音字母发音
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {vowelsData.map((vowel) => (
          <div
            key={vowel.letter}
            className="letter-card bg-white rounded-xl p-4 shadow-md text-center"
          >
            <div
              className={`w-20 h-20 bg-${vowel.color}-100 rounded-full flex items-center justify-center mx-auto mb-3`}
            >
              <span className={`text-3xl font-bold text-${vowel.color}-500`}>
                {vowel.letter}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{vowel.ipa}</h3>
            <p className="text-sm text-gray-600">{vowel.examples.join(', ')}</p>
            <button
              className="mt-2 text-indigo-600 text-sm hover:underline flex items-center justify-center gap-1 mx-auto"
              onClick={() => speak(vowel.examples.join(', '))}
              aria-label={`播放 ${vowel.letter} 发音示例`}
            >
              <Volume2 size={16} aria-hidden="true" />
              听发音
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href="#"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
        >
          查看更多元音发音规则 →
        </a>
      </div>
    </section>
  );
}
