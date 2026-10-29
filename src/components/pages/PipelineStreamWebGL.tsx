import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pulse, GitBranch, ShieldCheck, Warning, Play } from '@phosphor-icons/react';

interface PipelineStage {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'failed' | 'running';
  duration: string;
  position: [number, number, number];
}

const STAGES: PipelineStage[] = [
  { id: 'commit', name: 'Git Push & Lint', status: 'passed', duration: '12s', position: [-4.0, 0, 0] },
  { id: 'build', name: 'Docker Build & SBOM', status: 'passed', duration: '48s', position: [-2.0, 0.4, 0.5] },
  { id: 'security', name: 'Trivy & Semgrep SAST', status: 'warning', duration: '24s', position: [0, -0.3, -0.4] },
  { id: 'tests', name: 'Playwright & K6 Load', status: 'passed', duration: '1m 15s', position: [2.0, 0.5, 0.3] },
  { id: 'deploy', name: 'ArgoCD Sync & Webhook', status: 'failed', duration: '32s', position: [4.0, 0, 0] },
];

export const PipelineStreamWebGL: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredStage, setHoveredStage] = useState<PipelineStage | null>(null);
  const [activeStage, setActiveStage] = useState<PipelineStage>(STAGES[4]); // default to failed deploy

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08080a, 0.04);

    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.5, 9.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const statusColors = {
      passed: new THREE.Color('#10b981'),
      warning: new THREE.Color('#f59e0b'),
      failed: new THREE.Color('#ef4444'),
      running: new THREE.Color('#06b6d4'),
    };

    const stageMeshes: THREE.Mesh[] = [];
    const stageHalos: THREE.Mesh[] = [];

    // Stages spheres
    STAGES.forEach((stage, idx) => {
      const col = statusColors[stage.status];
      const isFailed = stage.status === 'failed';

      // Inner sphere
      const sphereGeo = new THREE.SphereGeometry(isFailed ? 0.42 : 0.34, 24, 24);
      const sphereMat = new THREE.MeshBasicMaterial({ color: col });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(...stage.position);
      (mesh as any).userData = { stageIdx: idx };
      rootGroup.add(mesh);
      stageMeshes.push(mesh);

      // Outer wireframe ring
      const haloGeo = new THREE.TorusGeometry(isFailed ? 0.72 : 0.58, 0.02, 16, 60);
      const haloMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: isFailed ? 0.8 : 0.4,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(...stage.position);
      halo.rotation.x = Math.PI / 2.5;
      rootGroup.add(halo);
      stageHalos.push(halo);
    });

    // Connecting beam tube
    const points: THREE.Vector3[] = STAGES.map((s) => new THREE.Vector3(...s.position));
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.03, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x3f3f46,
      transparent: true,
      opacity: 0.5,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    rootGroup.add(tube);

    // Flowing packet particles along the curve
    const packetCount = 45;
    const packetGeo = new THREE.BufferGeometry();
    const packetPositions = new Float32Array(packetCount * 3);
    const packetOffsets = new Float32Array(packetCount);
    for (let i = 0; i < packetCount; i++) {
      packetOffsets[i] = i / packetCount;
    }
    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
    const packetMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.09,
      transparent: true,
      opacity: 0.85,
    });
    const packetPoints = new THREE.Points(packetGeo, packetMat);
    rootGroup.add(packetPoints);

    // Ambient dust
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 12;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x71717a,
      size: 0.03,
      transparent: true,
      opacity: 0.35,
    });
    rootGroup.add(new THREE.Points(dustGeo, dustMat));

    // Mouse & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const mouseTarget = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.set(x, y);
      mouseTarget.x = x * 0.3;
      mouseTarget.y = y * 0.2;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(stageMeshes);
      if (hits.length > 0) {
        const idx = (hits[0].object as any).userData.stageIdx;
        if (idx !== undefined) {
          setHoveredStage(STAGES[idx]);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredStage(null);
        container.style.cursor = 'default';
      }
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(stageMeshes);
      if (hits.length > 0) {
        const idx = (hits[0].object as any).userData.stageIdx;
        if (idx !== undefined) {
          setActiveStage(STAGES[idx]);
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // Scroll effect
    let scrollSpeed = 0;
    const handleScroll = () => {
      scrollSpeed = 0.015;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      rootGroup.rotation.y = THREE.MathUtils.lerp(rootGroup.rotation.y, mouseTarget.x + scrollSpeed, 0.05);
      rootGroup.rotation.x = THREE.MathUtils.lerp(rootGroup.rotation.x, -mouseTarget.y, 0.05);
      scrollSpeed *= 0.94;

      // Pulse the failed stage
      const failedHalo = stageHalos[4];
      if (failedHalo) {
        const p = Math.sin(time * 6) * 0.15 + 1.0;
        failedHalo.scale.set(p, p, p);
        failedHalo.rotation.z += delta * 1.8;
      }

      // Rotate all halos gently
      stageHalos.forEach((h, i) => {
        if (i !== 4) h.rotation.z += delta * 0.5;
      });

      // Move packets along curve
      const posArr = packetGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < packetCount; i++) {
        let t = (packetOffsets[i] + time * 0.15) % 1.0;
        const pt = curve.getPointAt(t);
        posArr[i * 3] = pt.x;
        posArr[i * 3 + 1] = pt.y;
        posArr[i * 3 + 2] = pt.z;
      }
      packetGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  const cur = hoveredStage || activeStage;

  return (
    <div className="relative w-full h-[320px] lg:h-[380px] rounded-xl bg-[#0a0a0e] border border-white/[0.08] overflow-hidden flex flex-col">
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-[#0a0a0e]/80 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs text-zinc-300 font-semibold tracking-wide">
            PIPELINE DEVSECOPS 3D · FLUX D'EXÉCUTION CONTINU
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
          WebGL Interactif · Survolez une étape du pipeline
        </span>
      </div>

      <div ref={mountRef} className="w-full flex-1 touch-none" />

      {/* Dynamic Stage Details HUD at bottom left */}
      <div className="absolute bottom-3 left-3 z-10 max-w-xs w-full bg-[#111116]/95 backdrop-blur-md rounded-lg p-3 border border-white/10 shadow-xl pointer-events-none">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-xs font-bold text-zinc-100">{cur.name}</span>
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
              cur.status === 'failed'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                : cur.status === 'warning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {cur.status === 'failed' ? 'Échec' : cur.status === 'warning' ? 'Alerte' : 'Succès'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>Durée du run : {cur.duration}</span>
          <span>Étape {STAGES.findIndex((s) => s.id === cur.id) + 1} / 5</span>
        </div>
        {cur.status === 'failed' && (
          <div className="mt-1.5 text-[10px] text-rose-300 bg-rose-950/40 border border-rose-800/40 p-1.5 rounded flex items-center gap-1.5">
            <Warning size={12} className="text-rose-400 shrink-0" />
            <span>Webhook ArgoCD en timeout 504 · Retry en attente</span>
          </div>
        )}
      </div>

      {/* Stage Legend at bottom right */}
      <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-2.5 px-3 py-1 rounded bg-zinc-900/80 backdrop-blur-md border border-white/5 font-mono text-[10px] text-zinc-400">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Passé</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Alerte CVE</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Échec Webhook</span>
      </div>
    </div>
  );
};
