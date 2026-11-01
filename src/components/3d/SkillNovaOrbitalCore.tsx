import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface SkillNova3DProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
  className?: string;
}

export const SkillNovaOrbitalCore: React.FC<SkillNova3DProps> = ({
  size = 'md',
  interactive = true,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  // Dimensions based on size preset
  const dimensions = {
    sm: { width: 140, height: 140, scale: 0.8 },
    md: { width: 280, height: 280, scale: 1.1 },
    lg: { width: 420, height: 420, scale: 1.4 },
    hero: { width: 520, height: 520, scale: 1.65 },
  }[size];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // WebGL support check
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    // Three.js Scene Setup
    const width = container.clientWidth || dimensions.width;
    const height = container.clientHeight || dimensions.height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch {
      setHasWebGL(false);
      return;
    }

    // SkillNova 3D Master Group
    const masterGroup = new THREE.Group();
    masterGroup.scale.set(dimensions.scale, dimensions.scale, dimensions.scale);
    scene.add(masterGroup);

    // 1. Central Futuristic Core (Icosahedron Knowledge Sphere)
    const coreGeometry = new THREE.IcosahedronGeometry(0.9, 1);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x15233A,
      emissive: 0x397BFF,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.9,
      transmission: 0.6,
      opacity: 0.9,
      transparent: true,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    masterGroup.add(coreMesh);

    // Wireframe Cage for the Core
    const wireframeGeometry = new THREE.IcosahedronGeometry(0.93, 1);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x77B4FF,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    masterGroup.add(wireframeMesh);

    // 2. Orbital Torus Ring 1 (Tilted Azimuth)
    const ring1Geometry = new THREE.TorusGeometry(1.6, 0.024, 16, 100);
    const ring1Material = new THREE.MeshStandardMaterial({
      color: 0x397BFF,
      emissive: 0x397BFF,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    masterGroup.add(ring1);

    // 3. Orbital Torus Ring 2 (Perpendicular Gyro Ring)
    const ring2Geometry = new THREE.TorusGeometry(1.95, 0.018, 16, 120);
    const ring2Material = new THREE.MeshStandardMaterial({
      color: 0x77B4FF,
      emissive: 0x77B4FF,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.9,
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    masterGroup.add(ring2);

    // 4. Subtle Orbital Nodes (Satellites representing Knowledge & Career)
    const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xF0F5FF });

    const node1 = new THREE.Mesh(nodeGeometry, nodeMaterial);
    const node2 = new THREE.Mesh(nodeGeometry, nodeMaterial);
    masterGroup.add(node1);
    masterGroup.add(node2);

    // 5. Star Dust & Particle Galaxy (Knowledge Dust)
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x77B4FF,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0x101A2D, 2.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x397BFF, 4, 15);
    pointLight1.position.set(4, 3, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x77B4FF, 3, 15);
    pointLight2.position.set(-4, -3, 3);
    scene.add(pointLight2);

    // Interaction & Animation Loop
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.45;
      targetY = y * 0.35;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Mouse Lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Floating oscillation
      masterGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.12;

      // Rotations
      coreMesh.rotation.y = elapsedTime * 0.25;
      coreMesh.rotation.x = elapsedTime * 0.15;
      wireframeMesh.rotation.y = -elapsedTime * 0.2;
      wireframeMesh.rotation.z = elapsedTime * 0.1;

      ring1.rotation.z = elapsedTime * 0.35;
      ring2.rotation.x = -elapsedTime * 0.4;
      ring2.rotation.y = elapsedTime * 0.25;

      // Satellite node trajectories
      node1.position.x = Math.cos(elapsedTime * 0.9) * 1.6;
      node1.position.y = Math.sin(elapsedTime * 0.9) * 1.6 * Math.sin(Math.PI / 3);
      node1.position.z = Math.sin(elapsedTime * 0.9) * 1.6 * Math.cos(Math.PI / 3);

      node2.position.x = Math.cos(-elapsedTime * 1.1) * 1.95;
      node2.position.z = Math.sin(-elapsedTime * 1.1) * 1.95;
      node2.position.y = Math.sin(elapsedTime * 0.8) * 0.5;

      // Particle subtle rotation
      particles.rotation.y = elapsedTime * 0.06;

      // Parallax tilt from mouse
      masterGroup.rotation.y = mouseX + Math.sin(elapsedTime * 0.4) * 0.1;
      masterGroup.rotation.x = -mouseY + Math.cos(elapsedTime * 0.5) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || dimensions.width;
      const newHeight = container.clientHeight || dimensions.height;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeometry.dispose();
      coreMaterial.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      ring1Geometry.dispose();
      ring1Material.dispose();
      ring2Geometry.dispose();
      ring2Material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [dimensions.width, dimensions.height, dimensions.scale, interactive]);

  // Graceful 2D Fallback for environments lacking WebGL
  if (!hasWebGL) {
    return (
      <div className={`relative flex items-center justify-center ${className}`} style={{ width: dimensions.width, height: dimensions.height }}>
        <div className="relative w-28 h-28 flex items-center justify-center animate-pulse-subtle">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#397BFF] animate-spin" style={{ animationDuration: '14s' }} />
          <div className="absolute inset-2 rounded-full border-2 border-[#77B4FF]/40 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#397BFF] to-[#101A2D] shadow-[0_0_25px_rgba(57,123,255,0.7)] flex items-center justify-center rotate-45">
            <span className="text-[#F0F5FF] font-black text-xl -rotate-45">SN</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: '100%',
      }}
    />
  );
};
