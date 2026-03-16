import { useEffect, useRef, useState } from 'react';

export default function ShaderBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    // Skip WebGL entirely on mobile
    if (window.innerWidth < 768) {
      setWebglFailed(true);
      return;
    }

    // Quick WebGL support check before loading Three.js
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('WebGL not available, using CSS fallback');
        setWebglFailed(true);
        return;
      }
    } catch {
      console.warn('WebGL check failed, using CSS fallback');
      setWebglFailed(true);
      return;
    }

    // Only import Three.js if WebGL is confirmed available
    let cancelled = false;

    (async () => {
      try {
        const THREE = await import('three');
        if (cancelled || !containerRef.current) return;

        const container = containerRef.current;
        const camera = new THREE.Camera();
        camera.position.z = 1;
        const scene = new THREE.Scene();
        const geometry = new THREE.PlaneGeometry(2, 2);

        const uniforms = {
          time: { value: 1.0 },
          resolution: { value: new THREE.Vector2() },
        };

        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: 'void main(){gl_Position=vec4(position,1.0);}',
          fragmentShader: `
            precision highp float;
            uniform vec2 resolution;
            uniform float time;
            void main(){
              vec2 uv=(gl_FragCoord.xy*2.0-resolution.xy)/min(resolution.x,resolution.y);
              float t=time*0.05;
              float lw=0.002;
              vec3 c=vec3(0.0);
              for(int j=0;j<3;j++){
                for(int i=0;i<5;i++){
                  c[j]+=lw*float(i*i)/abs(fract(t-0.01*float(j)+float(i)*0.01)*5.0-length(uv)+mod(uv.x+uv.y,0.2));
                }
              }
              gl_FragColor=vec4(c,1.0);
            }
          `,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const resize = () => {
          if (!container) return;
          renderer.setSize(container.clientWidth, container.clientHeight);
          uniforms.resolution.value.set(renderer.domElement.width, renderer.domElement.height);
        };
        resize();
        window.addEventListener('resize', resize);

        let animId = 0;
        const animate = () => {
          animId = requestAnimationFrame(animate);
          uniforms.time.value += 0.05;
          renderer.render(scene, camera);
        };
        animate();

        // Store cleanup refs on the container element
        (container as any).__shaderCleanup = () => {
          window.removeEventListener('resize', resize);
          cancelAnimationFrame(animId);
          try {
            if (container.contains(renderer.domElement)) {
              container.removeChild(renderer.domElement);
            }
          } catch {}
          renderer.dispose();
          geometry.dispose();
          material.dispose();
        };
      } catch (err) {
        console.warn('WebGL shader init failed, using CSS fallback:', err);
        if (!cancelled) setWebglFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (containerRef.current && (containerRef.current as any).__shaderCleanup) {
        (containerRef.current as any).__shaderCleanup();
      }
    };
  }, []);

  return (
    <>
      {/* WebGL shader container (hidden if failed) */}
      {!webglFailed && (
        <div ref={containerRef} className="absolute inset-0 w-full h-full" style={{ background: '#050507' }} />
      )}

      {/* CSS fallback — animated gradient (shown if WebGL unavailable) */}
      {webglFailed && (
        <div className="absolute inset-0 w-full h-full" style={{ background: '#050507', overflow: 'hidden' }}>
          {/* Animated purple orb */}
          <div
            style={{
              position: 'absolute',
              width: 600,
              height: 600,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #7C5CFC 0%, transparent 70%)',
              top: '-10%',
              right: '-10%',
              opacity: 0.07,
              filter: 'blur(120px)',
              animation: 'float-orb-1 20s ease-in-out infinite',
            }}
          />
          {/* Animated green orb */}
          <div
            style={{
              position: 'absolute',
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #00E59B 0%, transparent 70%)',
              bottom: '-5%',
              left: '-5%',
              opacity: 0.05,
              filter: 'blur(100px)',
              animation: 'float-orb-2 25s ease-in-out infinite',
            }}
          />
          {/* Animated blue orb */}
          <div
            style={{
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
              top: '40%',
              left: '30%',
              opacity: 0.04,
              filter: 'blur(80px)',
              animation: 'float-orb-3 18s ease-in-out infinite',
            }}
          />
          <style>{`
            @keyframes float-orb-1 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(30px, -30px) scale(1.05); }
              66% { transform: translate(-20px, 20px) scale(0.95); }
            }
            @keyframes float-orb-2 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(-25px, 25px) scale(1.03); }
              66% { transform: translate(15px, -15px) scale(0.97); }
            }
            @keyframes float-orb-3 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(20px, -20px) scale(1.04); }
            }
          `}</style>
        </div>
      )}

      {/* Dark overlay for text readability (always shown) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(5,5,7,0.5), rgba(5,5,7,0.95))',
        }}
      />
    </>
  );
}
