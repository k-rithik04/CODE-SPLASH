"use client";

/*
 * Main Landing Page — CodeSplash 2026
 * =====================================
 * Portfolio project by Rithika, Pahan, and Yasiru
 * https://codesplash.cssa.lk
 *
 * Original idea & base code: https://github.com/JanishkaM/code-splash-web (pahan-demo2, performance-updates)
 * Personal development:     https://github.com/k-rithik04/CODE-SPLASH
 * Production deployment:    https://github.com/cssa-uok/code-splash
 *
 * Scroll-driven canvas animation (1265 frames), particle system,
 * and section transitions powered by GSAP + Lenis smooth scroll.
 * Sections: Hero → Prizes → Timeline → Partners → Team → FAQ → CTA → Connect
 */

import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { mapRange } from "@/lib/animation";
import { useCMSData } from "@/lib/useCMSData";
import { useLenis } from "@/components/SmoothScroll";
import { isMobileDevice } from "@/lib/device-detection";
import { getFrameUrl } from "@/lib/frame-resolver";
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

const FRAME_COUNT = 1514;

const SECTION_TIMING = {
  hero: { fadeStart: 0.04, end: 0.08 },
  chapters: { start: 0.075, inEnd: 0.09, outStart: 0.135, outEnd: 0.145, end: 0.155 },
  prizes: { start: 0.15, inEnd: 0.17, outStart: 0.20, outEnd: 0.21, end: 0.22 },
  timeline: { start: 0.215, inEnd: 0.23, holdStart: 0.24, scrollEnd: 0.38, outStart: 0.39, outEnd: 0.41, end: 0.42 },
  partners: { start: 0.42, inEnd: 0.44, holdStart: 0.445, scrollEnd: 0.63, outStart: 0.635, outEnd: 0.65, end: 0.645 },
  team: { start: 0.635, inEnd: 0.65, outStart: 0.78, outEnd: 0.805, end: 0.81 },
  faq: { start: 0.805, inEnd: 0.825, pointerStart: 0.84, pointerEnd: 0.88, outStart: 0.895, outEnd: 0.915, end: 0.92 },
  cta: { start: 0.915, inEnd: 0.94, end: 1.0 },
};

