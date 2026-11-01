import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, RotateCcw, FastForward, CheckCircle2, Sparkles, Compass, Award } from 'lucide-react';

interface MountainPathProps {
  onIntroComplete?: () => void;
  autoStart?: boolean;
}

export const MILESTONES = [
  { step: 1, name: 'LEARN', subtitle: 'Curated curriculum & grounded lectures', pos: 0.09, color: '#176BFF' },
  { step: 2, name: 'BUILD', subtitle: 'Production projects & verified code in browser', pos: 0.19, color: '#00A3FF' },
  { step: 3, name: 'EXPLORE', subtitle: 'Frameworks, microservices & architecture patterns', pos: 0.29, color: '#00D9FF' },
  { step: 4, name: 'MENTOR GUIDANCE', subtitle: 'Direct 1-on-1 doubt clearance & code reviews', pos: 0.39, color: '#176BFF' },
  { step: 5, name: 'INTERNSHIPS', subtitle: 'Corporate tech internships & production roles', pos: 0.49, color: '#00A3FF' },
  { step: 6, name: 'HACKATHONS', subtitle: 'High-intensity hackathon drills & cohort demos', pos: 0.59, color: '#00D9FF' },
  { step: 7, name: 'RESEARCH PAPERS', subtitle: 'Deep research paper analyses & emerging papers', pos: 0.69, color: '#176BFF' },
  { step: 8, name: 'EMERGING TECHNOLOGIES', subtitle: 'Agentic AI, WebAssembly & Cloud-native infra', pos: 0.79, color: '#00A3FF' },
  { step: 9, name: 'CAREER GUIDANCE', subtitle: 'Role-specific career blueprints & mock interviews', pos: 0.89, color: '#00D9FF' },
  { step: 10, name: 'SUCCESS', subtitle: 'Dream engineering placement & industry leadership', pos: 1.0, color: '#00D9FF' }
];

