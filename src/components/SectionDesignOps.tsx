import { useRef } from 'react';
import { motion } from 'motion/react';
import OrbitImages from './OrbitImages';

const ORBIT_IMAGES = [
  '/assets/works-grid/01.jpg',
  '/assets/works-grid/02.jpg',
  '/assets/works-grid/03.jpg',
  '/assets/works-grid/04.jpg',
  '/assets/works-grid/05.jpg',
  '/assets/works-grid/06.jpg',
  '/assets/works-grid/07.jpg',
  '/assets/works-grid/08.jpg',
];

const THINKING_POINTS = [
  { label: '用户场景拆解', desc: '从真实使用情境出发，提炼情绪指标与核心氛围要素。' },
  { label: 'Prompt 结构化', desc: '构建可复用、易迭代的多层 Prompt 架构体系。' },
  { label: 'ComfyUI 工作流', desc: '模块化节点流 + LoRA 精准控制，解决生成随机性。' },
  { label: '多端一致性交付', desc: '适配屏幕规格与亮暗主题，保证资产无瑕还原。' },
];

export default function SectionDesignOps() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen text-white overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #5b3a9e 0%, #6b47b5 15%, #7c54cc 30%, #8e5fe3 45%, #a06bf9 60%, #b378fa 75%, #c78dfb 90%, #d4a0fc 100%)',
      }}
    >
      {/* 微妙的纹理叠加 */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.8) 0%, transparent 1%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.6) 0%, transparent 1.5%)',
          backgroundSize: '80px 80px, 120px 120px',
        }}
      />

      {/* 微网格 */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* 主布局：左右分栏 */}
      <div className="relative z-10 w-full flex-1 flex flex-col lg:flex-row">
        {/* 左栏：文字内容 */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center px-8 md:px-16 pt-32 pb-16 lg:py-0">
          {/* 顶部标签 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#d2ff55]" />
            <span className="text-[10px] font-mono font-black text-[#d2ff55] tracking-[0.3em] uppercase">
              Design Thinking & AI Pipeline
            </span>
          </motion.div>

          {/* 大标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[min(14vw,130px)] md:text-[min(11vw,150px)] font-black tracking-[-0.04em] leading-[0.85] mb-6 text-white"
            style={{
              textShadow: '0 2px 40px rgba(168, 139, 250, 0.3)',
            }}
          >
            设计思考
          </motion.h1>

          {/* 描述文字 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-white/70 leading-relaxed max-w-lg mb-12"
          >
            AI 不是随机抽卡，而是一套可控的创意引擎。我们通过
            <b className="text-white/90">结构化 Prompt、ComfyUI 工作流与 LoRA 精准微调</b>，
            将 AIGC 从随机实验转变为可量产的设计工程体系。
          </motion.p>

          {/* 四个思考维度卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            {THINKING_POINTS.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                className="group relative p-4 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 backdrop-blur-sm"
              >
                <span className="font-mono text-[10px] font-black text-[#d2ff55] tracking-wider mb-1.5 block">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <h3 className="text-sm font-bold text-white mb-1">{point.label}</h3>
                <p className="text-[11px] text-white/50 leading-relaxed">{point.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 右栏：轨道动画 */}
        <div className="w-full lg:w-[58%] relative flex items-center justify-center min-h-[50vh] lg:min-h-screen">
          {/* 外层轨道 */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: 'translateX(-3%) translateY(-3%)' }}
          >
            <div className="w-[95%] md:w-[90%] max-w-[900px]">
              <OrbitImages
                images={ORBIT_IMAGES}
                shape="ellipse"
                radiusX={450}
                radiusY={95}
                rotation={-5}
                duration={36}
                itemSize={80}
                direction="normal"
                responsive={true}
                baseWidth={1000}
              />
            </div>
          </div>

          {/* 内层轨道 */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: 'translateX(10%) translateY(-5%)' }}
          >
            <div className="w-[65%] md:w-[60%] max-w-[600px]">
              <OrbitImages
                images={ORBIT_IMAGES.slice(0, 6)}
                shape="ellipse"
                radiusX={280}
                radiusY={65}
                rotation={6}
                duration={26}
                itemSize={60}
                direction="reverse"
                responsive={true}
                baseWidth={700}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 底部滚动字条 */}
      <div className="relative z-10 w-full border-t border-white/[0.06] py-3.5 overflow-hidden select-none">
        <div className="flex font-mono text-[9px] font-black tracking-[0.25em] uppercase text-white/30">
          <motion.div
            animate={{ x: ['-50%', '0%'] }}
            transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
            className="flex gap-14 whitespace-nowrap"
          >
            {[...Array(4)].map((_, i) => (
              <span key={i} className="flex items-center gap-14">
                <span>Design Thinking</span>
                <span className="text-[#d2ff55]">◆</span>
                <span>Structured Prompts</span>
                <span className="text-[#a78bfa]">◆</span>
                <span>ComfyUI Pipeline</span>
                <span className="text-[#c4b5fd]">◆</span>
                <span>LoRA Fine-Tuning</span>
                <span className="text-[#d2ff55]">◆</span>
                <span>AI Asset Delivery</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
