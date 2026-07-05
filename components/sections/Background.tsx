"use client";

import React from "react";

interface BackgroundProps {
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
  bgCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  partCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function Background({ canvasWrapperRef, bgCanvasRef, partCanvasRef }: BackgroundProps) {
  return (
    <div
      ref={canvasWrapperRef}
      style={{ opacity: 0.8 }}
      className="fixed inset-0 w-screen h-screen pointer-events-none overflow-visible z-[-1] will-change-transform"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-[#110600] to-bg z-0"></div>
      <canvas
        ref={bgCanvasRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[100vw] min-h-[100vh] w-auto h-auto max-w-none block z-10"
      ></canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-bg/10 to-bg/50 z-20"></div>
      <canvas
        ref={partCanvasRef}
        className="absolute inset-0 w-full h-full block z-30"
      ></canvas>

      <div className="absolute top-full left-0 w-full h-[50vh] bg-bg z-50"></div>

      <div className="absolute inset-0 pointer-events-none z-[45] flex flex-col justify-between">
        <div
          className="w-full h-[20vh] bg-bg/60 backdrop-blur-xl"
          style={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 100%)' }}
        ></div>
        <div
          className="w-full h-[20vh] bg-bg/60 backdrop-blur-xl"
          style={{ maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 100%)' }}
        ></div>
      </div>
    </div>
  );
}
