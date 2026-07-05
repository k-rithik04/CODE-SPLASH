"use client";

interface LoaderProps {
  loadProgress: number;
  loadingText: string;
  isLoaderVisible: boolean;
}

export default function Loader({ loadProgress, loadingText, isLoaderVisible }: LoaderProps) {
  return (
    <div
      className="fixed inset-0 bg-bg z-[200] flex flex-col justify-center items-center gap-4 font-bold tracking-[3px] text-[0.9rem] transition-opacity duration-600"
      style={{ opacity: isLoaderVisible ? 1 : 0 }}
    >
      <div className="text-[0.75rem] text-white/50 font-medium tracking-[2px] mb-5 uppercase transition-opacity duration-300">
        {loadingText}
      </div>
      <div>CODESPLASH SYSTEM STARTING</div>
      <div className="w-[200px] md:w-[250px] h-[3px] bg-white/5 relative overflow-hidden rounded">
        <div
          className="absolute top-0 left-0 h-full bg-orange shadow-[0_0_15px_#ff6b00,0_0_30px_#ff6b00] rounded transition-all duration-150"
          style={{ width: `${Math.floor(loadProgress)}%` }}
        ></div>
      </div>
      <div className="text-orange mt-2 text-[1.2rem]">
        {Math.floor(loadProgress)}%
      </div>
    </div>
  );
}
