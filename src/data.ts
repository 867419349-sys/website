/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TimelineItem, HighlightItem, SkillCategory, ArticleItem } from './types';

export const EDUCATION_DATA: TimelineItem[] = [
  {
    id: 'edu-1',
    period: '2020-2024',
    organization: '江南大学 (Jiangnan University)',
    role: '数字媒体艺术 (Digital Media Arts)',
    description: '在校绩点排名前十，获大学生创新创业大赛省级银奖、未来设计师大赛三等奖、中关村最具创意奖。'
  }
];

export const WORK_DATA: TimelineItem[] = [
  {
    id: 'work-1',
    period: '2024.10 - 2026.1',
    organization: 'Hassel / 华为',
    role: '美术设计师',
    description: '负责 3D 概念设计、视觉界面评审与高质量美术资产的交付落地，构建全新 3D 交互范式。'
  },
  {
    id: 'work-2',
    period: '2023.7 - 2024.2',
    organization: '莉莉丝游戏 (Lilith Games)',
    role: '游戏交互设计师',
    description: '负责重点在研项目的交互方案设计，协同程序与核心 UI 团队完成最终功能上线与优化体验。'
  }
];

export const HIGHLIGHTS: HighlightItem[] = [
  {
    id: 'high-1',
    title: '情景模式',
    description: '深入特定硬件、环境与用户行为上下文进行有温度的产品体验设计。'
  },
  {
    id: 'high-2',
    title: '彩蛋模式',
    description: '擅长在系统底层或交互触点植入妙趣横生的意料之外彩蛋体验。'
  },
  {
    id: 'high-3',
    title: 'AI 美术建设',
    description: '通过 Stable Diffusion 与 ComfyUI 建立企业级、规模化工作流管线。'
  },
  {
    id: 'high-4',
    title: '从 0 到 1 完整实现',
    description: '具备极强的前端与引擎开发基础，保证视觉设计在真实终端 100% 还原。'
  }
];

export const SKILLS_DATA: SkillCategory[] = [
  {
    id: 'sk-1',
    category: '工具技能',
    skills: ['AIGC', 'ComfyUI', 'Unity', '3D 建模'],
    badges: [
      { name: '沟通协作', group: 'soft' },
      { name: '团队合作', group: 'soft' },
      { name: '虚拟力', group: 'hard' }
    ]
  }
];

export const ARTICLES_DATA: ArticleItem[] = [
  {
    id: 'art-1',
    title: 'EFFECTIVE DEVELOPMENT CONVERSATIONS: TIPS & TRICKS FOR MANAGERS',
    date: 'NOVEMBER 22, 2021',
    category: 'LEADERSHIP',
    image: '/src/assets/images/instagram_asset_bottle_1781774227848.jpg'
  },
  {
    id: 'art-2',
    title: 'AUTOMATING WORKFLOWS SURROUNDING EMPLOYEE ENGAGEMENT & DESIGN',
    date: 'NOVEMBER 10, 2021',
    category: 'PROCESS',
    image: '/src/assets/images/make_a_splash_can_1781774201107.jpg'
  },
  {
    id: 'art-3',
    title: 'WHY DESIGN SYSTEMS AND DESIGN OPS MATTER FOR ENTERPRISES',
    date: 'OCTOBER 15, 2021',
    category: 'SYSTEM',
    image: '/src/assets/images/yang_zhilin_avatar_1781774163978.jpg'
  },
  {
    id: 'art-4',
    title: 'REDESIGNING COGNITION: INTEGRATING AI INTO ENTERPRISE SOLUTIONS',
    date: 'SEPTEMBER 05, 2021',
    category: 'COGNITIVE',
    image: '/src/assets/images/instagram_asset_bottle_1781774227848.jpg'
  }
];

export const PRESET_AI_RESPONSES: Record<string, string> = {
  'education': '杨芷琳毕业于数字媒体强校江南大学（教育部直属双一流高校），专注于数字创意、AIGC工具链与系统体验设计的融合。她在校绩点排名前10%，曾获多项全国设计与创业顶级奖项。',
  'work': '杨芷琳曾就职于华为/Hassel任 3D 美术设计师，参与 3D 界面体验规范和先锋视觉建设；在莉莉丝游戏任交互设计师，深度链接了交互研究、原型打样与实际游戏逻辑落地。',
  'comfyui': '在 AIGC 美术管线建设中，她精通 ComfyUI 工作流（如 IP-Adapter, ControlNet 及局部重绘），能够通过定制节点和批量处理提升团队 3D 纹理与 2D 概念图的设计产能。',
  'unity': '她拥有优秀的 Unity 与 3D 渲染基础，能自行完成 C# 脚本原型搭建与物理反馈微调，确保所设计的体验在游戏或虚拟场景中完美复现。',
  'hello': '你好！我是杨芷琳的 AI 体验助手小琳。欢迎进入我的彩蛋砂盒模式！你可以向我提问关于我的“教育经历”、“工作特长”、“ComfyUI” 或 “游戏交互”。',
};
