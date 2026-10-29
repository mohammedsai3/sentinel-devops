import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ShieldCheck, Warning, Cpu, Pulse } from '@phosphor-icons/react';

interface NodeData {
  id: string;
  name: string;
  type: string;
  latency: string;
  status: 'nominal' | 'warning' | 'critical';
  position: [number, number, number];
  qps: number;
  podCount: number;
}

const NODES_DATA: NodeData[] = [
  {
    id: 'edge-gw',
    name: 'Ingress Cloudflare',
    type: 'Edge Gateway',
    latency: '8ms',
    status: 'nominal',
    position: [-4.5, 2.5, 0],
    qps: 18400,
    podCount: 6,
  },
  {
    id: 'api-gateway',
    name: 'Traefik API Gateway',
    type: 'Reverse Proxy',
    latency: '18ms',
    status: 'nominal',
    position: [-2.2, 0.8, 1.2],
    qps: 12200,
    podCount: 12,
  },
  {
    id: 'auth-service',
    name: 'Auth Vault OAuth2',
    type: 'Security Kernel',
    latency: '12ms',
    status: 'nominal',
    position: [-1.2, 2.8, -1.0],
    qps: 4500,
    podCount: 4,
  },
  {
    id: 'cart-service',
    name: 'Cart / Checkout Svc',
    type: 'Core Microservice',
    latency: '240ms',
    status: 'warning',
    position: [0.8, -0.5, 1.5],
    qps: 3100,
    podCount: 8,
  },
  {
    id: 'redis-saturn',
    name: 'Redis Saturn Cluster',
    type: 'In-Memory Cache',
    latency: '412ms',
    status: 'critical',
    position: [3.2, -1.8, 0.5],
    qps: 28900,
    podCount: 16,
  },
  {
    id: 'postgres-db',
    name: 'PostgreSQL Primary EU',
    type: 'Relational DB',
    latency: '4ms',
    status: 'nominal',
    position: [2.5, 2.2, -1.5],
    qps: 6200,
    podCount: 3,
  },
  {
    id: 'kafka-bus',
    name: 'Kafka Broker Fleet',
    type: 'Message Queue',
    latency: '6ms',
    status: 'nominal',
    position: [-0.5, -2.5, -0.8],
    qps: 42000,
    podCount: 5,
  },
  {
    id: 'workers-fleet',
    name: 'Async Workers Pool',
    type: 'Background Tasks',
    latency: '14ms',
    status: 'nominal',
    position: [1.8, -3.2, 0.2],
    qps: 1900,
    podCount: 24,
  },
];

const CONNECTIONS: [number, number][] = [
  [0, 1], // Ingress -> Gateway
  [1, 2], // Gateway -> Auth
  [1, 3], // Gateway -> Cart
  [3, 4], // Cart -> Redis (SATURATED)
  [3, 5], // Cart -> Postgres
  [1, 6], // Gateway -> Kafka
  [6, 7], // Kafka -> Workers
  [7, 5], // Workers -> Postgres
  [4, 6], // Redis -> Kafka
];

interface ClusterTopologyWebGLProps {
  onSelectNode?: (node: NodeData) => void;
  selectedNodeId?: string | null;
}

