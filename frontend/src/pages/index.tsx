import Header from "@/components/landing/Header";
import { useEffect, useRef } from "react";
import PublicLayout from "@/app/PublicLayout";
import { ReactElement } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";
import * as THREE from "three";
import { Footer } from "react-day-picker";
import Link from "next/link";
import { useStytchUser } from "@stytch/nextjs";

export default function Home() {
  const { user, fromCache } = useStytchUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/explore");
    }
  }, [router, user]);

  if (user) {
    return null;
  }

  return (
    <VortexParticleSystemExact>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between p-6 pt-20 lg:px-10 lg:pt-24">
        <div className="flex flex-col gap-8 w-full mx-auto">
          <div className="w-full pt-20 lg:pt-10">
            <Header />
          </div>
          <footer className="absolute bottom-0 w-full lg:w-[calc(100%-5rem)] flex flex-col transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-center py-4 px-2 pb-8">
              <div className="inline-flex gap-3 items-center">
                <small className="text-xs font-medium leading-none border-r-[1px] mt-[2px] dark:text-muted-foreground border-r-muted-foreground pr-2 py-[3px]">
                  &copy; Spydr
                </small>
                <Link
                  href="/about/terms-of-service"
                  className="inline p-0 leading-none decoration-none dark:text-muted-foreground dark:hover:text-foreground hover:text-slate-700 border-r-[1px] border-r-muted-foreground pr-2"
                >
                  <small className="text-xs font-medium leading-none">
                    Terms <span className="hidden lg:inline">of Service</span>
                  </small>
                </Link>
                <Link
                  href="/about/privacy-policy"
                  className="inline p-0 leading-none decoration-none dark:text-muted-foreground dark:hover:text-foreground hover:text-slate-700 border-r-[1px] border-r-muted-foreground pr-2"
                >
                  <small className="text-xs font-medium leading-none">
                    Privacy <span className="hidden lg:inline">Policy</span>
                  </small>
                </Link>
                <Link
                  href="#"
                  className="inline p-0 leading-none decoration-none dark:text-muted-foreground dark:hover:text-foreground hover:text-slate-700 pr-2"
                >
                  <small className="text-xs font-medium leading-none">
                    Support
                  </small>
                </Link>
              </div>
              <div>
                <small className="hidden lg:inline text-xs font-medium leading-none text-slate-500 dark:text-muted-foreground italic">
                  Breaking the Black Box
                </small>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </VortexParticleSystemExact>
  );
}

Home.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

const VortexParticleSystemExact = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Initialize Three.js components
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    // Set initial size and handle resize
    const updateSize = () => {
      const container: any = containerRef.current;
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    updateSize();
    renderer.setClearColor(0x000000, 0); // Transparent background
    canvasRef.current.appendChild(renderer.domElement);

    camera.position.z = 7;

    // Create particles
    const particleCount = 25000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
    const indices = new Float32Array(particleCount);

    // Let particles find their natural path to the center
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Distribute particles in vortex pattern
      const t = Math.random();
      const angle = t * Math.PI * 20; // Multiple rotations for spiral effect

      // Spiral shape
      const radius = 0.6 + t * 2.2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      // Add vertical component for 3D spiral
      const z = (t - 0.5) * 5;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Vary sizes for depth effect
      sizes[i] = 0.03 + 0.04 * Math.random();
      opacities[i] = 0.4 + 0.6 * Math.random();
      indices[i] = i;
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particles.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    particles.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));
    particles.setAttribute("index", new THREE.BufferAttribute(indices, 1));

    // Custom shader material
    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0xddd6fe) }, // Dark gray
      }, // #8B75CE
      vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute float index;
        uniform float time;
        varying float vOpacity;
        
        void main() {
          vOpacity = opacity;
          
          // Get the original position
          vec3 pos = position;
          
          // Movement guided by intuition rather than rules
          float i = index;
          float speed = 0.2 + 0.2 * fract(i / 1000.0);
          float angle = time * speed + i * 0.001;
          
          // Twist the vortex based on y position
          float twistAmount = sin(time * 0.3) * 0.5;
          float twist = pos.y * twistAmount;
          
          // Apply twist and contraction/expansion
          float r = length(pos.xy);
          float breathe = 1.0 + sin(time * 0.5) * 0.1;
          r *= breathe;
          
          float theta = atan(pos.y, pos.x) + twist;
          pos.x = r * cos(theta);
          pos.y = r * sin(theta);
          
          // Add some vertical oscillation
          pos.z += sin(time * 0.2 + i * 0.01) * 0.2;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (50.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vOpacity;
        
        void main() {
          if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
          gl_FragColor = vec4(color, vOpacity);
        }
      `,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    let animationId: number | null = null;

    // Animation loop
    const animate = (time: number) => {
      time *= 0.0005; // Convert to seconds (half speed)

      // Update time uniform for vertex shader animation
      particleMaterial.uniforms.time.value = time;

      // Animate camera position for more dynamic view
      camera.position.x = Math.sin(time * 0.1) * 1.5;
      camera.position.y = Math.cos(time * 0.15) * 1.0;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      updateSize();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      scene.traverse((child: any) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material: any) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      if (canvasRef.current?.contains(renderer.domElement)) {
        canvasRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-background"
    >
      {/* Canvas container - full screen background */}
      <div ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Content overlay */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
