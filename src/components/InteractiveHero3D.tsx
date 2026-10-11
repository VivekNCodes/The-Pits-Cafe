'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function InteractiveHero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.5);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm studio lighting
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.9);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0xf2751b, 3.5);
    mainSpot.position.set(3, 5, 4);
    mainSpot.angle = Math.PI / 4;
    mainSpot.penumbra = 0.5;
    scene.add(mainSpot);

    const rimLight = new THREE.PointLight(0xf59e0b, 2.0);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // Group for 3D Artisan Mug & Saucer
    const cafeGroup = new THREE.Group();

    // 1. Saucer
    const saucerGeo = new THREE.CylinderGeometry(1.4, 0.9, 0.1, 32);
    const saucerMat = new THREE.MeshStandardMaterial({
      color: 0x221814,
      roughness: 0.3,
      metalness: 0.2,
    });
    const saucer = new THREE.Mesh(saucerGeo, saucerMat);
    saucer.position.y = -0.1;
    cafeGroup.add(saucer);

    // 2. Artisanal Ceramic Mug (Terracotta & Brand Orange)
    const mugGeo = new THREE.CylinderGeometry(0.85, 0.7, 1.3, 32, 1, true);
    const mugMat = new THREE.MeshStandardMaterial({
      color: 0xd96b27,
      roughness: 0.25,
      metalness: 0.2,
    });
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.position.y = 0.65;
    cafeGroup.add(mug);

    // Inner Mug
    const innerMugGeo = new THREE.CylinderGeometry(0.82, 0.68, 1.25, 32);
    const innerMugMat = new THREE.MeshStandardMaterial({
      color: 0xf3ede2,
      roughness: 0.2,
    });
    const innerMug = new THREE.Mesh(innerMugGeo, innerMugMat);
    innerMug.position.y = 0.65;
    cafeGroup.add(innerMug);

    // 3. Liquid Espresso & Crema Foam Surface
    const liquidGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.05, 32);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0xc89666,
      roughness: 0.4,
      metalness: 0.05,
    });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = 1.15;
    cafeGroup.add(liquid);

    // 4. Handle (Golden Brass finish)
    const handleGeo = new THREE.TorusGeometry(0.45, 0.1, 16, 32, Math.PI);
    const goldHandleMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
    });
    const handle = new THREE.Mesh(handleGeo, goldHandleMat);
    handle.rotation.z = -Math.PI / 2;
    handle.rotation.y = Math.PI / 2;
    handle.position.set(0.85, 0.65, 0);
    cafeGroup.add(handle);

    // 5. Golden Brand Ring Accenting
    const ringGeo = new THREE.TorusGeometry(0.86, 0.02, 16, 40);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const goldRing = new THREE.Mesh(ringGeo, goldMat);
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 1.28;
    cafeGroup.add(goldRing);

    scene.add(cafeGroup);

    // Interactive mouse rotation
    let targetRotY = 0;
    let targetRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.8;
      targetRotX = y * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth idle rotation + mouse responsiveness
      cafeGroup.rotation.y += 0.008;
      cafeGroup.rotation.y += (targetRotY - cafeGroup.rotation.y) * 0.05;
      cafeGroup.rotation.x += (targetRotX - cafeGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] md:h-[380px] flex items-center justify-center">
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Fallback & Ambient Glow */}
      {!webGlSupported && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-brand-600 to-amberGold opacity-20 blur-2xl" />
          <div className="relative z-10 text-center">
            <span className="text-6xl">☕</span>
            <p className="text-xs text-zinc-400 mt-2">Crafted Hot & Fresh</p>
          </div>
        </div>
      )}

      {/* Subtle decorative glow overlay */}
      <div className="absolute -bottom-4 w-56 h-12 bg-brand-500/20 rounded-full blur-xl pointer-events-none" />
    </div>
  );
}
