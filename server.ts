/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = 3000;

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
  app.use(express.json());

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
