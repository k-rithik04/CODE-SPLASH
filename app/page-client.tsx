"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import Preloader from "@/components/Preloader";
import CanvasBackground from "@/components/CanvasBackground";
import NavDial from "@/components/NavDial";
import HeroSection from "@/components/sections/hero";
import ChaptersSection from "@/components/sections/chapters";
import PrizesSection from "@/components/sections/prizes";
import TimelineSection from "@/components/sections/timeline";
import PartnersSection from "@/components/sections/partners";
import TeamSection from "@/components/sections/team";
import FaqSection from "@/components/sections/faq";
import CtaSection from "@/components/sections/cta";
import ConnectSection from "@/components/sections/connect";
import { basePath } from "@/lib/utils";

interface HeroData {
  logo_url: string;
  logo_alt: string;
  tagline: string;
  cta_button_text: string;
  cta_button_link: string;
  scroll_hint_desktop: string;
  scroll_hint_mobile: string;
}

export default function HomeClient({ initialHeroData }: { initialHeroData: HeroData | null }) {
  const lenis = useLenis();
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Sailing through the river..");
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [isLoaderRemoved, setIsLoaderRemoved] = useState(false);

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const partCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const currentScroll = useRef(0);
  const targetScroll = useRef(0);
  const lastDrawnFrame = useRef(-1);
  const lastActiveIndex = useRef(-1);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  const layoutMetrics = useRef({ width: 0, height: 0, maxScroll: 1 });

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const dialWindowRef = useRef<HTMLDivElement>(null);
  const dialItemsRef = useRef<(HTMLDivElement | null)[]>([]);

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
  const scrollArrowRef = useRef<HTMLDivElement>(null);
  const swipeArrowRef = useRef<HTMLDivElement>(null);

  const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
    const clamped = Math.max(inMin, Math.min(value, inMax));
    return ((clamped - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  // --- SCROLL RESET on refresh ---
  useLayoutEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [lenis]);

  // --- PRELOADER  ---
  useEffect(() => {
    const storyTexts = [
      "Sailing through the river..",
      "Decoding the secret map..",
      "By passing the ancient traps..",
      "Opening the hidden gates..",
      "Entering the codesplash arena.."
    ];
    let storyIndex = 0;
    const storyInterval = setInterval(() => {
      storyIndex = (storyIndex + 1) % storyTexts.length;
      setLoadingText(storyTexts[storyIndex]);
    }, 1200);

    let safetyTimer: ReturnType<typeof setTimeout>;
    let initialAnimFrame: number;
    let firstBatchReady = false;
    let firstBatchLoaded = 0;
    let baseProgress = 0;

    // Phase 1: Animate 0 → random(20–40) over ~1.5s
    const target = Math.floor(Math.random() * 21) + 20; // 20–40
    const duration = 1500;
    const startTime = performance.now();

    function animateInitial(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setLoadProgress(eased * target);
      if (t < 1) {
        initialAnimFrame = requestAnimationFrame(animateInitial);
      } else {
        setLoadProgress(target);
        baseProgress = target;
      }
    }
    initialAnimFrame = requestAnimationFrame(animateInitial);

    try {
      const worker = new Worker(`${basePath}/preloader.worker.js`);

      worker.onmessage = (e) => {
        const { type, loaded, total } = e.data;

        if (type === "firstBatchComplete") {
          // First 500 frames cached — start counting from baseProgress
          firstBatchReady = true;
          firstBatchLoaded = loaded;
        }

        if (type === "progress" && total > 0) {
          if (!firstBatchReady) return;

          // Map tail-frame progress into baseProgress → 100
          const tailTotal = total - firstBatchLoaded;
          const tailLoaded = loaded - firstBatchLoaded;
          const tailPct = tailTotal > 0 ? (tailLoaded / tailTotal) * 100 : 100;
          setLoadProgress(Math.min(baseProgress + (tailPct / 100) * (100 - baseProgress), 99));
        }

        if (type === "complete") {
          setLoadProgress(100);
          clearTimeout(safetyTimer);
          setTimeout(() => {
            setIsLoaderVisible(false);
            setTimeout(() => setIsLoaderRemoved(true), 600);
          }, 300);
          worker.terminate();
        }

        if (type === "error") {
          setIsLoaderVisible(false);
          setTimeout(() => setIsLoaderRemoved(true), 600);
          clearTimeout(safetyTimer);
          worker.terminate();
        }
      };

      worker.postMessage({
        firstCount: 400,
        lastCount: 100,
        totalFrames: 1265,
      });

      safetyTimer = setTimeout(() => {
        setLoadProgress(100);
        setIsLoaderVisible(false);
        setTimeout(() => setIsLoaderRemoved(true), 600);
        worker.terminate();
      }, 15000);

      return () => {
        clearInterval(storyInterval);
        clearTimeout(safetyTimer);
        cancelAnimationFrame(initialAnimFrame);
        worker.terminate();
      };
    } catch {
      const fallbackTimer = setTimeout(() => {
        setLoadProgress(100);
        setIsLoaderVisible(false);
        setTimeout(() => setIsLoaderRemoved(true), 600);
      }, 2000);

      const fallbackProgress = setInterval(() => {
        setLoadProgress((prev) => Math.min(prev + Math.random() * 20, 100));
      }, 150);

      return () => {
        clearInterval(storyInterval);
        clearTimeout(fallbackTimer);
        clearInterval(fallbackProgress);
        cancelAnimationFrame(initialAnimFrame);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const bgCanvas = bgCanvasRef.current;
    const partCanvas = partCanvasRef.current;
    if (!bgCanvas || !partCanvas) return;

    const bgCtx = bgCanvas.getContext("2d", { alpha: false });
    const pCtx = partCanvas.getContext("2d");
    if (!bgCtx || !pCtx) return;

    bgCanvas.width = 1920;
    bgCanvas.height = 1080;
    const frameCount = 1265;

    for (let i = 1; i <= frameCount; i++) {
      const img = new window.Image();
      img.src = `${basePath}/assets/frames/frame_${i.toString().padStart(3, "0")}.webp`;
      imagesRef.current.push(img);
    }

    // Particle 
    interface Particle {
      x: number; y: number; baseX: number; baseY: number;
      size: number; density: number; alpha: number;
    }
    let particles: Particle[] = [];
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
    setTimeout(updateMetrics, 500);

    const handleResize = () => {
      updateMetrics();
      initParticles();
    };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    const handleScroll = () => {
      targetScroll.current = window.scrollY;
    };

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

    // Particle Logic
    const updateParticles = () => {
      pCtx.clearRect(0, 0, partCanvas.width, partCanvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
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

    // --- 60 FPS CAP ---
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 60;

    const renderLoop = (now: number) => {
      if (now - lastFrameTime < FRAME_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(renderLoop);
        return;
      }
      lastFrameTime = now - ((now - lastFrameTime) % FRAME_INTERVAL);

      const maxScroll = layoutMetrics.current.maxScroll;
      const innerWidth = layoutMetrics.current.width;
      const innerHeight = layoutMetrics.current.height;
      const isDesktop = innerWidth >= 768;

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

      //timeedit
      const t = {
        hero: { fadeStart: 0.04, end: 0.08 },
        chapters: { start: 0.07, inEnd: 0.09, outStart: 0.16, outEnd: 0.17, end: 0.18 },
        prizes: { start: 0.17, inEnd: 0.20, outStart: 0.25, outEnd: 0.26, end: 0.27 },
        timeline: { start: 0.28, inEnd: 0.29, holdStart: 0.32, scrollEnd: 0.46, outStart: 0.48, outEnd: 0.50, end: 0.50 },
        partners: { start: 0.51, inEnd: 0.53, outStart: 0.57, outEnd: 0.59, end: 0.59 },
        team: { start: 0.615, inEnd: 0.62, outStart: 0.75, outEnd: 0.79, end: 0.79 },
        faq: { start: 0.78, inEnd: 0.80, pointerStart: 0.81, pointerEnd: 0.87, outStart: 0.86, outEnd: 0.89, end: 0.89 },
        cta: { start: 0.92, inEnd: 0.95, end: 1.0 }
      };

      const frameIndex = Math.floor(sp * (frameCount - 1));
      const images = imagesRef.current;
      if (images[frameIndex] && images[frameIndex].complete && images[frameIndex].naturalWidth > 0) {
        if (frameIndex !== lastDrawnFrame.current) {
          bgCtx.drawImage(images[frameIndex], 0, 0, bgCanvas.width, bgCanvas.height);
          lastDrawnFrame.current = frameIndex;
        }
      }

      updateParticles();

      let activeIndex = 0;
      if (sp < 0.08) activeIndex = 0;
      else if (sp < 0.18) activeIndex = 1;
      else if (sp < 0.27) activeIndex = 2;
      else if (sp < 0.50) activeIndex = 3;
      else if (sp < 0.59) activeIndex = 4;
      else if (sp < 0.79) activeIndex = 5;
      else if (sp < 0.89) activeIndex = 6;
      else activeIndex = 7;

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
          heroLayerRef.current.style.pointerEvents = op > 0.01 ? "auto" : "none";
          const blurVal = mapRange(sp, t.hero.fadeStart, t.hero.end, 0, 15);
          heroContentRef.current.style.filter = `blur(${blurVal}px)`;
          heroContentRef.current.style.transform = "none";
        } else {
          heroLayerRef.current.style.opacity = "0";
          heroLayerRef.current.style.pointerEvents = "none";
          heroContentRef.current.style.filter = "blur(15px)";
          heroContentRef.current.style.transform = "none";
        }
      }

      // 2. CHAPTERS 
      if (chaptersLayerRef.current && chaptersContentRef.current) {
        if (sp >= t.chapters.start && sp <= t.chapters.end) {
          let op = 1;

          if (sp < t.chapters.inEnd) {
            op = mapRange(sp, t.chapters.start, t.chapters.inEnd, 0, 1);

            if (isDesktop) {
              // 2/3 thing
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

            // Move title UP alongside the upward card
            const titleY = -innerHeight * 0.5 * outProg;
            if (chaptersTitleRef.current) chaptersTitleRef.current.style.transform = `translate3d(0, ${titleY}px, 0)`;

            if (isDesktop) {
              if (chapterCardsRef.current[0]) chapterCardsRef.current[0].style.transform = `translate3d(${outProg * -innerWidth * 0.5}px, 0, 0)`;
              if (chapterCardsRef.current[1]) chapterCardsRef.current[1].style.transform = `translate3d(0, ${outProg * -innerHeight * 0.5}px, 0)`;
              if (chapterCardsRef.current[2]) chapterCardsRef.current[2].style.transform = `translate3d(${outProg * innerWidth * 0.5}px, 0, 0)`;
            } else {
              // Small Devices: 0 goes UP, 1 goes LEFT, 2 goes RIGHT
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
        } else {
          chaptersLayerRef.current.style.opacity = "0";
          chaptersLayerRef.current.style.pointerEvents = "none";
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
          let op = 1, s = 1;
          if (sp < t.partners.inEnd) {
            op = mapRange(sp, t.partners.start, t.partners.inEnd, 0, 1);
            s = mapRange(sp, t.partners.start, t.partners.inEnd, 0.4, 1);
          } else if (sp > t.partners.outStart) {
            op = mapRange(sp, t.partners.outStart, t.partners.outEnd, 1, 0);
            s = mapRange(sp, t.partners.outStart, t.partners.outEnd, 1, 1.5);
          }
          partnersLayerRef.current.style.opacity = op.toString();
          partnersLayerRef.current.style.pointerEvents = op > 0.05 ? "auto" : "none";
          partnersContentRef.current.style.transform = `scale(${s})`;
        } else {
          partnersLayerRef.current.style.opacity = "0";
          partnersLayerRef.current.style.pointerEvents = "none";
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

          const cardHalfWidth = innerWidth < 768 ? 130 : 160;
          const startPx = -cardHalfWidth;
          const endPx = startPx - innerWidth * 1.5;
          const tx = mapRange(sp, t.team.inEnd, t.team.end, startPx, endPx);
          teamTrackRef.current.style.transform = `translate3d(${tx}px, 0, 0)`;
        } else {
          teamLayerRef.current.style.opacity = "0";
          teamLayerRef.current.style.pointerEvents = "none";
        }
      }

      // 7. FAQ
      if (faqLayerRef.current && faqTitleRef.current) {
        if (sp >= t.faq.start && sp <= t.faq.end) {
          const opMain = sp > t.faq.pointerStart && sp < t.faq.pointerEnd ? 1 : 0;
          faqLayerRef.current.style.opacity = "1";
          faqLayerRef.current.style.pointerEvents = opMain ? "auto" : "none";

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
            pushUpY = mapRange(sp, t.cta.inEnd, t.cta.end, 0, -35);
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
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleDialClick = (targetPercentage: number) => {
    const maxScroll = layoutMetrics.current.maxScroll;
    lenis?.scrollTo(targetPercentage * maxScroll, { force: true });
  };

  const jumpToCurrentWeek = () => {
    const track = timelineTrackRef.current;
    if (!track) return;
    const nodes = Array.from(track.querySelectorAll(".timeline-node"));
    const currentIdx = nodes.findIndex((n) => n.classList.contains("current-week"));

    if (currentIdx !== -1) {
      const progress = currentIdx / Math.max(1, nodes.length - 1);
      const targetSp = 0.34 + progress * (0.45 - 0.34);
      const maxScroll = layoutMetrics.current.maxScroll;
      lenis?.scrollTo(targetSp * maxScroll, { force: true });
    }
  };

  const handlePrizeFlip = (e: React.MouseEvent<HTMLDivElement>) => {
    const innerCard = e.currentTarget.querySelector('.flip-card-inner') as HTMLDivElement;
    if (innerCard) {
      if (innerCard.style.transform === 'rotateY(180deg)') {
        innerCard.style.transform = '';
      } else {
        innerCard.style.transform = 'rotateY(180deg)';
      }
    }
  };

  return (
    <>
      <Preloader
        loadProgress={loadProgress}
        loadingText={loadingText}
        isLoaderVisible={isLoaderVisible}
        isLoaderRemoved={isLoaderRemoved}
      />

      <CanvasBackground
        bgCanvasRef={bgCanvasRef}
        partCanvasRef={partCanvasRef}
        canvasWrapperRef={canvasWrapperRef}
      />

      <NavDial
        dialWindowRef={dialWindowRef}
        dialItemsRef={dialItemsRef}
        onDialClick={handleDialClick}
      />

      <main>
        <HeroSection
          initialData={initialHeroData}
          heroLayerRef={heroLayerRef}
          heroContentRef={heroContentRef}
          scrollArrowRef={scrollArrowRef}
          swipeArrowRef={swipeArrowRef}
          onJumpToCurrentWeek={jumpToCurrentWeek}
          onRegisterClick={() => handleDialClick(1)}
        />
        <ChaptersSection
          chaptersLayerRef={chaptersLayerRef}
          chaptersContentRef={chaptersContentRef}
          chaptersTitleRef={chaptersTitleRef}
          chapterCardsRef={chapterCardsRef}
        />
        <PrizesSection
          prizesLayerRef={prizesLayerRef}
          prizesContentRef={prizesContentRef}
          onPrizeFlip={handlePrizeFlip}
        />
        <TimelineSection
          timelineLayerRef={timelineLayerRef}
          timelineTrackRef={timelineTrackRef}
        />
        <PartnersSection
          partnersLayerRef={partnersLayerRef}
          partnersContentRef={partnersContentRef}
        />
        <TeamSection
          teamLayerRef={teamLayerRef}
          teamTrackRef={teamTrackRef}
        />
        <FaqSection
          faqLayerRef={faqLayerRef}
          faqTitleRef={faqTitleRef}
          faqItemsRef={faqItemsRef}
        />
        <CtaSection
          ctaLayerRef={ctaLayerRef}
          ctaTextRef={ctaTextRef}
        />
        <ConnectSection
          connectLayerRef={connectLayerRef}
        />
      </main>
    </>
  );
}
