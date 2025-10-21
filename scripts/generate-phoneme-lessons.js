#!/usr/bin/env node
/**
 * 生成音标讲解文本
 * 为每个音标生成详细的讲解内容（像小老师一样）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取音标数据
const dataPath = path.join(__dirname, '../src/data/phonics-complete.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// 输出目录
const outputDir = path.join(__dirname, '../public/audio/lessons');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * 生成音标讲解文本
 */
function generateLessonText(phoneme) {
  const { symbol, name, pronunciation, examples, commonMistakes } = phoneme;
  
  // 构建讲解文本（中文，用于 TTS）
  // 简洁、针对性强、像小老师一样
  const lesson = [
    `同学好，我是你的音标小老师。`,
    `今天我们来学习 ${name}。`,
    `这个音标写作 ${symbol}。`,
    ``,
    `发音要领是：${pronunciation.cn}。`,
    `记住这个小技巧：${pronunciation.tips}。`,
    `嘴巴要${pronunciation.mouthShape}，舌头在${pronunciation.tonguePosition}的位置。`,
    ``,
    `我们来看几个例子：`,
    ...examples.slice(0, 3).map(ex => `${ex.word}，中文意思是${ex.translation}。`),
    ``,
    `特别提醒，不要犯这些错误：`,
    ...commonMistakes.map((mistake, i) => `第${i + 1}点，${mistake}。`),
    ``,
    `现在请跟我一起读，注意听好发音。`,
    `准备好了吗？我们开始吧！`,
  ].join('\n');
  
  // 中文讲解（用于界面显示）
  const lessonCn = [
    `让我们来学习音标 ${symbol}`,
    ``,
    `📖 发音要领：`,
    pronunciation.cn,
    `💡 技巧：${pronunciation.tips}`,
    `👄 嘴型：${pronunciation.mouthShape}`,
    `👅 舌位：${pronunciation.tonguePosition}`,
    ``,
    `📝 示例单词：`,
    ...examples.slice(0, 3).map(ex => `• ${ex.word} [${ex.phonetic}] - ${ex.translation}`),
    ``,
    `⚠️ 常见错误：`,
    ...commonMistakes.map((mistake, i) => `${i + 1}. ${mistake}`),
    ``,
    `现在让我们一起练习吧！请跟我读。`,
  ].join('\n');
  
  return { lesson, lessonCn };
}

/**
 * 收集所有音标
 */
function collectPhonemes(data) {
  const phonemes = [];
  
  // 元音
  if (data.vowels?.monophthongs?.short) {
    phonemes.push(...data.vowels.monophthongs.short);
  }
  if (data.vowels?.monophthongs?.long) {
    phonemes.push(...data.vowels.monophthongs.long);
  }
  if (data.vowels?.diphthongs) {
    phonemes.push(...data.vowels.diphthongs);
  }
  
  // 辅音
  const consonantGroups = [
    'plosives', 'fricatives', 'affricates', 
    'nasals', 'liquids', 'glides', 'others'
  ];
  
  consonantGroups.forEach(group => {
    if (data.consonants?.[group]) {
      phonemes.push(...data.consonants[group]);
    }
  });
  
  return phonemes;
}

// 主程序
console.log('生成音标讲解文本...\n');

const phonemes = collectPhonemes(data);
const lessonTexts = {};
const lessonScripts = [];

phonemes.forEach((phoneme, index) => {
  const { lesson, lessonCn } = generateLessonText(phoneme);
  
  // 保存中文讲解（用于界面）
  lessonTexts[phoneme.id] = {
    id: phoneme.id,
    symbol: phoneme.symbol,
    name: phoneme.name,
    lessonCn,
    audioFile: `${phoneme.id}-lesson.mp3`
  };
  
  // 生成 TTS 脚本
  lessonScripts.push({
    id: phoneme.id,
    text: lesson,
    outputFile: `${phoneme.id}-lesson.mp3`
  });
  
  console.log(`[${index + 1}/${phonemes.length}] ${phoneme.id} - ${phoneme.symbol}`);
});

// 保存讲解文本索引
const indexPath = path.join(outputDir, 'lessons-index.json');
fs.writeFileSync(
  indexPath,
  JSON.stringify({
    version: '1.0.0',
    generated: new Date().toISOString(),
    total: phonemes.length,
    lessons: lessonTexts
  }, null, 2)
);

console.log(`\n✅ 讲解文本索引已保存: ${indexPath}`);

// 保存 TTS 脚本（用于生成音频）
const scriptsPath = path.join(__dirname, '../.temp/lesson-scripts.json');
fs.mkdirSync(path.dirname(scriptsPath), { recursive: true });
fs.writeFileSync(scriptsPath, JSON.stringify(lessonScripts, null, 2));

console.log(`✅ TTS 脚本已保存: ${scriptsPath}`);
console.log(`\n下一步: 运行 generate-lesson-audio.sh 生成音频文件`);
