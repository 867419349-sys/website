/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';
import { PRESET_AI_RESPONSES } from '../data';
import { sounds } from '../utils/audio';

const STICKERS = [
  { id: 'st-1', content: '🌟', label: 'STAR', color: 'bg-[#d2ff55]', x: 50, y: 120 },
  { id: 'st-2', content: '🎨', label: 'DESIGN', color: 'bg-[#ff55bb]', x: 250, y: 80 },
  { id: 'st-3', content: '💬', label: 'TALK', color: 'bg-[#b388ff]', x: 50, y: 320 },
  { id: 'st-4', content: '🤖', label: 'AI COGNITIVE', color: 'bg-[#5c56fb] text-white', x: 220, y: 300 }
];

export default function SectionSandbox() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: '你好！我是杨芷琳的 AI 体验助手小琳。欢迎来到我的“彩蛋体验沙盒”！你可以随时向我提问，或拖动左侧代表我工作成就和工具链的物理贴纸，随意打乱并拼贴它们。你可以试着打出 “education”、“work”、“comfyui” 查看我的专业特长！',
      timestamp: '02:14'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    sounds.playClick();
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    const prompt = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      // 1. Double check presets first as quick matching triggers
      const lower = prompt.toLowerCase();
      let replyText = '';

      if (lower.includes('edu') || lower.includes('学校') || lower.includes('江南大学') || lower.includes('教育')) {
        replyText = PRESET_AI_RESPONSES.education;
      } else if (lower.includes('work') || lower.includes('工作') || lower.includes('华为') || lower.includes('莉莉丝') || lower.includes('经历')) {
        replyText = PRESET_AI_RESPONSES.work;
      } else if (lower.includes('comfy') || lower.includes('sd') || lower.includes('stable') || lower.includes('美术')) {
        replyText = PRESET_AI_RESPONSES.comfyui;
      } else if (lower.includes('unity') || lower.includes('交互') || lower.includes('c#')) {
        replyText = PRESET_AI_RESPONSES.unity;
      } else if (lower.includes('hello') || lower.includes('你好')) {
        replyText = PRESET_AI_RESPONSES.hello;
      }

      // 2. If no matching local keyword, hit our server side API
      if (!replyText) {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        
        if (response.ok) {
          const data = await response.json();
          replyText = data.text;
        } else {
          // Graceful fallback if server API is not configured or lacks API key
          replyText = `收到您的消息！“${prompt}”。这是杨芷琳自定义的体验回复：作为创新体验设计师，我一直在研究用 AI 和生成式工作管线直接支持产品开发。期待可以和您一起探索！`;
        }
      }

      setTimeout(() => {
        sounds.playBubble();
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            sender: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsLoading(false);
      }, 500);

    } catch (err) {
      console.warn('AI compilation error or endpoint failed, fallback active', err);
      setTimeout(() => {
        sounds.playBubble();
        setMessages((prev) => [
          ...prev,
          {
            id: `a-err-${Date.now()}`,
            sender: 'assistant',
            text: `由于连接限制，已转入本地辅助模式：我是杨芷琳的智能助理解答。建议提问 “work” 或 “education” 来解锁我的核心简历履历详情！`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <div className="w-full bg-[#111115] text-white min-h-screen relative overflow-hidden py-16 px-4 md:px-12 lg:px-20 font-sans flex flex-col justify-center">
      
      {/* Mesh grid bg */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10 pt-12">
        
        {/* LEFT COLUMN: PHYSICS WORKSPACE STICKER BOARD */}
        <div className="reveal-on-scroll lg:col-span-5 bg-neutral-900/60 border border-neutral-800/80 rounded-[32px] p-6 flex flex-col justify-between relative min-h-[450px]">
          
          <div className="text-left select-none relative z-15">
            <span className="bg-[#b388ff] text-black text-[10px] font-mono font-black font-extrabold uppercase px-2 py-0.5 rounded border border-black rotate-[-2deg] inline-block">
              彩蛋体验
            </span>
            <h3 className="text-2xl font-sans font-black tracking-tighter mt-2 uppercase">
              物理创新沙盒
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm">
              拖拽下方的交互卡片、3D粒子或微章，任意设计您喜欢的网页创意拼贴版!
            </p>
          </div>

          {/* Draggable Sandbox canvas */}
          <div className="flex-1 min-h-[300px] border border-dashed border-neutral-800 rounded-2xl relative my-4 overflow-hidden bg-neutral-950/40">
            
            {STICKERS.map((st) => (
              <motion.div
                key={st.id}
                drag
                dragConstraints={{ left: 10, right: 300, top: 10, bottom: 250 }}
                whileDrag={{ scale: 1.1, rotate: 10 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => sounds.playClick()}
                style={{ top: st.y, left: st.x }}
                className={`absolute p-3 rounded-2xl border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-grab active:cursor-grabbing select-none text-left flex flex-col items-start ${st.color} w-32`}
                data-cursor-type="drag"
              >
                <span className="text-2xl inline-block mb-1">{st.content}</span>
                <span className="text-[10px] uppercase font-mono font-black tracking-wider leading-none">
                  {st.label}
                </span>
                <span className="text-[8px] opacity-65 font-mono leading-none mt-0.5">DRAG ME</span>
              </motion.div>
            ))}

            {/* Instruction background placeholder */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5 scroll-smooth">
              <span className="text-white text-5xl font-black italic tracking-widest font-mono">SANDBOX</span>
            </div>
          </div>

          <div className="text-left text-[10px] font-mono text-neutral-500">
            SYS STATUS: ONLINE | REAL TIME physics via framer-motion physics engine
          </div>
        </div>

        {/* RIGHT COLUMN: AI CONSOLE CHAT */}
        <div className="reveal-on-scroll lg:col-span-7 bg-neutral-950/70 border border-neutral-800 rounded-[32px] p-6 flex flex-col justify-between min-h-[500px]">
          
          {/* AI Terminal Head */}
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3 select-none">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff3059] animate-ping" />
              <div className="text-left">
                <span className="font-mono text-xs font-bold block leading-none">ZHILIN EXPERIENCE ASSISTANT</span>
                <span className="font-mono text-[9px] text-[#d2ff55] leading-none mt-1 inline-block">ENGINE: GEMINI SERVER COGNITIVE</span>
              </div>
            </div>

            <div className="text-right text-[10px] font-mono text-neutral-500">
              SYS VER: v4.11
            </div>
          </div>

          {/* Messages screen */}
          <div 
            ref={scrollRef}
            className="flex-1 my-4 overflow-y-auto max-h-[340px] space-y-4 pr-2 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent text-left"
          >
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center space-x-1 mb-1 font-mono text-[9px] text-neutral-500 select-none">
                  <span>{m.sender === 'user' ? 'YOU' : 'ZHILIN AI'}</span>
                  <span>●</span>
                  <span>{m.timestamp}</span>
                </div>
                <div 
                  className={`p-3 max-w-lg rounded-2xl text-xs font-medium leading-relaxed border shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-[#5c56fb]/15 border-[#5c56fb]/30 text-white rounded-tr-none'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex flex-col items-start select-none">
                <span className="font-mono text-[9px] text-neutral-500 mb-1">ZHILIN AI IS THINKING...</span>
                <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl rounded-tl-none flex space-x-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d2ff55] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff55bb] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b388ff] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input control box */}
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="提问：关于教育经验、ComfyUI流程、项目履历..."
              className="flex-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 focus:border-[#d2ff55] focus:ring-1 focus:ring-[#d2ff55] text-xs px-4 py-3 rounded-xl outline-none placeholder-neutral-500 font-sans transition-all"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#d2ff55] hover:bg-[#c3ec44] text-black font-mono font-black text-xs px-5 py-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 tracking-wider flex items-center justify-center uppercase"
            >
              SEND 🚀
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
