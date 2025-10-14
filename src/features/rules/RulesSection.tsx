import { List } from 'lucide-react';
import rulesData from '../../data/rules.json';

const colorMap: Record<string, string> = {
  indigo: 'text-indigo-600',
  emerald: 'text-emerald-500',
  amber: 'text-amber-500',
};

export function RulesSection() {
  return (
    <section className="section mb-16" id="rules" aria-labelledby="rules-title">
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg">
          <List className="w-8 h-8" aria-hidden="true" />
        </div>
        <h2 id="rules-title" className="text-2xl md:text-3xl font-bold">
          自然拼读与音标规则总览
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-4">
        {rulesData.sections.map((section) => (
          <details key={section.id} className="group">
            <summary
              className={`cursor-pointer font-semibold ${
                colorMap[section.color]
              } hover:opacity-80 transition-opacity list-none flex items-center gap-2`}
            >
              <span className="text-gray-400 group-open:rotate-90 transition-transform">▶</span>
              {section.title}
            </summary>

            <div className="mt-3 text-gray-700 text-sm space-y-4 pl-6">
              {/* 26个字母规则 - 有 subsections */}
              {section.subsections && (
                <>
                  {section.subsections.map((subsection, idx) => (
                    <div key={idx}>
                      <p className="font-semibold mb-2">{subsection.title}</p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        {subsection.rules.map((rule: any, ruleIdx: number) => (
                          <li key={ruleIdx}>
                            <strong>{rule.letter || rule.type}：</strong>
                            {rule.description || rule.rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}

              {/* 元音/辅音组合规则 - 直接有 rules */}
              {section.rules && !section.phonetics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="list-disc pl-5 space-y-1.5">
                    {section.rules.slice(0, Math.ceil(section.rules.length / 2)).map((rule: any, idx: number) => (
                      <li key={idx}>
                        <strong>{rule.combination}：</strong>
                        {rule.sounds}
                      </li>
                    ))}
                  </ul>
                  <ul className="list-disc pl-5 space-y-1.5">
                    {section.rules.slice(Math.ceil(section.rules.length / 2)).map((rule: any, idx: number) => (
                      <li key={idx}>
                        <strong>{rule.combination}：</strong>
                        {rule.sounds}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 48个国际音标 - 有 phonetics */}
              {section.phonetics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold mb-2">{section.phonetics.vowels.title}</p>
                    {section.phonetics.vowels.categories.map((cat: any, idx: number) => (
                      <p key={idx} className="mt-1">
                        <span className="font-medium">{cat.type}：</span>
                        {cat.symbols}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold mb-2">{section.phonetics.consonants.title}</p>
                    {section.phonetics.consonants.categories.map((cat: any, idx: number) => (
                      <p key={idx} className="mt-1">
                        <span className="font-medium">{cat.type}：</span>
                        {cat.symbols}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
