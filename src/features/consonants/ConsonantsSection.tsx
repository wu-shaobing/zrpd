import { Type } from 'lucide-react';
import consonantsData from '../../data/consonants.json';
import { getColorClasses, type ColorName } from '../../utils/colors';

export function ConsonantsSection() {
  return (
    <section className="section mb-16" id="consonants" aria-labelledby="consonants-title">
      <div className="flex items-center mb-8">
        <div
          className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg"
          aria-hidden="true"
        >
          <Type />
        </div>
        <h2 id="consonants-title" className="text-2xl md:text-3xl font-bold">
          辅音字母发音
        </h2>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {consonantsData.map((consonant) => {
          const colors = getColorClasses(consonant.color as ColorName);
          return (
            <div
              key={consonant.letter}
              className="letter-card bg-white rounded-lg p-3 shadow-md text-center"
            >
              <div
                className={`w-16 h-16 ${colors.bg100} rounded-full flex items-center justify-center mx-auto mb-2`}
              >
                <span className={`text-2xl font-bold ${colors.text500}`}>
                  {consonant.letter}
                </span>
              </div>
              <p className="text-sm">{consonant.ipa}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
