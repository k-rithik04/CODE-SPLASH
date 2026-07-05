"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AspectRatio {
  label: string;
  value: string;
  ratio: number | null;
  icon: React.ReactNode;
}

const ASPECT_RATIOS: AspectRatio[] = [
  {
    label: "Original",
    value: "original",
    ratio: null,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    label: "Square",
    value: "1:1",
    ratio: 1,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" />
      </svg>
    ),
  },
  {
    label: "Portrait",
    value: "4:5",
    ratio: 4 / 5,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" />
      </svg>
    ),
  },
  {
    label: "Landscape",
    value: "16:9",
    ratio: 16 / 9,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" />
      </svg>
    ),
  },
  {
    label: "Wide",
    value: "21:9",
    ratio: 21 / 9,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="22" height="12" />
      </svg>
    ),
  },
];

interface ImageUploadProps {
  currentUrl: string;
  onUpload: (url: string) => void;
  folder?: string;
  className?: string;
  aspectRatios?: string[];
}

export default function ImageUpload({
  currentUrl,
  onUpload,
  folder = "cms-images",
  className = "",
  aspectRatios,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<string>("original");
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const supabase = createClient();

  const filteredRatios = aspectRatios
    ? ASPECT_RATIOS.filter((r) => aspectRatios.includes(r.value))
    : ASPECT_RATIOS;

  const drawCanvas = useCallback(
    (ratio: string) => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img || !img.naturalWidth) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const selected = ASPECT_RATIOS.find((r) => r.value === ratio);
      const targetRatio = selected?.ratio;

      let sx = 0, sy = 0, sw = imgW, sh = imgH;

      if (targetRatio !== null && targetRatio !== undefined) {
        const imgAspect = imgW / imgH;
        if (imgAspect > targetRatio) {
          sw = imgH * targetRatio;
          sx = (imgW - sw) / 2;
        } else {
          sh = imgW / targetRatio;
          sy = (imgH - sh) / 2;
        }
      }

      const maxW = 460;
      const maxH = 340;
      let displayW = sw;
      let displayH = sh;

      if (displayW > maxW) {
        displayH = (displayW = maxW) * (sh / sw);
      }
      if (displayH > maxH) {
        displayW = (displayH = maxH) * (sw / sh);
      }

      canvas.width = displayW;
      canvas.height = displayH;
      setCanvasSize({ width: displayW, height: displayH });

      ctx.clearRect(0, 0, displayW, displayH);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, displayW, displayH);
    },
    []
  );

  useEffect(() => {
    if (imageSrc && modalOpen) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        drawCanvas(selectedRatio);
      };
      img.src = imageSrc;
    }
  }, [imageSrc, modalOpen, selectedRatio, drawCanvas]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setSelectedRatio("original");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageSrc(ev.target?.result as string);
      setModalOpen(true);
    };
    reader.readAsDataURL(file);

    if (fileRef.current) fileRef.current.value = "";
  };

  const processAndUpload = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedFile) return;

    setUploading(true);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/webp", 0.9);
    });

    const fileExt = "webp";
    const fileName = `${folder}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("cms-images")
      .upload(fileName, blob, { contentType: "image/webp" });

    if (error) {
      alert("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("cms-images").getPublicUrl(fileName);
    setPreview(data.publicUrl);
    onUpload(data.publicUrl);
    setUploading(false);
    setModalOpen(false);
    setSelectedFile(null);
    setImageSrc(null);
  };

  const handleClear = () => {
    setPreview("");
    onUpload("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {preview && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/10 bg-white/5">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-red-500/80 transition-colors text-white"
          >
            &#x2715;
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="border-white/20"
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="border-white/20 text-red-400"
          >
            Remove
          </Button>
        )}
      </div>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setModalOpen(false);
            setSelectedFile(null);
            setImageSrc(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg bg-black border-white/10 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Choose How to Display
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <div
              className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center"
              style={{ minHeight: 200, maxHeight: 360, width: "100%" }}
            >
              <canvas
                ref={canvasRef}
                className="max-w-full"
                style={{
                  width: canvasSize.width || "auto",
                  height: canvasSize.height || "auto",
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {filteredRatios.map((ar) => (
                <button
                  key={ar.value}
                  type="button"
                  onClick={() => setSelectedRatio(ar.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedRatio === ar.value
                      ? "bg-orange text-white shadow-lg shadow-orange/25"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  {ar.icon}
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setSelectedFile(null);
                setImageSrc(null);
              }}
              className="border-white/20 text-white/60"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={processAndUpload}
              disabled={uploading}
              className="bg-orange hover:bg-orange/90 text-white shadow-lg shadow-orange/25"
            >
              {uploading ? "Uploading..." : "Use This Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
