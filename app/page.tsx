"use client";

import { useEffect, useRef, useState } from "react";
import { mapRange } from "@/lib/animation";
import {
  Loader,
  Background,
  Navigation,
  Hero,
  Chapters,
  Prizes,
  Timeline,
  Partners,
  Team,
  FAQ,
  CTA,
  Connect,
} from "@/components/sections";

const FRAME_COUNT = 1265;

const SECTION_TIMING = {
  hero: { fadeStart: 0.04, end: 0.08 },
  chapters: { start: 0.07, inEnd: 0.09, outStart: 0.16, outEnd: 0.17, end: 0.18 },
  prizes: { start: 0.17, inEnd: 0.20, outStart: 0.25, outEnd: 0.26, end: 0.27 },
  timeline: { start: 0.28, inEnd: 0.29, holdStart: 0.32, scrollEnd: 0.46, outStart: 0.48, outEnd: 0.50, end: 0.50 },
  partners: { start: 0.51, inEnd: 0.52, holdStart: 0.53, scrollEnd: 0.59, outStart: 0.595, outEnd: 0.6, end: 0.6 },
  team: { start: 0.615, inEnd: 0.62, outStart: 0.75, outEnd: 0.79, end: 0.79 },
  faq: { start: 0.78, inEnd: 0.80, pointerStart: 0.81, pointerEnd: 0.87, outStart: 0.86, outEnd: 0.89, end: 0.89 },
  cta: { start: 0.92, inEnd: 0.95, end: 1.0 },
};