export const MountainPathToSuccess: React.FC<MountainPathProps> = ({ onIntroComplete, autoStart = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isLowPowerFallback, setIsLowPowerFallback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoStart);

  useEffect(() => {
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

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setIsLowPowerFallback(true);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xEAF3FC, 0.011);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 1000);
    camera.position.set(0, 16, 42);

    // --- Fluorescent Lighting (Clean light combo, not plain white) ---
    const ambientLight = new THREE.AmbientLight(0xE0EEFD, 1.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xF0F8FF, 1.9);
    sunLight.position.set(30, 50, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Fluorescent Glowing Summit Beacon (SUCCESS beacon)
    const summitBeacon = new THREE.PointLight(0x00D9FF, 5, 45);
    summitBeacon.position.set(0, 27, -28);
    scene.add(summitBeacon);

    const summitGlowOrb = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x00D9FF })
    );
    summitGlowOrb.position.set(0, 27, -28);
    scene.add(summitGlowOrb);

    const midPathLight = new THREE.PointLight(0x176BFF, 3.5, 35);
    midPathLight.position.set(5, 12, -4);
    scene.add(midPathLight);

    // --- Procedural Mountain Terrain ---
    const terrainGeo = new THREE.PlaneGeometry(90, 90, 70, 70);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      // Elevated summit mountain in distance
      const distToSummit = Math.sqrt(x * x + Math.pow(z + 28, 2));
      let heightVal = Math.max(0, 28 - distToSummit * 0.72);

      // Ridges
      heightVal += Math.sin(x * 0.22) * Math.cos(z * 0.22) * 2.8;
      heightVal += Math.sin(x * 0.45) * 1.4;

      // Carve winding valley path
      const pathDist = Math.abs(x - Math.sin(z * 0.16) * 5.2);
      if (pathDist < 4.8 && z > -28) {
        heightVal = Math.min(heightVal, (pathDist / 4.8) * (heightVal * 0.6));
      }

      posAttr.setY(i, Math.max(0, heightVal));
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0xDEEBFC,
      roughness: 0.82,
      metalness: 0.08,
      flatShading: true,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // --- 10-Milestone Continuous Winding Pathway ---
    const pathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.5, 30),        // Start: Base camp
      new THREE.Vector3(-4.0, 2.4, 24),    // 1. LEARN
      new THREE.Vector3(4.2, 5.0, 18),     // 2. BUILD
      new THREE.Vector3(-4.5, 7.8, 12),    // 3. EXPLORE
      new THREE.Vector3(3.8, 10.6, 6),     // 4. MENTOR GUIDANCE
      new THREE.Vector3(-3.6, 13.5, 0),    // 5. INTERNSHIPS
      new THREE.Vector3(4.2, 16.2, -6),    // 6. HACKATHONS
      new THREE.Vector3(-3.8, 19.0, -12),  // 7. RESEARCH PAPERS
      new THREE.Vector3(3.4, 21.8, -18),   // 8. EMERGING TECHNOLOGIES
      new THREE.Vector3(-2.0, 24.2, -23),  // 9. CAREER GUIDANCE
      new THREE.Vector3(0, 26.8, -28),     // 10. SUCCESS
    ]);

    // Fluorescent glowing pathway
    const pathGeo = new THREE.TubeGeometry(pathCurve, 150, 0.48, 14, false);
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x176BFF,
      emissive: 0x00A3FF,
      emissiveIntensity: 0.85,
      roughness: 0.25,
      metalness: 0.5
    });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    scene.add(pathMesh);

    // Outer neon glow rail
    const glowGeo = new THREE.TubeGeometry(pathCurve, 150, 0.58, 10, false);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00D9FF,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // --- 10 Milestone Floating Beacons along the path ---
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
        emissiveIntensity: 0.95,
        metalness: 0.8,
        roughness: 0.2
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      markerGroup.add(ringMesh);

      // Glowing orb inside
      const orbGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      markerGroup.add(orbMesh);

      scene.add(markerGroup);
      milestoneObjects.push(markerGroup);
    });

    // --- Student Explorer Avatar ---
    const studentGroup = new THREE.Group();
    // Character torso
    const bodyGeo = new THREE.CapsuleGeometry(0.36, 0.72, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x15243B,
      roughness: 0.4,
      metalness: 0.6
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.82;
    studentGroup.add(bodyMesh);

    // Fluorescent cyan visor
    const visorGeo = new THREE.BoxGeometry(0.42, 0.16, 0.22);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x00D9FF });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 1.18, -0.22);
    studentGroup.add(visorMesh);

    // Electric blue student backpack
    const packGeo = new THREE.BoxGeometry(0.4, 0.48, 0.26);
    const packMat = new THREE.MeshStandardMaterial({
      color: 0x00A3FF,
      emissive: 0x00A3FF,
      emissiveIntensity: 0.6
    });
    const packMesh = new THREE.Mesh(packGeo, packMat);
    packMesh.position.set(0, 0.88, 0.26);
    studentGroup.add(packMesh);

    scene.add(studentGroup);

    // --- Floating Particle Field ---
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random();
      const p = pathCurve.getPoint(t);
      particlePositions[i * 3] = p.x + (Math.random() - 0.5) * 7;
      particlePositions[i * 3 + 1] = p.y + Math.random() * 4.5;
      particlePositions[i * 3 + 2] = p.z + (Math.random() - 0.5) * 7;
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
    const speed = 0.0016; // Smooth, slow-motion cinematic ascent

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate milestone markers subtly
      milestoneObjects.forEach((m, idx) => {
        m.rotation.y += 0.02 + idx * 0.003;
        m.position.y += Math.sin(Date.now() * 0.003 + idx) * 0.003;
      });

      // Pulse summit beacon
      summitGlowOrb.scale.setScalar(1 + Math.sin(Date.now() * 0.004) * 0.15);

      // Shimmer particles
      particles.rotation.y += 0.0008;

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
      const targetCamX = charPos.x * 0.45;
      const targetCamY = Math.max(13, charPos.y + 6.5);
      const targetCamZ = charPos.z + 18;

      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.position.z += (targetCamZ - camera.position.z) * 0.04;

      const lookTarget = new THREE.Vector3(charPos.x * 0.5, charPos.y + 2.5, charPos.z - 7);
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
      glowGeo.dispose();
      glowMat.dispose();
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
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#00D9FF]/35 bg-gradient-to-b from-[#EBF3FD] via-[#F0F6FF] to-[#E3EFFF] shadow-[0_20px_50px_-10px_rgba(0,163,255,0.22)]">
      {/* 3D WebGL Canvas */}
      {!isLowPowerFallback ? (
        <div ref={mountRef} className="w-full h-[480px] md:h-[560px] cursor-grab active:cursor-grabbing" />
      ) : (
        /* Graceful 2D Fallback for Low-Power Devices */
        <div className="w-full h-[480px] md:h-[560px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#EAF3FF] via-[#E1EEFD] to-[#F5F9FF] relative overflow-hidden">
          <div className="relative z-10 text-center max-w-lg space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#176BFF]/15 text-[#176BFF] flex items-center justify-center mx-auto border border-[#00D9FF]/40 shadow-lg">
              <Compass className="w-8 h-8 animate-pulse text-[#00D9FF]" />
            </div>
            <h3 className="text-2xl font-black text-[#15243B]">Mountain Path to Success</h3>
            <p className="text-sm text-[#73839B]">
              Your 10-milestone ascent towards career leadership, engineering excellence, and industry placement.
            </p>
          </div>
        </div>
      )}

      {/* Floating Summit Branding Header */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2.5 bg-[#FAFCFF]/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#00D9FF]/30 shadow-md pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00D9FF] animate-ping" />
          <span className="text-xs font-bold text-[#15243B] tracking-tight">Interactive 3D Pathway</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#176BFF]/15 text-[#176BFF] border border-[#00A3FF]/30">
            {Math.round(journeyProgress * 100)}% Ascent
          </span>
        </div>

        {/* Skip / Replay Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {!isAnimationComplete ? (
            <button
              onClick={handleSkipIntro}
              className="px-3.5 py-1.5 rounded-xl bg-[#FAFCFF]/90 hover:bg-white text-xs font-bold text-[#15243B] border border-[#00D9FF]/30 hover:border-[#00D9FF] shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <span>Skip Intro</span>
              <FastForward className="w-3.5 h-3.5 text-[#00A3FF]" />
            </button>
          ) : (
            <button
              onClick={handleReplay}
              className="px-3.5 py-1.5 rounded-xl bg-[#FAFCFF]/90 hover:bg-white text-xs font-bold text-[#15243B] border border-[#00D9FF]/30 hover:border-[#176BFF] shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#176BFF]" />
              <span>Replay Journey</span>
            </button>
          )}
        </div>
      </div>

      {/* 10 Milestone Track Overlay at the Bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto">
        <div className="bg-[#FAFCFF]/90 backdrop-blur-md p-4 rounded-3xl border border-[#00D9FF]/35 shadow-xl space-y-3">
          {/* Active Milestone Highlight Card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#176BFF] to-[#00D9FF] text-white flex items-center justify-center font-black text-xs shadow-md shadow-[#00A3FF]/30">
                {MILESTONES[currentMilestoneIndex].step}
              </span>
              <div>
                <h4 className="text-sm font-black text-[#15243B]">
                  Milestone {MILESTONES[currentMilestoneIndex].step}: {MILESTONES[currentMilestoneIndex].name}
                </h4>
                <p className="text-xs text-[#73839B]">
                  {MILESTONES[currentMilestoneIndex].subtitle}
                </p>
              </div>
            </div>

            {journeyProgress >= 0.96 ? (
              <span className="flex items-center gap-1.5 text-xs font-black text-[#176BFF] bg-[#E1EEFD] px-3.5 py-1.5 rounded-full border border-[#00D9FF]/40 animate-pulse shadow-sm">
                <Sparkles className="w-4 h-4 text-[#00D9FF]" />
                SUCCESS • Summit Reached
              </span>
            ) : (
              <span className="hidden sm:inline-block text-[11px] font-mono text-[#73839B]">
                Milestone {currentMilestoneIndex + 1} of 10
              </span>
            )}
          </div>

          {/* 10-Step Stepper Progress Bar */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
            {MILESTONES.map((m, idx) => {
              const isPassed = journeyProgress >= m.pos;
              const isCurrent = idx === currentMilestoneIndex;
              return (
                <div key={m.step} className="space-y-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isPassed
                        ? 'bg-gradient-to-r from-[#176BFF] via-[#00A3FF] to-[#00D9FF] shadow-xs'
                        : isCurrent
                        ? 'bg-[#00D9FF] animate-pulse ring-2 ring-[#00D9FF]/40'
                        : 'bg-[#DFE9F6]'
                    }`}
                  />
                  <div className="text-[9px] text-center font-bold truncate text-[#15243B]/80">
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
