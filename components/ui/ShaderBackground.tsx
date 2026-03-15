import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ShaderBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(true);

  // Handle window resizing to toggle desktop/mobile modes
  useEffect(() => {
    // Check initial window width
    setIsDesktop(window.innerWidth >= 768);

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize and clean up Three.js WebGL shader
  useEffect(() => {
    if (!isDesktop || !containerRef.current) return;

    const container = containerRef.current;
    
    // Setup Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // limit pixel ratio for performance
    
    if (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Uniforms
    const uniforms = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    // Material with custom shader
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: `
        #define TWO_PI 6.2831853072
        #define PI 3.14159265359
        precision highp float;
        uniform vec2 resolution;
        uniform float time;

        void main(void) {
          vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
          float t = time * 0.05;
          float lineWidth = 0.002;
          vec3 color = vec3(0.0);
          for(int j = 0; j < 3; j++){
            for(int i = 0; i < 5; i++){
              color[j] += lineWidth * float(i*i) / abs(fract(t - 0.01*float(j) + float(i)*0.01) * 5.0 - length(uv) + mod(uv.x + uv.y, 0.2));
            }
          }
          gl_FragColor = vec4(color[0], color[1], color[2], 1.0);
        }
      `,
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    // Full screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation Loop
    let animationFrameId: number;
    let startTime = performance.now();

    const animate = (time: number) => {
      uniforms.time.value = (time - startTime) * 0.001;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate(performance.now());

    // Handle Resize within Three.js context
    const handleResizeChild = () => {
      if (window.innerWidth >= 768) {
        uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResizeChild);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResizeChild);
      cancelAnimationFrame(animationFrameId);
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isDesktop]);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-sole-bg">
      {/* Orbs */}
      <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-sole-accent rounded-full blur-[120px] opacity-[0.07] animate-float" 
           style={{ animationDelay: '0s', animationDuration: '25s' }} />
      <div className="absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] bg-sole-green rounded-full blur-[100px] opacity-[0.05] animate-float" 
           style={{ animationDelay: '-5s', animationDuration: '22s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#3B82F6] rounded-full blur-[80px] opacity-[0.04] animate-float" 
           style={{ animationDelay: '-10s', animationDuration: '18s' }} />

      {/* Gradient Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124, 92, 252, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 92, 252, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* WebGL Canvas Container */}
      {isDesktop && (
        <div 
          ref={containerRef} 
          className="absolute inset-0 opacity-50"
        />
      )}

      {/* Overlay to ensure text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(5,5,7,0.7), rgba(5,5,7,0.95))'
        }}
      />
    </div>
  );
}
