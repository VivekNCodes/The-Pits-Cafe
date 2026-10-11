'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Crop, ZoomIn, ZoomOut, Check, Upload, RefreshCw } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (dataUrl: string) => void;
}

export function ImageCropperModal({ isOpen, onClose, onCropComplete }: ImageCropperModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<'16:10' | '1:1'>('16:10');
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw image on preview canvas
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      renderCrop();
    };
  }, [imageSrc, zoom, offset, aspectRatio]);

  const renderCrop = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 480;
    const height = aspectRatio === '16:10' ? 300 : 480;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Calculate drawing dimensions with zoom and offset
    const imgRatio = img.width / img.height;
    const targetRatio = width / height;

    let drawW, drawH;
    if (imgRatio > targetRatio) {
      drawH = height * zoom;
      drawW = drawH * imgRatio;
    } else {
      drawW = width * zoom;
      drawH = drawW / imgRatio;
    }

    const drawX = (width - drawW) / 2 + offset.x;
    const drawY = (height - drawH) / 2 + offset.y;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConfirmCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="max-w-lg w-full p-6 rounded-3xl bg-darkSurface-card border border-darkSurface-border shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-brand-400" />
            <h3 className="font-display font-bold text-base text-white">
              Upload & Crop Dish Image
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!imageSrc ? (
          /* File selection area */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-brand-500 rounded-2xl p-8 text-center cursor-pointer bg-zinc-900/60 transition-colors space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-200">
                Choose an image from your device
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Supports JPG, PNG, WEBP (Max 5MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          /* Interactive Cropping Workspace */
          <div className="space-y-4">
            <div
              className="relative mx-auto rounded-2xl overflow-hidden bg-black cursor-move border border-zinc-700 shadow-inner flex items-center justify-center"
              style={{
                width: '100%',
                maxHeight: '320px',
                aspectRatio: aspectRatio === '16:10' ? '16/10' : '1/1',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* Crop Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-white/15" />
                <div className="border-r border-white/15" />
                <div />
              </div>
            </div>

            {/* Controls: Zoom slider & Aspect Ratio */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-zinc-400" />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-brand-500 cursor-pointer"
                />
                <ZoomIn className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-mono text-zinc-400 w-10 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span>Aspect:</span>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:10')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      aspectRatio === '16:10'
                        ? 'bg-brand-600 text-white font-semibold'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    16:10 (Card)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('1:1')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      aspectRatio === '1:1'
                        ? 'bg-brand-600 text-white font-semibold'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    1:1 (Square)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Choose Different
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleConfirmCrop}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-xs shadow-glow hover:brightness-110 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Apply Cropped Image
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
