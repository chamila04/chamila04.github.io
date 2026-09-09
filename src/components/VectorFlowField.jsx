import { useEffect, useRef, useState, useCallback } from 'react';
import './VectorFlowField.css';

/**
 * Generative Fluid & Vector Flow Field Simulation
 *
 * Mathematical Foundations:
 * - Divergence-free Curl Noise: v = (∂ψ/∂y, -∂ψ/∂x), guaranteeing ∇ · v = 0 (incompressible fluid).
 * - Multi-octave fractional Brownian motion (fBm) for realistic turbulence eddies.
 * - Dynamic tangential vortex interaction when the mouse hovers or clicks.
 * - Semi-transparent temporal trail decay creating illuminated neon streamlines.
 * - High-efficiency 60 FPS Canvas render loop with 1,500 active fluid micro-particles.
 */

// ── Fast 2D / 3D Perlin Noise Implementation ──
const PERM = new Uint8Array(512);
const GRAD2 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [0.707, 0.707], [-0.707, 0.707], [0.707, -0.707], [-0.707, -0.707],
];

// Initialize deterministic pseudo-random permutation table
(function initNoise() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let seed = 42;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    const temp = p[i];
    p[i] = p[j];
    p[j] = temp;
  }
  for (let i = 0; i < 512; i++) {
    PERM[i] = p[i & 255];
  }
})();

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
  return a + t * (b - a);
}

function grad2D(hash, x, y) {
  const g = GRAD2[hash % GRAD2.length];
  return g[0] * x + g[1] * y;
}

function perlin2D(x, y) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = fade(xf);
  const v = fade(yf);

  const aa = PERM[PERM[X] + Y];
  const ab = PERM[PERM[X] + Y + 1];
  const ba = PERM[PERM[X + 1] + Y];
  const bb = PERM[PERM[X + 1] + Y + 1];

  const x1 = lerp(grad2D(aa, xf, yf), grad2D(ba, xf - 1, yf), u);
  const x2 = lerp(grad2D(ab, xf, yf - 1), grad2D(bb, xf - 1, yf - 1), u);

  return lerp(x1, x2, v);
}

// Multi-octave potential field ψ(x, y, t)
function samplePotential(x, y, t, mode) {
  let scale1 = 0.0032;
  let scale2 = 0.0075;
  let speed = 0.18;

  if (mode === 'stream') {
    // Oriented laminar flow with wave perturbations
    return perlin2D(x * 0.002, y * 0.004 + t * 0.25) * 1.5 + (y * 0.008);
  } else if (mode === 'turb') {
    // High-frequency turbulent vortices
    scale1 = 0.0055;
    scale2 = 0.012;
    speed = 0.32;
  }

  const n1 = perlin2D(x * scale1, y * scale1 + t * speed);
  const n2 = perlin2D(x * scale2 + 50, y * scale2 + t * speed * 1.2) * 0.5;
  return n1 + n2;
}

// Divergence-free Curl Velocity: v = (∂ψ/∂y, -∂ψ/∂x)
function sampleCurl(x, y, t, mode) {
  const eps = 2.0;
  const psiY1 = samplePotential(x, y + eps, t, mode);
  const psiY0 = samplePotential(x, y - eps, t, mode);
  const psiX1 = samplePotential(x + eps, y, t, mode);
  const psiX0 = samplePotential(x - eps, y, t, mode);

  const vx = (psiY1 - psiY0) / (2 * eps);
  const vy = -(psiX1 - psiX0) / (2 * eps);

  return { vx: vx * 380, vy: vy * 380 };
}

const PARTICLE_COUNT = 1500;

