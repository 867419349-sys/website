/**
 * Vercel Serverless Function — Express 后端入口
 * 处理 /api/health | /api/chat | /api/split-image
 */
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

// 尝试加载 .env（Vercel 上用环境变量，本地开发用 .env 文件）
dotenv.config({ path: path.join(process.cwd(), '.env') });

const app = express();
app.use(express.json({ limit: '50mb' }));

// CORS
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});

// Gemini 客户端（延迟初始化）
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }
  return aiClient;
}

/* ==================== API 路由 ==================== */

// GET /api/health — 健康检查
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    keyAvailable: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// POST /api/chat — 杨芷琳 AI 助手
app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(412).json({ error: 'GEMINI_API_KEY not configured. Falling back to high quality local presets.' });
    return;
  }

  try {
    const systemInstruction = `
你是杨芷琳（Yang Zhilin）的个人智能作品集助手，代表一位 AI 体验设计师、UX 研究员、智能座舱概念设计师。
你的目标是专业、热情、简洁地回答开发者或雇主关于她的背景、资历和作品集的询问。每次回复保持 1-3 句中文。

杨芷琳的关键信息：
- 定位：关注 AI 视觉生成与真实产品体验落地的 AI 体验设计师。重点不是单纯出图，而是通过 Prompt 结构化、ComfyUI 工作流、LoRA 训练、风格迁移等，把 AI 转化为可控、可复用、可落地的真实设计生产力。
- 教育：江南大学 - 数字媒体艺术，GPA Top 10%，省级大学生创业银奖，设计师奖项。
- 工作经历：
  - 哈苏/华为（美术设计师）：3D 概念用户流程设计、用户反馈评审、交付高端 3D 资产。
  - 莉莉丝游戏（游戏交互设计师）：核心功能布局原型设计、连接 UI 面板与引擎代码。
- 核心项目案例：
  1. AI 视觉生成系统：在车机视觉项目中参与搭建面向智能座舱的 AI 视觉生产流程，通过 Prompt 结构化、LoRA 训练、垫图与 ComfyUI 解决生成随机、车型还原度低等痛点。
  2. 车机节日桌面：通过镜头、情绪、主体的 Prompt Evolution 融合人机适配，打造多端情感共鸣壁纸与情绪触点。
  3. 智能座舱情景模式：围绕小憩、露营、影院、关怀等车内大空间，将场景转换为 AI 识别的结构化视觉语言。
- 联系方式：邮箱 867419349@qq.com。

始终自称为"杨芷琳的 AI 体验助手"。直接以中文回复。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || '我已收到了您关于设计的咨询！' });
  } catch (error: any) {
    console.error('Gemini API call failure:', error);
    res.status(500).json({ error: 'AI processing failed, falling back to local simulation.' });
  }
});

// POST /api/split-image — AI 图像分层
app.post('/api/split-image', async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    res.status(400).json({ error: '缺少图片数据 (imageBase64)' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const apiBase = process.env.API_BASE_URL || 'https://api.deepseek.com/v1';
  const modelName = process.env.VISION_MODEL || 'deepseek-chat';

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(412).json({ error: 'API KEY 未配置' });
    return;
  }

  try {
    // 动态导入 sharp（用于 Vercel serverless，避免冷启动时加载失败）
    const sharp = (await import('sharp')).default;

    let rawBase64 = imageBase64;
    if (rawBase64.includes(',')) rawBase64 = rawBase64.split(',')[1];

    const imgBuffer = Buffer.from(rawBase64, 'base64');
    const metadata = await sharp(imgBuffer).metadata();
    const { width, height } = metadata;
    if (!width || !height) { res.status(400).json({ error: '无效图片' }); return; }

    console.log(`[split-image] 图片 ${width}x${height}, 调用 ${modelName} @ ${apiBase}`);

    const prompt = `你是一位 UI 分层分析专家。你的任务是把这张 ${width}×${height} 像素的界面设计稿**拆成独立的图层**，像 Photoshop 图层一样，从上到下逐层分析。

拆分层级原则（从底到顶）：
1. 底层背景 — 整个页面的底色/底图（必选，通常是最下面那层大色块）
2. 大区块 — 导航栏、侧边栏、内容区、底部栏等大的结构分区
3. 内容卡片 — 每个独立的卡片/面板/区块，各为一层
4. 交互组件 — 按钮、输入框、选择器、开关等独立交互元素
5. 信息元素 — 图标、头像、徽标、分割线等小型独立元素
6. 文本组 — 独立的标题、段落、标签文本（大段的文字整体作为一层）

分层粒度规则：
- 一张卡片 = 1 层（含其背景色/边框/阴影），不要拆成标题+描述+按钮
- 一个导航栏 = 1 层，包含整个导航条
- 一个独立按钮 = 1 层
- 一个独立图标（不在其他组件内的）= 1 层
- 大段文字整体 = 1 层
- 页面背景色 = 1 层（通常是最大的矩形）
- **每层都要覆盖完整范围**，相邻层允许重叠

输出格式：
严格只输出一个 JSON 数组，每个元素格式为：
{"name":"组件中文名","bbox":[x,y,宽,高],"layer":数字}
- layer: 0=背景(最底), 1=大区块, 2=卡片, 3=交互, 4=信息/文本(最顶)
- bbox 像素坐标，(0,0)=左上角
- 按 layer 从小到大排序（底→顶）

示例：
[{"name":"页面背景","bbox":[0,0,375,812],"layer":0},{"name":"顶部导航栏","bbox":[0,0,375,88],"layer":1},{"name":"内容区","bbox":[16,104,343,588],"layer":1},{"name":"搜索框","bbox":[16,104,343,148],"layer":3},{"name":"卡片-项目1","bbox":[16,164,343,284],"layer":2},{"name":"卡片-项目2","bbox":[16,300,343,420],"layer":2},{"name":"主按钮","bbox":[16,436,343,480],"layer":3},{"name":"底部标签栏","bbox":[0,728,375,812],"layer":1}]`;

    const apiUrl = `${apiBase}/chat/completions`;
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/png;base64,${rawBase64}` } },
            { type: 'text', text: prompt },
          ],
        }],
        temperature: 0.1,
        max_tokens: 8192,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error(`API 返回 ${resp.status}: ${errText.substring(0, 300)}`);
    }

    const json = await resp.json() as any;
    const text = json.choices?.[0]?.message?.content || '';
    console.log(`[split-image] 响应 (${text.length} 字符):`, text.substring(0, 300));

    let jsonStr = text.trim();
    jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '');
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[split-image] 未找到 JSON 数组:', jsonStr.substring(0, 300));
      res.status(500).json({ error: 'AI 返回格式不正确', raw: text.substring(0, 500) });
      return;
    }

    let rawJson = jsonMatch[0];
    let elements: any[];
    try {
      elements = JSON.parse(rawJson);
    } catch (parseErr: any) {
      console.error('[split-image] JSON 解析失败，尝试修复:', parseErr.message);
      const fixed = rawJson
        .replace(/,\s*]/g, ']')
        .replace(/,\s*}/g, '}');
      try {
        elements = JSON.parse(fixed);
      } catch {
        const objs = rawJson.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g) || [];
        elements = objs.map(s => {
          try { return JSON.parse(s.replace(/,\s*}/g, '}')); } catch { return null; }
        }).filter(Boolean);
      }
    }

    if (!Array.isArray(elements) || elements.length === 0) {
      console.error('[split-image] 解析结果为空，AI原始响应:', text.substring(0, 500));
      res.status(500).json({ error: 'AI 未识别到任何元素', raw: text.substring(0, 500) });
      return;
    }

    console.log(`[split-image] 识别到 ${elements.length} 个元素`);

    const resultElements: any[] = [];
    for (const el of elements) {
      if (!el.bbox || !Array.isArray(el.bbox) || el.bbox.length !== 4) continue;
      const [x, y, w, h] = el.bbox.map((v: number) => Math.round(v));
      const safeX = Math.max(0, x), safeY = Math.max(0, y);
      const safeW = Math.min(width! - safeX, w), safeH = Math.min(height! - safeY, h);
      if (safeW <= 0 || safeH <= 0) continue;

      try {
        const extracted = await sharp(imgBuffer)
          .extract({ left: safeX, top: safeY, width: safeW, height: safeH })
          .extend({
            top: safeY, bottom: height! - safeY - safeH,
            left: safeX, right: width! - safeX - safeW,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          }).png().toBuffer();
        resultElements.push({
          name: el.name || `元素 ${resultElements.length + 1}`,
          bbox: [safeX, safeY, safeW, safeH],
          layer: el.layer ?? 2,
          imageBase64: extracted.toString('base64'),
        });
      } catch (extractErr) {
        console.error(`[split-image] 提取 "${el.name}" 失败:`, extractErr);
      }
    }

    console.log(`[split-image] 成功提取 ${resultElements.length}/${elements.length} 个元素`);
    res.json({ elements: resultElements, originalSize: { width, height } });
  } catch (error: any) {
    console.error('[split-image] 失败:', error);
    res.status(500).json({ error: '图像分割失败: ' + (error.message || '未知错误') });
  }
});

// 导出给 Vercel
export default app;