export default function Home() {
  const cms = useCMSData();
  const lenis = useLenis();
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Sailing through the river..");
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [isLoaderRemoved, setIsLoaderRemoved] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const frame1DrawnRef = useRef(false);
  const cmsIsLoadedRef = useRef(false);

  useEffect(() => {
    cmsIsLoadedRef.current = cms.isLoaded;
  }, [cms.isLoaded]);

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const partCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lenisRef = useRef<Lenis | null>(null);
  const engineInitRef = useRef(false);
  const lastDrawnFrame = useRef(-1);
  const lastActiveIndex = useRef(-1);
  const imagesRef = useRef<Map<number, ImageBitmap>>(new Map());
  const pendingLoadsRef = useRef<Set<number>>(new Set());
  const layoutMetrics = useRef({ width: 0, height: 0, maxScroll: 1, partnersMaxScrollY: -68, timelineMaxScrollY: -71 });

  function bitmapLruInsert(frame: number, bitmap: ImageBitmap, isMobile: boolean) {
    const MAX_BITMAPS = isMobile ? 60 : 300;
    if (imagesRef.current.size >= MAX_BITMAPS) {
      let farthestKey = -1, farthestDist = -1;
      for (const [key] of imagesRef.current) {
        const dist = Math.abs(key - (lastDrawnFrame.current >= 0 ? lastDrawnFrame.current : 0));
        if (dist > farthestDist) { farthestDist = dist; farthestKey = key; }
      }
      if (farthestKey >= 0) {
        const old = imagesRef.current.get(farthestKey);
        if (old) old.close();
        imagesRef.current.delete(farthestKey);
      }
    }
    imagesRef.current.set(frame, bitmap);
  }

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
    const isMobile = isMobileDevice();

    worker.postMessage({
      firstCount: isMobile ? 150 : 600,
      totalFrames: FRAME_COUNT,
      mobileSkip: isMobile ? 5 : 1,
      isMobile: isMobile,
    });

    let hideTimer: ReturnType<typeof setTimeout>;
    let removeTimer: ReturnType<typeof setTimeout>;

    const stories = [
      "Sailing through the river...",
      "Decoding the secret map...",
      "Bypassing the ancient traps...",
      "Opening the hidden gates...",
      "Entering the CodeSplash arena...",
    ];
    let storyIndex = 0;
    const storyInterval = setInterval(() => {
      storyIndex = (storyIndex + 1) % stories.length;
      setLoadingText(stories[storyIndex]);
    }, 1200);

    worker.onmessage = (e: MessageEvent) => {
      const { type } = e.data;

      if (type === "bitmap") {
        bitmapLruInsert(e.data.frame, e.data.bitmap, isMobile);
      } else if (type === "progress") {
        const pct = (e.data.loaded / e.data.total) * 100;
        setLoadProgress(Math.min(pct, 100));
      } else if (type === "firstFrameBitmap") {
        // Frame 1 bitmap received — draw it to canvas immediately
        bitmapLruInsert(e.data.frame, e.data.bitmap, isMobile);
        const bgCanvas = bgCanvasRef.current;
        if (bgCanvas) {
          const ctx = bgCanvas.getContext("2d", { alpha: false });
          if (ctx) {
            const expectedW = isMobile ? Math.min(1920, window.innerWidth * (window.devicePixelRatio || 1)) : 1920;
            const expectedH = isMobile ? Math.round(expectedW * (1080 / 1920)) : 1080;
            if (bgCanvas.width !== expectedW || bgCanvas.height !== expectedH) {
              bgCanvas.width = expectedW;
              bgCanvas.height = expectedH;
            }
            ctx.drawImage(e.data.bitmap, 0, 0, bgCanvas.width, bgCanvas.height);
            frame1DrawnRef.current = true;
            lastDrawnFrame.current = 0;
          }
        }
      } else if (type === "firstBatchComplete") {
        setLoadProgress(100);
        // Only dismiss loader after frame 1 is confirmed drawn AND CMS data is loaded
        const dismissLoader = () => {
          hideTimer = setTimeout(() => {
            setIsLoaderVisible(false);
            removeTimer = setTimeout(() => setIsLoaderRemoved(true), 600);
          }, 2000);
        };
        if (frame1DrawnRef.current && cmsIsLoadedRef.current) {
          dismissLoader();
        } else {
          // Wait up to 5s for frame 1 and CMS data, then dismiss anyway to avoid infinite hang
          let attempts = 0;
          const checkInterval = setInterval(() => {
            attempts++;
            if (frame1DrawnRef.current && cmsIsLoadedRef.current) {
              clearInterval(checkInterval);
              dismissLoader();
            } else if (attempts > 100) { // 5 seconds (100 * 50ms)
              clearInterval(checkInterval);
              dismissLoader();
            }
          }, 50);
        }
      } else if (type === "error") {
        // Worker crashed — dismiss loader anyway so site isn't stuck
        console.warn("[Preloader] Worker error:", e.data.message);
        setLoadProgress(100);
        hideTimer = setTimeout(() => {
          setIsLoaderVisible(false);
          removeTimer = setTimeout(() => setIsLoaderRemoved(true), 600);
        }, 500);
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
    const isMobile = isMobileDevice();

    lenisRef.current = lenis;

    const bgCanvas = bgCanvasRef.current;
    const partCanvas = partCanvasRef.current;
    if (!bgCanvas || !partCanvas) return;

    const bgCtx = bgCanvas.getContext("2d", { alpha: false });
    const pCtx = partCanvas.getContext("2d");
    if (!bgCtx || !pCtx) return;

    if (!engineInitRef.current) {
      engineInitRef.current = true;
      window.scrollTo(0, 0);
      if (lenis) lenis.scrollTo(0, { immediate: true });

      // Set canvas dimensions if not already at correct size
      const expectedW = isMobile ? Math.min(1920, window.innerWidth * (window.devicePixelRatio || 1)) : 1920;
      const expectedH = isMobile ? Math.round(expectedW * (1080 / 1920)) : 1080;
      if (bgCanvas.width !== expectedW || bgCanvas.height !== expectedH) {
        bgCanvas.width = expectedW;
        bgCanvas.height = expectedH;
      }

      // Always draw frame 1 if available (guarantees no black screen)
      const existingFrame1 = imagesRef.current.get(1);
      if (existingFrame1) {
        bgCtx.drawImage(existingFrame1, 0, 0, bgCanvas.width, bgCanvas.height);
        lastDrawnFrame.current = 0;
        frame1DrawnRef.current = true;
      }
    }

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

      if (partnersContentRef.current) {
        const h = partnersContentRef.current.offsetHeight;
        if (h > 0) {
          const containerH = window.innerHeight * 0.75;
          const maxPx = Math.max(0, h - containerH);
          layoutMetrics.current.partnersMaxScrollY = Math.min(-68, -(maxPx / h) * 100);
        }
      }

      if (timelineTrackRef.current) {
        const h = timelineTrackRef.current.offsetHeight;
        if (h > 0) {
          const containerH = window.innerHeight * 0.75;
          const maxPx = Math.max(0, h - containerH);
          layoutMetrics.current.timelineMaxScrollY = Math.min(-71, -(maxPx / h) * 100);
        }
      }
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

    updateMetrics();
    if (!isMobile) initParticles();
    const metricsTimer = setTimeout(updateMetrics, 500);

    const handleResize = () => {
      updateMetrics();
      const nowMobile = isMobileDevice();
      if (nowMobile) {
        const cw = Math.min(1920, window.innerWidth * (window.devicePixelRatio || 1));
        const ch = Math.round(cw * (1080 / 1920));
        bgCanvas.width = cw;
        bgCanvas.height = ch;
      }
      if (nowMobile) {
        particles = [];
        pCtx.clearRect(0, 0, partCanvas.width, partCanvas.height);
      } else {
        initParticles();
      }
    };
    const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseLeave = () => { mouse.x = null; mouse.y = null; };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

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

    let lastRenderTime = 0;
    const fpsInterval = 1000 / 60;

    const renderLoop = (time: number) => {
      animationFrameRef.current = requestAnimationFrame(renderLoop);

      if (time - lastRenderTime < fpsInterval) return;
      lastRenderTime = time;

      const maxScroll = layoutMetrics.current.maxScroll;
      const innerWidth = layoutMetrics.current.width;
      const innerHeight = layoutMetrics.current.height;
      const isDesktop = innerWidth >= 768;
      const t = SECTION_TIMING;

      const scroll = lenisRef.current ? lenisRef.current.scroll : window.scrollY;
      const sp = Math.min(Math.max(scroll / maxScroll, 0), 1);

      if (scrollArrowRef.current) {
        scrollArrowRef.current.style.opacity = sp < 0.02 ? "1" : "0";
        scrollArrowRef.current.style.pointerEvents = sp < 0.02 ? "auto" : "none";
      }
      if (swipeArrowRef.current) {
        swipeArrowRef.current.style.opacity = sp < 0.02 ? "1" : "0";
        swipeArrowRef.current.style.pointerEvents = sp < 0.02 ? "auto" : "none";
      }

      const frameIndex = Math.floor(sp * (FRAME_COUNT - 1));
      const targetFrame = frameIndex + 1;

      const bitmap = imagesRef.current.get(targetFrame);

      if (bitmap) {
        if (frameIndex !== lastDrawnFrame.current) {
          try {
            bgCtx.drawImage(bitmap, 0, 0, bgCanvas.width, bgCanvas.height);
            lastDrawnFrame.current = frameIndex;
          } catch {
            imagesRef.current.delete(targetFrame);
          }
        }
      } else if (lastDrawnFrame.current >= 0) {
        // Bitmap evicted or not yet loaded — try to load from SW cache (throttled)
        if (!pendingLoadsRef.current.has(targetFrame) && pendingLoadsRef.current.size < 4) {
          pendingLoadsRef.current.add(targetFrame);
          const img = new Image();
          img.onload = () => {
            try {
              bgCtx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height);
              lastDrawnFrame.current = frameIndex;
            } catch { /* ignore */ }
            pendingLoadsRef.current.delete(targetFrame);
          };
          img.onerror = () => { pendingLoadsRef.current.delete(targetFrame); };
          img.src = getFrameUrl(targetFrame, isMobile);
        }
      } else {
        const f1 = imagesRef.current.get(1);
        if (f1) {
          try {
            bgCtx.drawImage(f1, 0, 0, bgCanvas.width, bgCanvas.height);
            lastDrawnFrame.current = 0;
          } catch { /* ignore */ }
        }
      }
      if (!isMobile) updateParticles();

      let activeIndex = 0;
      if (sp < 0.08) activeIndex = 0;
      else if (sp < 0.155) activeIndex = 1;
      else if (sp < 0.22) activeIndex = 2;
      else if (sp < 0.42) activeIndex = 3;
      else if (sp < 0.645) activeIndex = 4;
      else if (sp < 0.81) activeIndex = 5;
      else if (sp < 0.92) activeIndex = 6;
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
          const tMax = layoutMetrics.current.timelineMaxScrollY;
          let scrollY = 0;
          if (sp < t.timeline.holdStart) {
            scrollY = mapRange(sp, t.timeline.start, t.timeline.holdStart, 15, 0);
          } else if (sp < t.timeline.scrollEnd) {
            scrollY = mapRange(sp, t.timeline.holdStart, t.timeline.scrollEnd, 0, tMax);
          } else if (sp < t.timeline.outStart) {
            scrollY = tMax;
          } else {
            scrollY = mapRange(sp, t.timeline.outStart, t.timeline.end, tMax, tMax - 9);
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
          const pMax = layoutMetrics.current.partnersMaxScrollY;
          let scrollY = 0;
          if (sp < t.partners.holdStart) {
            scrollY = mapRange(sp, t.partners.start, t.partners.holdStart, 15, 0);
          } else if (sp < t.partners.scrollEnd) {
            scrollY = mapRange(sp, t.partners.holdStart, t.partners.scrollEnd, 0, pMax);
          } else if (sp < t.partners.outStart) {
            scrollY = pMax;
          } else {
            scrollY = mapRange(sp, t.partners.outStart, t.partners.end, pMax, pMax - 12);
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
            // Removed item.style.pointerEvents to avoid overriding parent's pointer-events: none
          });
        } else {
          faqLayerRef.current.style.opacity = "0";
          faqLayerRef.current.style.pointerEvents = "none";
          faqLayerRef.current.style.zIndex = "10";
          faqItemsRef.current.forEach((item) => {
            if (item) item.style.pointerEvents = "none";
          });
        }
      }

      // 8. CTA & CONNECT
      if (ctaLayerRef.current && ctaTextRef.current && canvasWrapperRef.current && connectLayerRef.current) {
        if (sp >= t.cta.start) {
          ctaLayerRef.current.style.opacity = "1";
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
            connectLayerRef.current.style.zIndex = "60";
            ctaLayerRef.current.style.pointerEvents = "none";
          } else {
            connectLayerRef.current.style.transform = `translate3d(0, 120%, 0)`;
            connectLayerRef.current.style.pointerEvents = "none";
            connectLayerRef.current.style.zIndex = "10";
            ctaLayerRef.current.style.pointerEvents = "auto";
          }
        } else {
          ctaLayerRef.current.style.opacity = "0";
          ctaLayerRef.current.style.pointerEvents = "none";
          canvasWrapperRef.current.style.transform = `translate3d(0, 0, 0)`;
          connectLayerRef.current.style.transform = `translate3d(0, 200%, 0)`;
        }
      }

    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(metricsTimer);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [lenis]);

  const handleDialClick = (targetPercentage: number) => {
    const maxScroll = layoutMetrics.current.maxScroll;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetPercentage * maxScroll);
    } else {
      window.scrollTo({ top: targetPercentage * maxScroll, behavior: "smooth" });
    }
  };

  const jumpToCurrentWeek = () => {
    const maxScroll = layoutMetrics.current.maxScroll;
    const currentWeekIndex = cms.timeline.findIndex((item) => item.is_current);
    const scrollProgress = currentWeekIndex > 0 && cms.timeline.length > 1
      ? currentWeekIndex / (cms.timeline.length - 1)
      : 0;
    const pagePercent = SECTION_TIMING.timeline.holdStart
      + scrollProgress * (SECTION_TIMING.timeline.scrollEnd - SECTION_TIMING.timeline.holdStart);
    const target = Math.min(pagePercent, 1) * maxScroll;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target);
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
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
          onRegister={() => (cms.cta?.is_active ?? true) ? handleDialClick(0.95) : undefined}
          onOngoing={jumpToCurrentWeek}
          data={cms.hero}
          registrationOpen={cms.cta?.is_active ?? true}
          ctaText={cms.cta?.button_text || "Register Now"}
        />

        <Chapters
          ref={chaptersLayerRef}
          contentRef={chaptersContentRef}
          titleRef={chaptersTitleRef}
          cardsRef={chapterCardsRef}
          data={cms.chapters}
        />

        <Prizes
          ref={prizesLayerRef}
          contentRef={prizesContentRef}
          onPrizeFlip={handlePrizeFlip}
          data={cms.prizes}
        />

        <Timeline
          ref={timelineLayerRef}
          trackRef={timelineTrackRef}
          data={cms.timeline}
        />

        <Partners
          ref={partnersLayerRef}
          contentRef={partnersContentRef}
          data={cms.partners}
        />

        <Team
          ref={teamLayerRef}
          trackRef={teamTrackRef}
          data={cms.team}
        />

        <FAQ
          ref={faqLayerRef}
          titleRef={faqTitleRef}
          itemsRef={faqItemsRef}
          data={cms.faq}
        />

        <CTA
          ref={ctaLayerRef}
          textRef={ctaTextRef}
          isDropdownOpen={isDropdownOpen}
          onToggleDropdown={() => setIsDropdownOpen(prev => !prev)}
          data={cms.cta}
        />

        <Connect ref={connectLayerRef} data={cms.connect} />
      </main>
    </>
  );
}