export default function VectorFlowField() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const [mode, setMode] = useState('vortex'); // 'vortex' | 'stream' | 'turb'
  const [avgVelocity, setAvgVelocity] = useState('4.2');

  const simRef = useRef({
    particles: [],
    mode: 'vortex',
    time: 0,
    mouseX: -9999,
    mouseY: -9999,
    mousePrevX: -9999,
    mousePrevY: -9999,
    mouseActive: false,
    ripples: [], // shockwave ripples
    width: 680,
    height: 540,
  });

  // Cycle flow modes
  const cycleMode = () => {
    const modes = ['vortex', 'stream', 'turb'];
    const next = modes[(modes.indexOf(mode) + 1) % modes.length];
    setMode(next);
    simRef.current.mode = next;
  };

  // Trigger pulse ripple
  const triggerPulse = useCallback((cx = null, cy = null) => {
    const sim = simRef.current;
    const px = cx !== null ? cx : sim.width * 0.5;
    const py = cy !== null ? cy : sim.height * 0.5;

    sim.ripples.push({
      x: px,
      y: py,
      radius: 5,
      maxRadius: 140,
      alpha: 1,
      strength: 22,
    });
  }, []);

  // Main Simulation & Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    let width = container.clientWidth;
    let height = container.clientHeight;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = window.devicePixelRatio || 1;
      simRef.current.width = width;
      simRef.current.height = height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Fill initial background
      ctx.fillStyle = '#07090d';
      ctx.fillRect(0, 0, width, height);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Initialize particles
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const isCyan = Math.random() < 0.08; // 8% accent cyan particles
      const isBright = Math.random() < 0.22;

      particles.push({
        x: px,
        y: py,
        prevX: px,
        prevY: py,
        vx: 0,
        vy: 0,
        speedFactor: 0.75 + Math.random() * 0.6,
        life: Math.floor(Math.random() * 200),
        maxLife: 150 + Math.floor(Math.random() * 180),
        size: 0.9 + Math.random() * 1.3,
        isCyan,
        isBright,
      });
    }
    simRef.current.particles = particles;

    let lastTime = performance.now();
    let lastUptime = 0;

    // ── Animation Frame ──
    const animate = (currentTime) => {
      const dt = Math.min(0.04, (currentTime - lastTime) * 0.001);
      lastTime = currentTime;

      const sim = simRef.current;
      sim.time += dt * 0.75;

      // 1. Semi-transparent Persistence Pass (Creates Luminous Fluid Trails)
      ctx.fillStyle = 'rgba(7, 9, 13, 0.11)';
      ctx.fillRect(0, 0, width, height);

      // Compute mouse movement velocity
      let mouseVx = 0;
      let mouseVy = 0;
      if (sim.mouseActive && sim.mousePrevX > -1000) {
        mouseVx = (sim.mouseX - sim.mousePrevX) * 0.5;
        mouseVy = (sim.mouseY - sim.mousePrevY) * 0.5;
      }
      sim.mousePrevX = sim.mouseX;
      sim.mousePrevY = sim.mouseY;

      let totalSpeed = 0;

      // 2. Update & Render Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.prevX = p.x;
        p.prevY = p.y;

        // Base Curl Noise Velocity Field
        const { vx: fieldVx, vy: fieldVy } = sampleCurl(p.x, p.y, sim.time, sim.mode);

        let fx = fieldVx * p.speedFactor;
        let fy = fieldVy * p.speedFactor;

        // Dynamic Mouse Fluid Interaction
        if (sim.mouseActive) {
          const dx = p.x - sim.mouseX;
          const dy = p.y - sim.mouseY;
          const dist = Math.hypot(dx, dy);
          const maxDist = 140;

          if (dist < maxDist && dist > 1) {
            const factor = 1 - dist / maxDist;
            // Swirl tangential force
            const swirl = 16 * factor;
            fx += (-dy / dist) * swirl + mouseVx * factor * 1.8;
            fy += (dx / dist) * swirl + mouseVy * factor * 1.8;

            // Soft repulsion from cursor core
            if (dist < 50) {
              const repel = (50 - dist) * 0.45;
              fx += (dx / dist) * repel;
              fy += (dy / dist) * repel;
            }
          }
        }

        // Active Ripple / Shockwave Forces
        for (let r = 0; r < sim.ripples.length; r++) {
          const rip = sim.ripples[r];
          const rx = p.x - rip.x;
          const ry = p.y - rip.y;
          const rDist = Math.hypot(rx, ry);
          const diff = Math.abs(rDist - rip.radius);
          if (diff < 35 && rDist > 1) {
            const push = ((35 - diff) / 35) * rip.strength * rip.alpha;
            fx += (rx / rDist) * push;
            fy += (ry / rDist) * push;
          }
        }

        // Fluid Momentum Integration (smooth acceleration & damping)
        p.vx += (fx - p.vx) * 0.12;
        p.vy += (fy - p.vy) * 0.12;

        p.x += p.vx * dt * 45;
        p.y += p.vy * dt * 45;

        p.life += 1;

        // Speed metric
        const spd = Math.hypot(p.vx, p.vy);
        totalSpeed += spd;

        // Particle Respawn upon boundary exit or age
        if (
          p.x < -10 ||
          p.x > width + 10 ||
          p.y < -10 ||
          p.y > height + 10 ||
          p.life > p.maxLife
        ) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.prevX = p.x;
          p.prevY = p.y;
          p.vx = 0;
          p.vy = 0;
          p.life = 0;
          p.maxLife = 140 + Math.floor(Math.random() * 160);
          continue;
        }

        // 3. Render Streamline Segment
        const lifeRatio = Math.sin((p.life / p.maxLife) * Math.PI);
        const alpha = Math.min(0.95, (0.25 + lifeRatio * 0.7) * (spd / 4));

        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);

        if (p.isCyan) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(2)})`;
          ctx.lineWidth = p.size * 1.1;
        } else if (p.isBright) {
          ctx.strokeStyle = `rgba(255, 245, 200, ${alpha.toFixed(2)})`;
          ctx.lineWidth = p.size * 1.25;
        } else {
          // Warm Amber Gradient depending on speed
          const g = Math.min(200, Math.floor(145 + spd * 14));
          ctx.strokeStyle = `rgba(255, ${g}, 0, ${alpha.toFixed(2)})`;
          ctx.lineWidth = p.size;
        }

        ctx.stroke();
      }

      // 4. Update & Draw Expanding Ripples
      for (let r = sim.ripples.length - 1; r >= 0; r--) {
        const rip = sim.ripples[r];
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 184, 32, ${(rip.alpha * 0.75).toFixed(2)})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        rip.radius += 3.2;
        rip.alpha -= 0.024;
        if (rip.alpha <= 0 || rip.radius > rip.maxRadius) {
          sim.ripples.splice(r, 1);
        }
      }

      // 5. Draw Subtle Cursor Aura
      if (sim.mouseActive && sim.mouseX > 0 && sim.mouseY > 0) {
        const aura = ctx.createRadialGradient(
          sim.mouseX,
          sim.mouseY,
          0,
          sim.mouseX,
          sim.mouseY,
          45
        );
        aura.addColorStop(0, 'rgba(255, 184, 32, 0.16)');
        aura.addColorStop(0.5, 'rgba(251, 133, 0, 0.05)');
        aura.addColorStop(1, 'rgba(251, 133, 0, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(sim.mouseX, sim.mouseY, 45, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sim.mouseX, sim.mouseY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffb820';
        ctx.fill();
      }

      // 6. Periodic UI Telemetry Update (~120ms)
      if (currentTime - lastUptime > 120) {
        lastUptime = currentTime;
        const avg = (totalSpeed / particles.length).toFixed(1);
        setAvgVelocity(avg);
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  // ── Mouse & Touch Handlers ──
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sim = simRef.current;
    sim.mouseX = e.clientX - rect.left;
    sim.mouseY = e.clientY - rect.top;
    sim.mouseActive = true;
  };

  const handlePointerLeave = () => {
    const sim = simRef.current;
    sim.mouseActive = false;
    sim.mouseX = -9999;
    sim.mouseY = -9999;
  };

  const handleClick = (e) => {
    // Avoid triggering pulse on button clicks
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    triggerPulse(cx, cy);
  };

  const getModeLabel = () => {
    if (mode === 'vortex') return 'Cosmic Vortices';
    if (mode === 'stream') return 'Laminar Streamlines';
    return 'Quantum Turbulence';
  };

  return (
    <div
      className="flow-field"
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      role="region"
      aria-label="Generative Fluid and Vector Flow Field Simulation"
    >
      {/* Ambient background glow */}
      <div className="flow-field__ambient" aria-hidden="true" />

      {/* Top Glass Header & HUD Telemetry */}
      <div className="flow-field__header">
        <div className="flow-field__title-wrap">
          <span className="flow-field__status-dot" aria-hidden="true" />
          <span className="flow-field__title">Vector Flow Field</span>
          <span className="flow-field__formula">∇ · v = 0</span>
        </div>

        <div className="flow-field__telemetry">
          <div className="flow-field__metric">
            <span className="flow-field__metric-label">Particles:</span>
            <span className="flow-field__metric-val">{PARTICLE_COUNT}</span>
          </div>
          <div className="flow-field__metric">
            <span className="flow-field__metric-label">Speed:</span>
            <span className="flow-field__metric-val flow-field__metric-val--cyan">
              {avgVelocity}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive 60FPS Fluid Canvas */}
      <canvas className="flow-field__canvas" ref={canvasRef} />

      {/* Bottom Interactive Controls */}
      <div className="flow-field__footer">
        <div className="flow-field__hint">
          <span>Move cursor to steer flow</span>
          <span>·</span>
          <span>Click to pulse</span>
        </div>

        <div className="flow-field__controls">
          <button
            type="button"
            className="flow-field__btn flow-field__btn--secondary"
            onClick={cycleMode}
            title="Cycle flow pattern mode"
          >
            <span className="flow-field__btn-icon">⚡</span>
            <span>{getModeLabel()}</span>
          </button>

          <button
            type="button"
            className="flow-field__btn"
            onClick={() => triggerPulse()}
            title="Trigger fluid shockwave pulse"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Pulse</span>
          </button>
        </div>
      </div>
    </div>
  );
}
