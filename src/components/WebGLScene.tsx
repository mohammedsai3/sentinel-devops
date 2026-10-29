import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface WebGLSceneProps {
  statusMode?: 'nominal' | 'investigating' | 'critical';
  onNodeClick?: (nodeInfo: string) => void;
}

export const WebGLScene: React.FC<WebGLSceneProps> = ({
  statusMode = 'nominal',
  onNodeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const statusModeRef = useRef(statusMode);

  // Keep ref synchronized with prop
  useEffect(() => {
    statusModeRef.current = statusMode;
  }, [statusMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08080a, 0.035);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- Color Themes ---
    const colors = {
      nominal: {
        node: new THREE.Color('#10b981'), // Emerald
        line: new THREE.Color('#059669'),
        core: new THREE.Color('#34d399'),
      },
      investigating: {
        node: new THREE.Color('#f59e0b'), // Amber
        line: new THREE.Color('#d97706'),
        core: new THREE.Color('#fbbf24'),
      },
      critical: {
        node: new THREE.Color('#ef4444'), // Coral red
        line: new THREE.Color('#dc2626'),
        core: new THREE.Color('#f87171'),
      },
    };

    let targetColorNode = colors[statusModeRef.current].node;
    let targetColorLine = colors[statusModeRef.current].line;
    let targetColorCore = colors[statusModeRef.current].core;

    // --- Core Geometric Orb (The Sentinel Kernel) ---
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner wireframe sphere
    const coreGeo = new THREE.IcosahedronGeometry(2.4, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: targetColorCore,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Floating orbital rings around core
    const ringGeo = new THREE.TorusGeometry(3.6, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: targetColorLine,
      transparent: true,
      opacity: 0.3,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.x = Math.PI / 2.3;
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring1);
    coreGroup.add(ring2);

    // --- Distributed Node Network & Telemetry Grid ---
    const count = 180;
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 4 + Math.random() * 8.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      velocities[i * 3] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create crisp circular sprite particle
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.stroke();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleMat = new THREE.PointsMaterial({
      color: targetColorNode,
      size: 0.28,
      map: createCircleTexture(),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Dynamic Network Line Connections ---
    const lineMaterial = new THREE.LineBasicMaterial({
      color: targetColorLine,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const maxLineConnections = 240;
    const linePositions = new Float32Array(maxLineConnections * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage)
    );
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // --- Interactive Mouse & Pointer Mechanics ---
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = nx * 3;
      targetMouseY = ny * 3;
    };

    const onPointerLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    // Click wave event
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      
      const pos = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const dx = pos[i * 3] - clickX * 6;
        const dy = pos[i * 3 + 1] - clickY * 6;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5) {
          velocities[i * 3] += (dx / dist) * 0.08;
          velocities[i * 3 + 1] += (dy / dist) * 0.08;
        }
      }

      if (onNodeClick) {
        onNodeClick(`Télémétrie nœud #${Math.floor(Math.random() * 180)}`);
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mouseleave', onPointerLeave);
    container.addEventListener('click', handleCanvasClick);

    // --- Scroll Reactive Progression ---
    let scrollProgress = 0;
    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = Math.min(1, Math.max(0, scrollY / maxScroll));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- Resize Observer ---
    const onResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // --- Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      // Color lerp based on live statusModeRef
      const currentMode = statusModeRef.current;
      targetColorNode = colors[currentMode].node;
      targetColorLine = colors[currentMode].line;
      targetColorCore = colors[currentMode].core;

      particleMat.color.lerp(targetColorNode, 0.08);
      lineMaterial.color.lerp(targetColorLine, 0.08);
      coreMat.color.lerp(targetColorCore, 0.08);
      ringMat.color.lerp(targetColorLine, 0.08);

      // Scroll reactive camera & topology transformation
      const targetCamY = -scrollProgress * 6 + mouseY * 0.8;
      const targetCamX = Math.sin(scrollProgress * Math.PI) * 4 + mouseX * 0.8;
      const targetCamZ = 16 - scrollProgress * 5;

      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;
      camera.lookAt(0, -scrollProgress * 2, 0);

      // Core rotation & pulsation speed dynamic based on mode
      const speedMultiplier = currentMode === 'critical' ? 2.6 : currentMode === 'investigating' ? 1.6 : 1.0;
      coreGroup.rotation.y = elapsedTime * 0.22 * speedMultiplier;
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.3;

      ring1.rotation.z = elapsedTime * 0.35 * speedMultiplier;
      ring2.rotation.y = -elapsedTime * 0.4 * speedMultiplier;

      const pulseScale = 1 + Math.sin(elapsedTime * 2 * speedMultiplier) * 0.06;
      coreMesh.scale.set(pulseScale, pulseScale, pulseScale);

      // Particles dynamic behavior & drift
      const posArray = particleGeo.attributes.position.array as Float32Array;
      let lineVertexIndex = 0;

      for (let i = 0; i < count; i++) {
        posArray[i * 3] += velocities[i * 3];
        posArray[i * 3 + 1] += velocities[i * 3 + 1];
        posArray[i * 3 + 2] += velocities[i * 3 + 2];

        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        posArray[i * 3] += (ox - posArray[i * 3]) * 0.02;
        posArray[i * 3 + 1] += (oy - posArray[i * 3 + 1]) * 0.02;
        posArray[i * 3 + 2] += (oz - posArray[i * 3 + 2]) * 0.02;

        velocities[i * 3] *= 0.96;
        velocities[i * 3 + 1] *= 0.96;
        velocities[i * 3 + 2] *= 0.96;

        if (lineVertexIndex < maxLineConnections * 6) {
          for (let j = i + 1; j < Math.min(i + 12, count); j++) {
            const dx = posArray[i * 3] - posArray[j * 3];
            const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
            const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
            const distSq = dx * dx + dy * dy + dz * dz;

            if (distSq < 9.0 && lineVertexIndex < maxLineConnections * 6 - 6) {
              linePositions[lineVertexIndex++] = posArray[i * 3];
              linePositions[lineVertexIndex++] = posArray[i * 3 + 1];
              linePositions[lineVertexIndex++] = posArray[i * 3 + 2];

              linePositions[lineVertexIndex++] = posArray[j * 3];
              linePositions[lineVertexIndex++] = posArray[j * 3 + 1];
              linePositions[lineVertexIndex++] = posArray[j * 3 + 2];
            }
          }
        }
      }

      particleGeo.attributes.position.needsUpdate = true;
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineVertexIndex / 3);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', onScroll);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mouseleave', onPointerLeave);
      container.removeEventListener('click', handleCanvasClick);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, []); // Run once! Smooth live color transitions handled via statusModeRef

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Three.js viewport */}
      <div ref={containerRef} className="absolute inset-0 cursor-crosshair z-0" />
    </div>
  );
};
