/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import './gsap-setup';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import Navigation from './components/Navigation';
import SectionHome from './components/SectionHome';
import SectionAbout from './components/SectionAbout';
import SectionWorksGrid from './components/SectionWorksGrid';
import SectionSplash from './components/SectionSplash';
import SectionDesignOps from './components/SectionDesignOps';
import SectionSandbox from './components/SectionSandbox';
import SectionContact from './components/SectionContact';


export default function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const isManualScrolling = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Active state Intersection Observer for tabs
  useEffect(() => {
    if (!loadingComplete) return;

    const sections = ['home', 'profile', 'splash', 'designops', 'sandbox', 'contact'];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isManualScrolling.current) {
            setActiveTab(id);
          }
        },
        {
          root: null,
          rootMargin: '-40% 0px -40% 0px',
          threshold: 0,
        }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) {
          obs.observer.unobserve(obs.el);
        }
      });
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [loadingComplete]);

  // Integrated GSAP ScrollTrigger context to safely animate on-scroll elements entering the viewport
  useEffect(() => {
    if (!loadingComplete) return;

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray('.reveal-on-scroll') as HTMLElement[];
      elements.forEach((el) => {
        gsap.fromTo(
          el,
          { 
            opacity: 0, 
            y: 45, 
            skewY: 1 // High-end tilt effect on scroll entrance
          },
          {
            opacity: 1,
            y: 0,
            skewY: 0,
            duration: 1.3,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%', // Starts the animation when the top of the element hits 88% of viewport height
              toggleActions: 'play none none none'
            }
          }
        );
      });
    });

    return () => ctx.revert();
  }, [loadingComplete]);

  // Smooth scroll handler using high-end GSAP transition (power4.out easing)
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    isManualScrolling.current = true;

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    const el = document.getElementById(tabId);
    if (el) {
      // Exquisite GSAP smooth scrollTo with beautiful deceleration (power4.out)
      gsap.to(window, {
        scrollTo: { y: el, offsetY: 64 },
        duration: 1.5,
        ease: 'power4.out',
        overwrite: 'auto'
      });
    }

    // Lock manual scrolling state until GSAP transition finishes
    scrollTimeoutRef.current = window.setTimeout(() => {
      isManualScrolling.current = false;
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white selection:bg-[#d2ff55] selection:text-black overflow-x-hidden relative scroll-smooth">
      
      {/* 1. Loading Preloader Gate */}
      <Preloader onComplete={() => setLoadingComplete(true)} />

      {/* 2. Custom Magnetic Cursor */}
      <CustomCursor />

      {/* Only render main app content once loading finishes */}
      {loadingComplete && (
        <div className="flex flex-col min-h-screen relative">
          
          {/* Navigation Bar */}
          <Navigation activeTab={activeTab} setActiveTab={handleTabChange} />

          {/* Main Interactive Screen with Stacked Smooth Reveal */}
          <main className="flex-1 w-full flex flex-col relative pt-14">
            <motion.div
              initial={{ 
                clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                filter: 'blur(10px)',
                opacity: 0 
              }}
              animate={{ 
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                filter: 'blur(0px)',
                opacity: 1 
              }}
              transition={{ 
                duration: 1.2, 
                ease: [0.76, 0, 0.24, 1] 
              }}
              className="w-full flex flex-col"
            >
              <div id="home" className="scroll-mt-14 md:scroll-mt-16 w-full">
                <SectionHome />
              </div>
              <div id="profile" className="scroll-mt-14 md:scroll-mt-16 w-full">
                <SectionAbout />
              </div>
              <div id="splash" className="scroll-mt-14 md:scroll-mt-16 w-full">
                <SectionWorksGrid />
                <SectionSplash />
              </div>
              <div id="designops" className="scroll-mt-14 md:scroll-mt-16 w-full">
                <SectionDesignOps />
              </div>
              <div id="sandbox" className="scroll-mt-14 md:scroll-mt-16 w-full">
                <SectionSandbox />
              </div>
              <div id="contact" className="scroll-mt-14 md:scroll-mt-16 w-full">
                <SectionContact />
              </div>
            </motion.div>
          </main>

          {/* Footer view indicators (Mobile/UX helpful quick links) */}
          <footer className="bg-neutral-950 border-t border-neutral-900/40 py-6 px-4 md:px-12 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-neutral-500 select-none z-20">
            <div className="mb-4 sm:mb-0">
              © 2026 YANG ZHILIN ● BRANDED EXPERIENCES & DESIGN RESEARCH
            </div>

            {/* Quick tab jumper list */}
            <div className="flex flex-wrap justify-center gap-4 text-[10px]">
              <button 
                onClick={() => handleTabChange('home')} 
                className={`hover:text-white transition-colors uppercase ${activeTab === 'home' ? 'text-[#d2ff55] font-black' : ''}`}
              >
                00 探索首页
              </button>
              <span>|</span>
              <button 
                onClick={() => handleTabChange('profile')} 
                className={`hover:text-white transition-colors uppercase ${activeTab === 'profile' ? 'text-[#d2ff55] font-black' : ''}`}
              >
                01 个人简介
              </button>
              <span>|</span>
              <button
                onClick={() => handleTabChange('splash')}
                className={`hover:text-white transition-colors uppercase ${activeTab === 'splash' ? 'text-[#d2ff55] font-black' : ''}`}
              >
                02 创意作品
              </button>
              <span>|</span>
              <button
                onClick={() => handleTabChange('designops')}
                className={`hover:text-white transition-colors uppercase ${activeTab === 'designops' ? 'text-[#d2ff55] font-black' : ''}`}
              >
                03 设计工程
              </button>
              <span>|</span>
              <button
                onClick={() => handleTabChange('sandbox')}
                className={`hover:text-white transition-colors uppercase ${activeTab === 'sandbox' ? 'text-[#d2ff55] font-black' : ''}`}
              >
                04 AI实验室
              </button>
              <span>|</span>
              <button
                onClick={() => handleTabChange('contact')}
                className={`hover:text-white transition-colors uppercase ${activeTab === 'contact' ? 'text-[#d2ff55] font-black' : ''}`}
              >
                05 联络合作
              </button>
            </div>
          </footer>

        </div>
      )}

    </div>
  );
}