export const ClusterTopologyWebGL: React.FC<ClusterTopologyWebGLProps> = ({
  onSelectNode,
  selectedNodeId,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);
  const [activeNode, setActiveNode] = useState<NodeData>(NODES_DATA[4]); // default to redis-saturn
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08080a, 0.04);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 11);

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

    // Color definitions
    const statusColors = {
      nominal: new THREE.Color('#10b981'),
      warning: new THREE.Color('#f59e0b'),
      critical: new THREE.Color('#ef4444'),
    };

    // Node Meshes
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeOutlines: THREE.Mesh[] = [];

    NODES_DATA.forEach((node, index) => {
      const color = statusColors[node.status];
      const isCritical = node.status === 'critical';

      // Inner sphere
      const sphereGeo = new THREE.SphereGeometry(isCritical ? 0.42 : 0.32, 24, 24);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: false,
      });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(...node.position);
      (mesh as any).userData = { nodeIndex: index };
      rootGroup.add(mesh);
      nodeMeshes.push(mesh);

      // Outer wireframe halo
      const haloGeo = new THREE.IcosahedronGeometry(isCritical ? 0.75 : 0.55, 1);
      const haloMat = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: isCritical ? 0.8 : 0.35,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.set(...node.position);
      rootGroup.add(haloMesh);
      nodeOutlines.push(haloMesh);
    });

    // Connection Lines
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x3f3f46,
      transparent: true,
      opacity: 0.45,
    });
    const critLineMat = new THREE.LineBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.85,
    });

    CONNECTIONS.forEach(([fromIdx, toIdx]) => {
      const p1 = new THREE.Vector3(...NODES_DATA[fromIdx].position);
      const p2 = new THREE.Vector3(...NODES_DATA[toIdx].position);
      const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const isCritLink =
        (fromIdx === 3 && toIdx === 4) || (fromIdx === 4 && toIdx === 6);
      const line = new THREE.Line(geom, isCritLink ? critLineMat : lineMat);
      rootGroup.add(line);
    });

    // Ambient floating particles (Telemetry Packets)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 14;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.05,
      transparent: true,
      opacity: 0.4,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particlePoints);

    // Raycasting for interactive hover and click
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      mouseVector.set(x, y);

      mouseRef.current.x = x * 0.4;
      mouseRef.current.y = y * 0.3;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as any;
        const nodeIndex = hit.userData.nodeIndex;
        if (nodeIndex !== undefined) {
          setHoveredNode(NODES_DATA[nodeIndex]);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredNode(null);
        container.style.cursor = 'default';
      }
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object as any;
        const nodeIndex = hit.userData.nodeIndex;
        if (nodeIndex !== undefined) {
          const selected = NODES_DATA[nodeIndex];
          setActiveNode(selected);
          if (onSelectNode) onSelectNode(selected);
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // Scroll interaction: slight rotation acceleration on scroll
    let scrollVelocity = 0;
    const handleScroll = () => {
      scrollVelocity = 0.02;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera interpolation towards mouse pointer
      targetRotationRef.current.x +=
        (mouseRef.current.y - targetRotationRef.current.x) * 0.05;
      targetRotationRef.current.y +=
        (mouseRef.current.x - targetRotationRef.current.y) * 0.05;

      rootGroup.rotation.x = targetRotationRef.current.x * 0.3;
      rootGroup.rotation.y =
        targetRotationRef.current.y * 0.4 +
        time * 0.08 +
        scrollVelocity;

      scrollVelocity *= 0.92;

      // Pulse the critical node
      const critNodeMesh = nodeMeshes[4]; // Redis saturn
      const critHalo = nodeOutlines[4];
      if (critNodeMesh && critHalo) {
        const pulse = Math.sin(time * 5) * 0.12 + 1.0;
        critHalo.scale.set(pulse, pulse, pulse);
        critHalo.rotation.y += delta * 1.5;
        critHalo.rotation.x += delta * 0.8;
      }

      // Gently rotate all halos
      nodeOutlines.forEach((halo, i) => {
        if (i !== 4) {
          halo.rotation.y += delta * 0.4;
          halo.rotation.z += delta * 0.2;
        }
      });

      // Drift particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(time + i) * 0.002;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
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
  }, [onSelectNode]);

  return (
    <div className="relative w-full h-[380px] lg:h-[460px] rounded-xl bg-[#0a0a0e] border border-white/[0.08] overflow-hidden flex flex-col">
      {/* HUD Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-[#0a0a0e]/80 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs text-zinc-300 font-semibold tracking-wide">
            TOPOLOGIE MESH 3D · KUBERNETES & CACHE
          </span>
          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-white/5">
            WebGL 60 FPS
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
          <span className="text-[11px] text-zinc-500 hidden md:inline">
            Cliquez pour inspecter · Glissez pour orienter
          </span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-white/5 text-[11px]">
            <Pulse size={13} className="text-emerald-400" />
            <span className="text-zinc-300">8 nœuds actifs</span>
          </div>
        </div>
      </div>

      {/* WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full flex-1 touch-none" />

      {/* Floating Dynamic HUD Inspection Card (bottom left) */}
      <div className="absolute bottom-4 left-4 z-10 max-w-xs w-full bg-[#111116]/95 backdrop-blur-md rounded-lg p-3.5 border border-white/10 shadow-xl shadow-black/60 pointer-events-none transition-all duration-200">
        {hoveredNode || activeNode ? (
          (() => {
            const current = hoveredNode || activeNode;
            const isCrit = current.status === 'critical';
            const isWarn = current.status === 'warning';
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-zinc-100 truncate">
                    {current.name}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                      isCrit
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                        : isWarn
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {current.status}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                  <span>Rôle: {current.type}</span>
                  <span>{current.podCount} pods</span>
                </div>

                <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <Pulse size={12} className={isCrit ? 'text-rose-400' : 'text-emerald-400'} />
                    <span className="text-zinc-400">Latence:</span>
                    <span className={`font-bold ${isCrit ? 'text-rose-400' : 'text-zinc-200'}`}>
                      {current.latency}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu size={12} className="text-zinc-400" />
                    <span className="text-zinc-400">Débit:</span>
                    <span className="text-zinc-200 font-medium">
                      {(current.qps / 1000).toFixed(1)}k qps
                    </span>
                  </div>
                </div>

                {isCrit && (
                  <div className="text-[10px] text-rose-300 bg-rose-950/40 border border-rose-800/40 p-1.5 rounded flex items-center gap-1.5">
                    <Warning size={13} className="shrink-0 text-rose-400" />
                    <span>Rupture imminente du pool · Lié au ticket #892</span>
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <div className="text-xs text-zinc-400 font-mono">Survolez un nœud du cluster</div>
        )}
      </div>

      {/* Legend strip (bottom right) */}
      <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-md bg-[#111116]/85 backdrop-blur-md border border-white/5 font-mono text-[11px] text-zinc-400 pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Nominal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Latence élevée
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" /> Incident critique
        </span>
      </div>
    </div>
  );
};
