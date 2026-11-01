import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, RotateCcw, FastForward, CheckCircle2, Sparkles, Compass } from 'lucide-react';

interface MountainPathProps {
  onIntroComplete?: () => void;
  autoStart?: boolean;
}

export const MILESTONES = [
  { step: 1, name: 'Learn', subtitle: 'Curated curriculum & grounded lectures', pos: 0.1, color: '#176BFF' },
  { step: 2, name: 'Build', subtitle: 'Production projects & verified code', pos: 0.28, color: '#00A3FF' },
  { step: 3, name: 'Explore', subtitle: 'Emerging tech & research papers', pos: 0.48, color: '#00D9FF' },
  { step: 4, name: 'Mentorship', subtitle: 'Direct doubt clearance & 1-on-1 code reviews', pos: 0.68, color: '#176BFF' },
  { step: 5, name: 'Opportunities', subtitle: 'Verified internships & top-tier hackathons', pos: 0.85, color: '#00A3FF' },
  { step: 6, name: 'Success', subtitle: 'Industry readiness & career placement', pos: 1.0, color: '#00D9FF' }
];

export const MountainPathToSuccess: React.FC<MountainPathProps> = ({ onIntroComplete, autoStart = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isLowPowerFallback, setIsLowPowerFallback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoStart);

  useEffect(() => {
    // Check if intro was already skipped or completed in this session
    const hasSeenIntro = sessionStorage.getItem('skillnova_intro_seen');
    if (hasSeenIntro === 'true') {
      setIsAnimationComplete(true);
      setJourneyProgress(1);
      setCurrentMilestoneIndex(MILESTONES.length - 1);
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setIsLowPowerFallback(true);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xF5F9FF, 0.012);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, 14, 38);

    // --- Lights with Fluorescent Blue Accents ---
    const ambientLight = new THREE.AmbientLight(0xEAF3FF, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.8);
    sunLight.position.set(25, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Glowing fluorescent blue beacon at mountain summit
    const summitBeacon = new THREE.PointLight(0x00A3FF, 4, 35);
    summitBeacon.position.set(0, 24, -28);
    scene.add(summitBeacon);

    const secondaryCyan = new THREE.PointLight(0x00D9FF, 2.5, 30);
    secondaryCyan.position.set(8, 12, -10);
    scene.add(secondaryCyan);

    // --- Mountain Terrain Geometry ---
    const terrainGeo = new THREE.PlaneGeometry(80, 80, 64, 64);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      // Procedural mountain peaks concentrated in the distance (-Z)
      const distToSummit = Math.sqrt(x * x + Math.pow(z + 28, 2));
      let heightVal = Math.max(0, 26 - distToSummit * 0.7);

      // Add gentle ridgelines
      heightVal += Math.sin(x * 0.2) * Math.cos(z * 0.2) * 2.5;
      heightVal += Math.sin(x * 0.5) * 1.2;

      // Carve out a valley for the path up the middle
      const pathDist = Math.abs(x - Math.sin(z * 0.15) * 5);
      if (pathDist < 4.5 && z > -28) {
        heightVal = Math.min(heightVal, (pathDist / 4.5) * (heightVal * 0.6));
      }

      posAttr.setY(i, Math.max(0, heightVal));
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0xEEF5FF,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // --- Curved Winding Pathway ---
    const pathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.4, 26),        // Start: Student base
      new THREE.Vector3(-4, 2.2, 16),      // Milestone 1: Learn
      new THREE.Vector3(4.5, 5.5, 6),       // Milestone 2: Build
      new THREE.Vector3(-3.5, 10.2, -4),    // Milestone 3: Explore
      new THREE.Vector3(3.8, 15.0, -14),    // Milestone 4: Mentorship
      new THREE.Vector3(-1.8, 19.5, -22),   // Milestone 5: Opportunities
      new THREE.Vector3(0, 24.2, -28),      // Summit: Success
    ]);

    const pathGeo = new THREE.TubeGeometry(pathCurve, 120, 0.45, 12, false);
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x176BFF,
      emissive: 0x00A3FF,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      metalness: 0.4
    });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    scene.add(pathMesh);

    // --- Milestone Floating Rings / Markers Along Path ---
    const milestoneObjects: THREE.Group[] = [];
    MILESTONES.forEach((m) => {
      const p = pathCurve.getPoint(m.pos);
      const markerGroup = new THREE.Group();
      markerGroup.position.copy(p);

      // Torus ring
      const ringGeo = new THREE.TorusGeometry(0.85, 0.1, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: m.color,
        emissive: m.color,
        emissiveIntensity: 0.9,
        metalness: 0.8,
        roughness: 0.2
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      markerGroup.add(ringMesh);

      // Glowing orb inside ring
      const orbGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      markerGroup.add(orbMesh);

      scene.add(markerGroup);
      milestoneObjects.push(markerGroup);
    });

    // --- Student Character Avatar at the Path ---
    const studentGroup = new THREE.Group();
    // Character body (sleek futuristic explorer)
    const bodyGeo = new THREE.CapsuleGeometry(0.35, 0.7, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x15243B,
      roughness: 0.4,
      metalness: 0.6
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.8;
    studentGroup.add(bodyMesh);

    // Glowing visor / backpack
    const visorGeo = new THREE.BoxGeometry(0.4, 0.15, 0.2);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x00D9FF });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 1.15, -0.22);
    studentGroup.add(visorMesh);

    const packGeo = new THREE.BoxGeometry(0.38, 0.45, 0.25);
    const packMat = new THREE.MeshStandardMaterial({ color: 0x00A3FF, emissive: 0x00A3FF, emissiveIntensity: 0.5 });
    const packMesh = new THREE.Mesh(packGeo, packMat);
    packMesh.position.set(0, 0.85, 0.25);
    studentGroup.add(packMesh);

    scene.add(studentGroup);

    // --- Floating Particle Field around the Ascent ---
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random();
      const p = pathCurve.getPoint(t);
      particlePositions[i * 3] = p.x + (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 1] = p.y + Math.random() * 4;
      particlePositions[i * 3 + 2] = p.z + (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00D9FF,
      size: 0.22,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Animation Loop ---
    let animationFrameId: number;
    let progress = 0;
    const speed = 0.0022; // Smooth cinematic pace

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate milestone markers subtly
      milestoneObjects.forEach((m, idx) => {
        m.rotation.y += 0.02 + idx * 0.005;
        m.position.y += Math.sin(Date.now() * 0.003 + idx) * 0.003;
      });

      // Shimmer particles
      particles.rotation.y += 0.001;

      // Animate character along curve
      if (isPlaying && progress < 1) {
        progress += speed;
        if (progress > 1) progress = 1;

        setJourneyProgress(progress);

        // Update active milestone
        const activeIdx = MILESTONES.findIndex((m, i) => {
          const next = MILESTONES[i + 1];
          return progress >= m.pos - 0.05 && (!next || progress < next.pos);
        });
        if (activeIdx !== -1) {
          setCurrentMilestoneIndex(activeIdx);
        }

        if (progress >= 1 && !isAnimationComplete) {
          setIsAnimationComplete(true);
          sessionStorage.setItem('skillnova_intro_seen', 'true');
          if (onIntroComplete) {
            onIntroComplete();
          }
        }
      }

      // Move student along path curve
      const charPos = pathCurve.getPoint(Math.min(0.999, progress));
      studentGroup.position.copy(charPos);

      // Orient student character along the path direction
      const nextPoint = pathCurve.getPoint(Math.min(1.0, progress + 0.01));
      studentGroup.lookAt(nextPoint);

      // Cinematic camera following student with gentle elevation
      const targetCamX = charPos.x * 0.4;
      const targetCamY = Math.max(12, charPos.y + 6);
      const targetCamZ = charPos.z + 18;

      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.position.z += (targetCamZ - camera.position.z) * 0.04;

      const lookTarget = new THREE.Vector3(charPos.x * 0.5, charPos.y + 2, charPos.z - 6);
      camera.lookAt(lookTarget);

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
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      terrainGeo.dispose();
      terrainMat.dispose();
      pathGeo.dispose();
      pathMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [isPlaying, isAnimationComplete, onIntroComplete]);

  const handleSkipIntro = () => {
    setIsPlaying(false);
    setJourneyProgress(1);
    setCurrentMilestoneIndex(MILESTONES.length - 1);
    setIsAnimationComplete(true);
    sessionStorage.setItem('skillnova_intro_seen', 'true');
    if (onIntroComplete) {
      onIntroComplete();
    }
  };

  const handleReplay = () => {
    setIsAnimationComplete(false);
    setJourneyProgress(0);
    setCurrentMilestoneIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#DFE9F6] bg-gradient-to-b from-[#F5F9FF] via-[#EAF3FF] to-white shadow-2xl">
      {/* 3D WebGL Canvas Container */}
      {!isLowPowerFallback ? (
        <div ref={mountRef} className="w-full h-[460px] md:h-[540px] cursor-grab active:cursor-grabbing" />
      ) : (
        /* Optimized 2D Graceful Fallback for Low-Power Devices */
        <div className="w-full h-[460px] md:h-[540px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#EAF3FF] via-white to-[#F5F9FF] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#00A3FF_0%,transparent_65%)] opacity-10" />
          <div className="relative z-10 text-center max-w-lg space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#176BFF]/10 text-[#176BFF] flex items-center justify-center mx-auto border border-[#00A3FF]/20 shadow-lg">
              <Compass className="w-8 h-8 animate-pulse text-[#00A3FF]" />
            </div>
            <h3 className="text-2xl font-black text-[#15243B]">Mountain Path to Success</h3>
            <p className="text-sm text-[#73839B]">
              Your step-by-step ascent through structured engineering education, production projects, and verified mentor reviews.
            </p>
          </div>
        </div>
      )}

      {/* Floating Summit Branding Header */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2.5 bg-white/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#DFE9F6] shadow-sm pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00A3FF] animate-ping" />
          <span className="text-xs font-bold text-[#15243B] tracking-tight">Interactive 3D Pathway</span>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#176BFF] border border-[#00A3FF]/20">
            {Math.round(journeyProgress * 100)}% Ascent
          </span>
        </div>

        {/* Skip / Replay Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {!isAnimationComplete ? (
            <button
              onClick={handleSkipIntro}
              className="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-xs font-semibold text-[#15243B] border border-[#DFE9F6] hover:border-[#00A3FF] shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <span>Skip Intro</span>
              <FastForward className="w-3.5 h-3.5 text-[#00A3FF]" />
            </button>
          ) : (
            <button
              onClick={handleReplay}
              className="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-xs font-semibold text-[#15243B] border border-[#DFE9F6] hover:border-[#176BFF] shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#176BFF]" />
              <span>Replay Journey</span>
            </button>
          )}
        </div>
      </div>

      {/* Milestone Track Overlay at the Bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#DFE9F6] shadow-xl space-y-3">
          {/* Active Milestone Highlight Card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#176BFF] to-[#00A3FF] text-white flex items-center justify-center font-black text-xs shadow-md">
                {MILESTONES[currentMilestoneIndex].step}
              </span>
              <div>
                <h4 className="text-sm font-black text-[#15243B]">
                  Milestone: {MILESTONES[currentMilestoneIndex].name}
                </h4>
                <p className="text-xs text-[#73839B]">
                  {MILESTONES[currentMilestoneIndex].subtitle}
                </p>
              </div>
            </div>

            {journeyProgress >= 0.98 && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#176BFF] bg-[#EAF3FF] px-3 py-1 rounded-full border border-[#00A3FF]/30 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-[#00D9FF]" />
                Summit Achieved
              </span>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-6 gap-1.5">
            {MILESTONES.map((m, idx) => {
              const isPassed = journeyProgress >= m.pos;
              const isCurrent = idx === currentMilestoneIndex;
              return (
                <div key={m.step} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isPassed
                        ? 'bg-gradient-to-r from-[#176BFF] to-[#00A3FF]'
                        : isCurrent
                        ? 'bg-[#00D9FF] animate-pulse'
                        : 'bg-[#DFE9F6]'
                    }`}
                  />
                  <div className="text-[10px] text-center font-semibold truncate text-[#73839B]">
                    {m.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
