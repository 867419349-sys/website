/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import sharp from 'sharp';

// Load environment variables
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });


const PORT = 3001;

// Lazy initialization keeper for Gemini SDK
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
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // 全局 CORS
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (_req.method === 'OPTIONS') { res.sendStatus(200); return; }
    next();
  });

  // API 1: Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', keyAvailable: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' });
  });

  // API 2: Dynamic Chat Endpoint representing professional Yang Zhilin credentials helper
  app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return a 412 status indicating no key, client will fallback elegantly
      res.status(412).json({ error: 'GEMINI_API_KEY not configured. Falling back to high quality local presets.' });
      return;
    }

    try {
      const systemInstruction = `
You are the personal smart portfolio assistant representing Yang Zhilin (杨芷琳), an expert AI Experience Designer, UX researcher, and smart cockpit concept designer.
Your goal is to answer developer or employer inquiries about her background, credentials, and portfolios professionally, enthusiastically, and concisely. Keep responses brief, polite, and helpful (typically 1-3 sentences in Chinese/Mandarin).

Yang Zhilin's key specifications:
- Definition: 关注 AI 视觉生成与真实产品体验落地的 AI 体验设计师。重点不是单纯出图，而是通过 Prompt 结构化、ComfyUI 工作流、LoRA 训练、风格迁移等，把 AI 转化为可控、可复用、可落地的真实设计生产力。
- Education: Graduated from Jiangnan University (江南大学 - Digital Media Arts), Top 10% GPA, Provincial silver in college entrepreneurship, designers awards.
- Work highlights: 
  - Hassel/Huawei (美术设计师): 3D conceptual user flow design, user feedback reviews, and delivering luxury 3D assets.
  - Lilith Games (莉莉丝游戏 - 游戏交互设计师): Core feature layout prototyping, connecting UI panels with engine codes.
- Core Project Cases (作品案例):
  - 1. AI视觉生成系统: 在车机视觉项目中参与搭建面向智能座舱的 AI 视觉生产流程，通过 Prompt 结构化、LoRA 训练、垫图与 ComfyUI 解决生成随机、车型还原度低等痛点，形成高效车型替换光影材质重绘流。
  - 2. 车机节日桌面: 大幅提升特定节点下车载用户的惊喜、情绪共鸣。通过镜头、情绪、主体的 Prompt Evolution 融合人机适配，打造多端情感共鸣壁纸与情绪触点。
  - 3. 智能座舱情景模式: 围绕小憩、露营、影院、关怀等车内大空间，将场景转换为 AI 识别的结构化视觉语言并持续进行材质、空间感优化，打通车载环境体验。
- Contact Information: Email is 867419349@qq.com.

Always self-introduce as "杨芷琳的 AI 体验助手" (Zhilin's AI Assistant). Respond directly in Chinese.
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

  // API 3: AI 图像分层 —— 视觉模型识别元素 + Sharp 提取
  // 支持 OpenAI 兼容 API（DeepSeek / 通义千问 / GLM 等国内模型）
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

      // 使用 OpenAI 兼容 API 格式（DeepSeek / 通义千问 / GLM 等均支持）
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
        // 先直接解析原始 JSON
        elements = JSON.parse(rawJson);
      } catch (parseErr: any) {
        console.error('[split-image] JSON 解析失败，尝试修复:', parseErr.message);
        // 只做最小修复：尾逗号 + 单引号键名
        const fixed = rawJson
          .replace(/,\s*]/g, ']')
          .replace(/,\s*}/g, '}');
        try {
          elements = JSON.parse(fixed);
        } catch {
          // 最后尝试：逐个提取对象
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

  // 静态服务 image-splitter 前端（与 API 同端口，无跨域问题）
  const splitterPath = path.join(__dirname, '..', 'image-splitter');
  app.use('/split', express.static(splitterPath, {
    setHeaders: (res) => { res.setHeader('Cache-Control', 'no-store'); }
  }));

  // Vite Integration: Middleware mode in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve build outputs
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULL-STACK SERVER] Running on host 0.0.0.0:${PORT} in env: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
export default {};