export default function Home() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Sailing through the river..");
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [isLoaderRemoved, setIsLoaderRemoved] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const partCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const currentScroll = useRef(0);
  const targetScroll = useRef(0);
  const lastDrawnFrame = useRef(-1);
  const lastActiveIndex = useRef(-1);
  const bitmapsRef = useRef<Map<number, ImageBitmap>>(new Map());
  const layoutMetrics = useRef({ width: 0, height: 0, maxScroll: 1 });

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const dialWindowRef = useRef<HTMLDivElement>(null);
  const dialItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const scrollArrowRef = useRef<HTMLDivElement>(null);
  const swipeArrowRef = useRef<HTMLDivElement>(null);

  const heroLayerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  const chaptersLayerRef = useRef<HTMLDivElement>(null);
  const chaptersContentRef = useRef<HTMLDivElement>(null);
  const chaptersTitleRef = useRef<HTMLHeadingElement>(null);
  const chapterCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const prizesLayerRef = useRef<HTMLDivElement>(null);
  const prizesContentRef = useRef<HTMLDivElement>(null);

  const timelineLayerRef = useRef<HTMLDivElement>(null);
  const timelineTrackRef = useRef<HTMLDivElement>(null);

  const partnersLayerRef = useRef<HTMLDivElement>(null);
  const partnersContentRef = useRef<HTMLDivElement>(null);

  const teamLayerRef = useRef<HTMLDivElement>(null);
  const teamTrackRef = useRef<HTMLDivElement>(null);

  const faqLayerRef = useRef<HTMLDivElement>(null);
  const faqTitleRef = useRef<HTMLHeadingElement>(null);
  const faqItemsRef = useRef<(HTMLDetailsElement | null)[]>([]);

  const ctaLayerRef = useRef<HTMLDivElement>(null);
  const ctaTextRef = useRef<HTMLDivElement>(null);
  const connectLayerRef = useRef<HTMLDivElement>(null);

  // --- PRELOADER (Web Worker) ---
  useEffect(() => {
    const worker = new Worker("/preloader.worker.js");

    worker.postMessage({
      firstCount: 600,
      totalFrames: FRAME_COUNT,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    });

    let hideTimer: ReturnType<typeof setTimeout>;
    let removeTimer: ReturnType<typeof setTimeout>;

    const stories = [
      "Sailing through the river..",
      "Decoding the secret map..",
      "By passing the ancient traps..",
      "Opening the hidden gates..",
      "Entering the codesplash arena..",
    ];
    let storyIndex = 0;
    const storyInterval = setInterval(() => {
      storyIndex = (storyIndex + 1) % stories.length;
      setLoadingText(stories[storyIndex]);
    }, 1200);

    worker.onmessage = (e: MessageEvent) => {
      const { type } = e.data;

      if (type === "progress") {
        const pct = (e.data.loaded / e.data.total) * 100;
        setLoadProgress(Math.min(pct, 100));
      } else if (type === "firstBatchComplete") {
        setLoadProgress(100);
        hideTimer = setTimeout(() => {
          setIsLoaderVisible(false);
          removeTimer = setTimeout(() => setIsLoaderRemoved(true), 600);
        }, 2000);
      } else if (type === "bitmaps") {
        for (const item of e.data.items) {
          bitmapsRef.current.set(item.frame, item.bitmap);
        }
      }
    };

    return () => {
      worker.terminate();
      clearInterval(storyInterval);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // --- ANIMATION ENGINE ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.scrollTo(0, 0);
    targetScroll.current = 0;
    currentScroll.current = 0;

    const bgCanvas = bgCanvasRef.current;
    const partCanvas = partCanvasRef.current;
    if (!bgCanvas || !partCanvas) return;

    const bgCtx = bgCanvas.getContext("2d", { alpha: false });
    const pCtx = partCanvas.getContext("2d");
    if (!bgCtx || !pCtx) return;

    bgCanvas.width = 1920;
    bgCanvas.height = 1080;

    let particles: Array<{
      x: number; y: number; baseX: number; baseY: number;
      size: number; density: number; alpha: number;
    }> = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 140 };

    const updateMetrics = () => {
      layoutMetrics.current.width = window.innerWidth;
      layoutMetrics.current.height = window.innerHeight;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      layoutMetrics.current.maxScroll = maxScroll <= 0 ? 1 : maxScroll;
    };

    const initParticles = () => {
      updateMetrics();
      partCanvas.width = window.innerWidth;
      partCanvas.height = window.innerHeight;
      particles = [];
      const particleDensity = Math.min(Math.floor(window.innerWidth / 14), 80);
      for (let i = 0; i < particleDensity; i++) {
        particles.push({
          x: Math.random() * partCanvas.width,
          y: Math.random() * partCanvas.height,
          baseX: Math.random() * partCanvas.width,
          baseY: Math.random() * partCanvas.height,
          size: Math.random() * 2 + 1,
          density: Math.random() * 30 + 10,
          alpha: Math.random() * 0.05 + 0.01,
        });
      }
    };

    initParticles();
    const metricsTimer = setTimeout(updateMetrics, 500);

    const handleResize = () => { updateMetrics(); initParticles(); };
    const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseLeave = () => { mouse.x = null; mouse.y = null; };
    const handleScroll = () => { targetScroll.current = window.scrollY; };
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        window.scrollBy({ top: e.deltaX * 0.8, behavior: 'auto' });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });

    const updateParticles = () => {
      pCtx.clearRect(0, 0, partCanvas.width, partCanvas.height);
      for (const p of particles) {
        p.baseY -= 0.2;
        if (p.baseY < -10) p.baseY = partCanvas.height + 10;
        p.baseX += Math.sin(p.baseY / 30) * 0.1;

        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            p.x -= forceDirectionX * force * p.density;
            p.y -= forceDirectionY * force * p.density;
          } else {
            if (p.x !== p.baseX) p.x += (p.baseX - p.x) * 0.08;
            if (p.y !== p.baseY) p.y += (p.baseY - p.y) * 0.08;
          }
        } else {
          if (p.x !== p.baseX) p.x += (p.baseX - p.x) * 0.08;
          if (p.y !== p.baseY) p.y += (p.baseY - p.y) * 0.08;
        }

        pCtx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fill();
      }
    };

    const updateDialCenter = (activeIndex: number) => {
      const activeItem = dialItemsRef.current[activeIndex];
      if (!activeItem || !dialWindowRef.current) return;
      const itemCenter = activeItem.offsetLeft + activeItem.offsetWidth / 2;
      const scrollPos = itemCenter - layoutMetrics.current.width / 2;
      dialWindowRef.current.scrollTo({ left: scrollPos, behavior: "smooth" });
    };

    const renderLoop = () => {
      const maxScroll = layoutMetrics.current.maxScroll;
      const innerWidth = layoutMetrics.current.width;
      const innerHeight = layoutMetrics.current.height;
      const isDesktop = innerWidth >= 768;
      const t = SECTION_TIMING;

      currentScroll.current += (targetScroll.current - currentScroll.current) * 0.12;
      const sp = Math.min(Math.max(currentScroll.current / maxScroll, 0), 1);

      if (scrollArrowRef.current) {
        scrollArrowRef.current.style.opacity = sp < 0.02 ? "1" : "0";
        scrollArrowRef.current.style.pointerEvents = sp < 0.02 ? "auto" : "none";
      }
      if (swipeArrowRef.current) {
        swipeArrowRef.current.style.opacity = sp < 0.02 ? "1" : "0";
        swipeArrowRef.current.style.pointerEvents = sp < 0.02 ? "auto" : "none";
      }

      const frameIndex = Math.floor(sp * (FRAME_COUNT - 1));
      const bitmap = bitmapsRef.current.get(frameIndex + 1);
      if (bitmap) {
        if (frameIndex !== lastDrawnFrame.current) {
          bgCtx.drawImage(bitmap, 0, 0, bgCanvas.width, bgCanvas.height);
          lastDrawnFrame.current = frameIndex;
        }
      }
      updateParticles();

      let activeIndex = 0;
      if (sp < 0.08) activeIndex = 0;
      else if (sp < 0.18) activeIndex = 1;
      else if (sp < 0.27) activeIndex = 2;
      else if (sp < 0.50) activeIndex = 3;
      else if (sp < 0.615) activeIndex = 4;
      else if (sp < 0.79) activeIndex = 5;
      else if (sp < 0.89) activeIndex = 6;
      else if (sp < 1.0) activeIndex = 7;
      else activeIndex = 8;

      if (activeIndex !== lastActiveIndex.current) {
        lastActiveIndex.current = activeIndex;
        dialItemsRef.current.forEach((item, index) => {
          if (!item) return;
          item.classList.remove("active", "sibling");
          const dist = Math.abs(index - activeIndex);
          if (dist === 0) item.classList.add("active");
          else if (dist === 1) item.classList.add("sibling");
        });
        updateDialCenter(activeIndex);
      }

      // 1. HERO
      if (heroLayerRef.current && heroContentRef.current) {
        if (sp <= t.hero.end) {
          const op = mapRange(sp, t.hero.fadeStart, t.hero.end, 1, 0);
          heroLayerRef.current.style.opacity = op.toString();
          heroLayerRef.current.style.pointerEvents = "auto";
          heroLayerRef.current.style.zIndex = "50";
          heroLayerRef.current.style.transform = "translate3d(0, 0, 0)";
        } else {
          heroLayerRef.current.style.transform = "translate3d(0, -50vh, 0)";
          heroLayerRef.current.style.opacity = "0";
          heroLayerRef.current.style.pointerEvents = "none";
          heroLayerRef.current.style.zIndex = "10";
        }
      }

      // 2. CHAPTERS
      if (chaptersLayerRef.current && chaptersContentRef.current) {
        if (sp >= t.chapters.start && sp <= t.chapters.end) {
          let op = 1;
          if (sp < t.chapters.inEnd) {
            op = mapRange(sp, t.chapters.start, t.chapters.inEnd, 0, 1);
            if (isDesktop) {
              const groupTx = mapRange(sp, t.chapters.start, t.chapters.inEnd, innerWidth * 0.3, 0);
              const clipRight = mapRange(sp, t.chapters.start, t.chapters.inEnd, 72, 0);
              chaptersContentRef.current.style.transform = `translate3d(${groupTx}px, 0, 0)`;
              chaptersContentRef.current.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
            } else {
              const groupTx = mapRange(sp, t.chapters.start, t.chapters.inEnd, innerWidth, 0);
              chaptersContentRef.current.style.transform = `translate3d(${groupTx}px, 0, 0)`;
              chaptersContentRef.current.style.clipPath = 'none';
            }
            if (chaptersTitleRef.current) chaptersTitleRef.current.style.transform = 'translate3d(0, 0, 0)';
            chapterCardsRef.current.forEach(el => { if (el) el.style.transform = 'translate3d(0, 0, 0)'; });
          } else if (sp > t.chapters.outStart) {
            op = mapRange(sp, t.chapters.outStart, t.chapters.outEnd, 1, 0);
            chaptersContentRef.current.style.transform = `translate3d(0, 0, 0)`;
            chaptersContentRef.current.style.clipPath = 'none';
            const outProg = mapRange(sp, t.chapters.outStart, t.chapters.outEnd, 0, 1);
            const titleY = -innerHeight * 0.5 * outProg;
            if (chaptersTitleRef.current) chaptersTitleRef.current.style.transform = `translate3d(0, ${titleY}px, 0)`;
            if (isDesktop) {
              if (chapterCardsRef.current[0]) chapterCardsRef.current[0].style.transform = `translate3d(${outProg * -innerWidth * 0.5}px, 0, 0)`;
              if (chapterCardsRef.current[1]) chapterCardsRef.current[1].style.transform = `translate3d(0, ${outProg * -innerHeight * 0.5}px, 0)`;
              if (chapterCardsRef.current[2]) chapterCardsRef.current[2].style.transform = `translate3d(${outProg * innerWidth * 0.5}px, 0, 0)`;
            } else {
              if (chapterCardsRef.current[0]) chapterCardsRef.current[0].style.transform = `translate3d(0, ${outProg * -innerHeight * 0.5}px, 0)`;
              if (chapterCardsRef.current[1]) chapterCardsRef.current[1].style.transform = `translate3d(${outProg * -innerWidth * 0.5}px, 0, 0)`;
              if (chapterCardsRef.current[2]) chapterCardsRef.current[2].style.transform = `translate3d(${outProg * innerWidth * 0.5}px, 0, 0)`;
            }
          } else {
            chaptersContentRef.current.style.transform = `translate3d(0, 0, 0)`;
            chaptersContentRef.current.style.clipPath = 'none';
            if (chaptersTitleRef.current) chaptersTitleRef.current.style.transform = 'translate3d(0, 0, 0)';
            chapterCardsRef.current.forEach(el => { if (el) el.style.transform = 'translate3d(0, 0, 0)'; });
          }
          chaptersLayerRef.current.style.opacity = op.toString();
          chaptersLayerRef.current.style.pointerEvents = op > 0.05 ? "auto" : "none";
          chaptersLayerRef.current.style.zIndex = op > 0.05 ? "50" : "10";
        } else {
          chaptersLayerRef.current.style.opacity = "0";
          chaptersLayerRef.current.style.pointerEvents = "none";
          chaptersLayerRef.current.style.zIndex = "10";
        }
      }

      // 3. PRIZES
      if (prizesLayerRef.current && prizesContentRef.current) {
        if (sp >= t.prizes.start && sp <= t.prizes.end) {
          let op = 1, s = 1;
          if (sp < t.prizes.inEnd) {
            op = mapRange(sp, t.prizes.start, t.prizes.inEnd, 0, 1);
            s = mapRange(sp, t.prizes.start, t.prizes.inEnd, 0.9, 1);
          } else if (sp > t.prizes.outStart) {
            op = mapRange(sp, t.prizes.outStart, t.prizes.outEnd, 1, 0);
            s = mapRange(sp, t.prizes.outStart, t.prizes.outEnd, 1, 1.1);
          }
          prizesLayerRef.current.style.opacity = op.toString();
          prizesLayerRef.current.style.pointerEvents = op > 0.05 ? "auto" : "none";
          prizesContentRef.current.style.transform = `scale(${s})`;
        } else {
          prizesLayerRef.current.style.opacity = "0";
          prizesLayerRef.current.style.pointerEvents = "none";
        }
      }

      // 4. TIMELINE
      if (timelineLayerRef.current && timelineTrackRef.current) {
        if (sp >= t.timeline.start && sp <= t.timeline.end) {
          let op = 1;
          if (sp < t.timeline.inEnd) op = mapRange(sp, t.timeline.start, t.timeline.inEnd, 0, 1);
          else if (sp > t.timeline.outStart) op = mapRange(sp, t.timeline.outStart, t.timeline.outEnd, 1, 0);
          timelineLayerRef.current.style.opacity = op.toString();
          timelineLayerRef.current.style.pointerEvents = op > 0.05 ? "auto" : "none";
          let scrollY = 0;
          if (sp < t.timeline.holdStart) {
            scrollY = mapRange(sp, t.timeline.start, t.timeline.holdStart, 15, 0);
          } else if (sp < t.timeline.scrollEnd) {
            scrollY = mapRange(sp, t.timeline.holdStart, t.timeline.scrollEnd, 0, -71);
          } else if (sp < t.timeline.outStart) {
            scrollY = -71;
          } else {
            scrollY = mapRange(sp, t.timeline.outStart, t.timeline.end, -71, -80);
          }
          timelineTrackRef.current.style.transform = `translate3d(0, ${scrollY}%, 0)`;
        } else {
          timelineLayerRef.current.style.opacity = "0";
          timelineLayerRef.current.style.pointerEvents = "none";
        }
      }

      // 5. PARTNERS
      if (partnersLayerRef.current && partnersContentRef.current) {
        if (sp >= t.partners.start && sp <= t.partners.end) {
          let op = 1;
          if (sp < t.partners.inEnd) op = mapRange(sp, t.partners.start, t.partners.inEnd, 0, 1);
          else if (sp > t.partners.outStart) op = mapRange(sp, t.partners.outStart, t.partners.outEnd, 1, 0);
          partnersLayerRef.current.style.opacity = op.toString();
          partnersLayerRef.current.style.pointerEvents = op > 0.05 ? "auto" : "none";
          partnersLayerRef.current.style.zIndex = op > 0.05 ? "50" : "10";
          let scrollY = 0;
          if (sp < t.partners.holdStart) {
            scrollY = mapRange(sp, t.partners.start, t.partners.holdStart, 15, 0);
          } else if (sp < t.partners.scrollEnd) {
            scrollY = mapRange(sp, t.partners.holdStart, t.partners.scrollEnd, 0, -68);
          } else if (sp < t.partners.outStart) {
            scrollY = -68;
          } else {
            scrollY = mapRange(sp, t.partners.outStart, t.partners.end, -68, -80);
          }
          partnersContentRef.current.style.transform = `translate3d(0, ${scrollY}%, 0)`;
        } else {
          partnersLayerRef.current.style.opacity = "0";
          partnersLayerRef.current.style.pointerEvents = "none";
          partnersLayerRef.current.style.zIndex = "10";
        }
      }

      // 6. TEAM
      if (teamLayerRef.current && teamTrackRef.current) {
        if (sp >= t.team.start && sp <= t.team.end) {
          let op = 1;
          if (sp < t.team.inEnd) op = mapRange(sp, t.team.start, t.team.inEnd, 0, 1);
          else if (sp > t.team.outStart) op = mapRange(sp, t.team.outStart, t.team.outEnd, 1, 0);
          teamLayerRef.current.style.opacity = op.toString();
          teamLayerRef.current.style.pointerEvents = op > 0.05 ? "auto" : "none";
          teamLayerRef.current.style.zIndex = op > 0.05 ? "50" : "10";
          let startPx: number, endPx: number;
          if (innerWidth < 768) {
            startPx = -130;
            endPx = -1762;
          } else {
            const cardHalfWidth = 160;
            startPx = -cardHalfWidth;
            endPx = startPx - innerWidth * 1.5;
          }
          const tx = mapRange(sp, t.team.inEnd, t.team.end, startPx, endPx);
          teamTrackRef.current.style.transform = `translate3d(${tx}px, 0, 0)`;
        } else {
          teamLayerRef.current.style.opacity = "0";
          teamLayerRef.current.style.pointerEvents = "none";
          teamLayerRef.current.style.zIndex = "10";
        }
      }

      // 7. FAQ
      if (faqLayerRef.current && faqTitleRef.current) {
        if (sp >= t.faq.start && sp <= t.faq.end) {
          const opMain = sp > t.faq.pointerStart && sp < t.faq.pointerEnd ? 1 : 0;
          faqLayerRef.current.style.opacity = "1";
          faqLayerRef.current.style.pointerEvents = opMain ? "auto" : "none";
          faqLayerRef.current.style.zIndex = opMain ? "50" : "10";
          let titleOp = 1;
          if (sp < t.faq.inEnd) titleOp = mapRange(sp, t.faq.start, t.faq.inEnd, 0, 1);
          else if (sp > t.faq.outStart) titleOp = mapRange(sp, t.faq.outStart, t.faq.outEnd, 1, 0);
          faqTitleRef.current.style.opacity = titleOp.toString();
          const inProgress = mapRange(sp, t.faq.start, t.faq.inEnd, 0, 1);
          const outProgress = mapRange(sp, t.faq.outStart, t.faq.outEnd, 0, 1);
          faqItemsRef.current.forEach((item, idx) => {
            if (!item) return;
            const dir = idx % 2 === 0 ? -1 : 1;
            const startX = 60 * dir;
            let currentX = 0;
            let currentOp = 1;
            if (sp < t.faq.inEnd) {
              currentX = mapRange(inProgress, 0, 1, startX, 0);
              currentOp = mapRange(inProgress, 0, 1, 0, 1);
            } else if (sp > t.faq.outStart) {
              currentX = mapRange(outProgress, 0, 1, 0, startX);
              currentOp = mapRange(outProgress, 0, 1, 1, 0);
            }
            item.style.transform = `translate3d(${currentX}vw, 0, 0)`;
            item.style.opacity = currentOp.toString();
            item.style.pointerEvents = currentOp > 0.1 ? "auto" : "none";
          });
        } else {
          faqLayerRef.current.style.opacity = "0";
          faqLayerRef.current.style.pointerEvents = "none";
          faqLayerRef.current.style.zIndex = "10";
        }
      }

      // 8. CTA & CONNECT
      if (ctaLayerRef.current && ctaTextRef.current && canvasWrapperRef.current && connectLayerRef.current) {
        if (sp >= t.cta.start) {
          ctaLayerRef.current.style.opacity = "1";
          ctaLayerRef.current.style.pointerEvents = "auto";
          let op = 1, s = 1;
          if (sp < t.cta.inEnd) {
            op = mapRange(sp, t.cta.start, t.cta.inEnd, 0, 1);
            s = mapRange(sp, t.cta.start, t.cta.inEnd, 0.8, 1);
          }
          let pushUpY = 0;
          if (sp >= t.cta.inEnd) {
            pushUpY = mapRange(sp, t.cta.inEnd, t.cta.end, 0, -15);
          }
          ctaTextRef.current.style.opacity = op.toString();
          const mobileOffset = innerWidth < 768 ? 15 : 5;
          ctaTextRef.current.style.transform = `translate3d(-50%, calc(-50% + ${pushUpY}vh - ${mobileOffset}vh), 0) scale(${s})`;
          canvasWrapperRef.current.style.transform = `translate3d(0, ${pushUpY}vh, 0)`;
          if (sp >= t.cta.inEnd) {
            const connectY = mapRange(sp, t.cta.inEnd, t.cta.end, 120, 0);
            connectLayerRef.current.style.transform = `translate3d(0, ${connectY}%, 0)`;
            connectLayerRef.current.style.pointerEvents = "auto";
          } else {
            connectLayerRef.current.style.transform = `translate3d(0, 120%, 0)`;
            connectLayerRef.current.style.pointerEvents = "none";
          }
        } else {
          ctaLayerRef.current.style.opacity = "0";
          ctaLayerRef.current.style.pointerEvents = "none";
          canvasWrapperRef.current.style.transform = `translate3d(0, 0, 0)`;
          connectLayerRef.current.style.transform = `translate3d(0, 200%, 0)`;
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(metricsTimer);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleDialClick = (targetPercentage: number) => {
    const maxScroll = layoutMetrics.current.maxScroll;
    window.scrollTo({ top: targetPercentage * maxScroll, behavior: "smooth" });
  };

  const jumpToCurrentWeek = () => {
    const maxScroll = layoutMetrics.current.maxScroll;
    window.scrollTo({ top: 0.37 * maxScroll, behavior: "smooth" });
  };

  const handlePrizeFlip = (e: React.MouseEvent<HTMLDivElement>) => {
    const innerCard = e.currentTarget.querySelector('.flip-card-inner') as HTMLDivElement;
    if (innerCard) {
      innerCard.style.transform = innerCard.style.transform === 'rotateY(180deg)' ? '' : 'rotateY(180deg)';
    }
  };

  return (
    <>
      <style>{`
        @keyframes bounceHorizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(25%); }
        }
        .animate-bounce-x {
          animation: bounceHorizontal 1s infinite;
        }
        .timeline-node.current .t-card {
          border-color: #ff6b00 !important;
          box-shadow: 0 0 15px rgba(255, 107, 0, 0.3) !important;
        }
        .timeline-node .current-badge {
          display: none;
        }
        .timeline-node.current .current-badge {
          display: block;
        }
      `}</style>

      {!isLoaderRemoved && (
        <Loader
          loadProgress={loadProgress}
          loadingText={loadingText}
          isLoaderVisible={isLoaderVisible}
        />
      )}

      <Background
        canvasWrapperRef={canvasWrapperRef}
        bgCanvasRef={bgCanvasRef}
        partCanvasRef={partCanvasRef}
      />

      <Navigation
        dialWindowRef={dialWindowRef}
        dialItemsRef={dialItemsRef}
        onDialClick={handleDialClick}
      />

      <main style={{ height: '900vh' }}>
        <div className="absolute top-0 left-0 w-full pointer-events-none -z-50 opacity-0" style={{ height: '800vh' }}></div>

        <Hero
          ref={heroLayerRef}
          contentRef={heroContentRef}
          scrollArrowRef={scrollArrowRef}
          onRegister={() => handleDialClick(0.95)}
          onOngoing={jumpToCurrentWeek}
        />

        <Chapters
          ref={chaptersLayerRef}
          contentRef={chaptersContentRef}
          titleRef={chaptersTitleRef}
          cardsRef={chapterCardsRef}
        />

        <Prizes
          ref={prizesLayerRef}
          contentRef={prizesContentRef}
          onPrizeFlip={handlePrizeFlip}
        />

        <Timeline
          ref={timelineLayerRef}
          trackRef={timelineTrackRef}
        />

        <Partners
          ref={partnersLayerRef}
          contentRef={partnersContentRef}
        />

        <Team
          ref={teamLayerRef}
          trackRef={teamTrackRef}
        />

        <FAQ
          ref={faqLayerRef}
          titleRef={faqTitleRef}
          itemsRef={faqItemsRef}
        />

        <CTA
          ref={ctaLayerRef}
          textRef={ctaTextRef}
          isDropdownOpen={isDropdownOpen}
          onToggleDropdown={() => setIsDropdownOpen(prev => !prev)}
        />

        <Connect ref={connectLayerRef} />
      </main>
    </>
  );
}
