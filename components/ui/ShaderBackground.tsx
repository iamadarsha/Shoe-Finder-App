import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ShaderBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || window.innerWidth < 768) return;

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
        }`,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      uniforms.resolution.value.set(renderer.domElement.width, renderer.domElement.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let id = 0;
    const loop = () => {
      id = requestAnimationFrame(loop);
      uniforms.time.value += 0.05;
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(id);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full hidden md:block"
        style={{ background: '#050507' }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom,rgba(5,5,7,0.6),rgba(5,5,7,0.95))' }}
      />
    </>
  );
}
