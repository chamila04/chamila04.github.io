import { useEffect, useRef, useState, useCallback } from 'react';
import './LossLandscape.css';

/**
 * 3D Mathematical Loss Landscape & Gradient Descent Optimizer Visualizer
 *
 * Visual & Mathematical Architecture:
 * - Mathematical function L(θ₁, θ₂) with multiple basins, local saddles, and a global minimum.
 * - Dynamic 3D perspective projection with depth-cueing & contour shading.
 * - Real-time optimizer simulation (Adam & Momentum SGD) with animated trajectory trails.
 * - Interactive: 3D drag-to-orbit, click-to-drop optimizer particle, switchable algorithms.
 * - HiDPI retina canvas support with 60 FPS requestAnimationFrame loop.
 */

// Surface Grid parameters
const GRID_SIZE = 26; // 26x26 grid quads = 676 quads (silky smooth 60fps)
const DOMAIN = 2.4; // x, y range: [-DOMAIN, DOMAIN]

// ── Mathematical Loss Function L(x, y) ──
function computeLoss(x, y) {
  const r2 = x * x + y * y;
  // Parabolic base basin + undulating multimodal ripples + asymmetric saddle
  const bowl = 0.22 * r2;
  const ripples = -0.52 * Math.cos(1.75 * x) * Math.cos(1.75 * y);
  const saddle = 0.32 * Math.sin(1.1 * x + 0.7 * y) * Math.exp(-r2 * 0.16);
  const tilt = 0.12 * x - 0.08 * y;
  return bowl + ripples + saddle + tilt + 1.1; // Ensure strictly positive
}

// Compute analytical finite-difference gradient ∇L = (∂L/∂x, ∂L/∂y)
function computeGradient(x, y) {
  const eps = 0.002;
  const gx = (computeLoss(x + eps, y) - computeLoss(x - eps, y)) / (2 * eps);
  const gy = (computeLoss(x, y + eps) - computeLoss(x, y - eps)) / (2 * eps);
  return { gx, gy };
}

// Color interpolation for elevation
function getElevationColor(normalizedZ, depthFade = 1) {
  // normalizedZ: 0 (deep minimum) to 1 (high peaks)
  let r, g, b;
  if (normalizedZ < 0.28) {
    // Basin & Global Minimum: Electric Cyan into Warm Gold
    const t = normalizedZ / 0.28;
    r = Math.round(56 + t * (240 - 56));
    g = Math.round(189 + t * (165 - 189));
    b = Math.round(248 + t * (32 - 248));
  } else if (normalizedZ < 0.65) {
    // Slopes: Rich Amber / Warm Orange
    const t = (normalizedZ - 0.28) / (0.65 - 0.28);
    r = Math.round(240 + t * (255 - 240));
    g = Math.round(165 + t * (138 - 165));
    b = Math.round(32 - t * 32);
  } else {
    // High Peaks: Luminous Amber-White
    const t = (normalizedZ - 0.65) / 0.35;
    r = Math.round(255);
    g = Math.round(138 + t * 90);
    b = Math.round(0 + t * 160);
  }
  const alpha = Math.max(0.12, Math.min(0.95, (0.45 + normalizedZ * 0.5) * depthFade));
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

export default function LossLandscape() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const [optimizerType, setOptimizerType] = useState('adam'); // 'adam' | 'momentum'
  const [lossVal, setLossVal] = useState('0.0000');
  const [stepVal, setStepVal] = useState(0);
  const [isDraggingState, setIsDraggingState] = useState(false);

  // Simulation state in mutable ref for zero React re-render lag during 60 FPS canvas loop
  const simRef = useRef({
    // 3D Camera / Orbit
    rotX: 0.72, // Pitch (tilt down ~41 deg)
    rotY: -0.45, // Yaw (turn slightly)
    targetRotX: 0.72,
    targetRotY: -0.45,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    startRotX: 0.72,
    startRotY: -0.45,
    hasInteracted: false,

    // Optimizer particle
    px: 1.85,
    py: -1.75,
    step: 0,
    maxSteps: 120,
    trail: [], // array of { x, y, z, sx, sy }
    optimizer: 'adam', // 'adam' | 'momentum'

    // Adam state
    mX: 0,
    mY: 0,
    vX: 0,
    vY: 0,
    beta1: 0.88,
    beta2: 0.992,
    lr: 0.075,

    // Momentum SGD state
    velX: 0,
    velY: 0,
    momentumCoeff: 0.82,
    sgdLr: 0.045,

    // Convergence & Ripple effect
    converged: false,
    convergeTimer: 0,
    ripples: [], // array of { x, y, z, radius, alpha }

    // Precomputed Grid Vertices
    gridVertices: [],
    minZ: 999,
    maxZ: -999,
  });

  // Precompute grid vertices on mount
  useEffect(() => {
    const vertices = [];
    let minZ = 999;
    let maxZ = -999;
    const step = (DOMAIN * 2) / GRID_SIZE;

    for (let i = 0; i <= GRID_SIZE; i++) {
      const row = [];
      const x = -DOMAIN + i * step;
      for (let j = 0; j <= GRID_SIZE; j++) {
        const y = -DOMAIN + j * step;
        const z = computeLoss(x, y);
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
        row.push({ x, y, z });
      }
      vertices.push(row);
    }

    simRef.current.gridVertices = vertices;
    simRef.current.minZ = minZ;
    simRef.current.maxZ = maxZ;
  }, []);

  // Drop optimizer at specified coordinates or random high point
  const dropParticle = useCallback((customX = null, customY = null) => {
    const sim = simRef.current;
    let startX = customX;
    let startY = customY;

    if (startX === null || startY === null) {
      // Pick a random starting point on high ridge
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.4 + Math.random() * 0.8;
      startX = Math.cos(angle) * radius;
      startY = Math.sin(angle) * radius;
    }

    // Clamp inside domain
    sim.px = Math.max(-DOMAIN + 0.15, Math.min(DOMAIN - 0.15, startX));
    sim.py = Math.max(-DOMAIN + 0.15, Math.min(DOMAIN - 0.15, startY));
    sim.step = 0;
    sim.trail = [];
    sim.mX = 0;
    sim.mY = 0;
    sim.vX = 0;
    sim.vY = 0;
    sim.velX = 0;
    sim.velY = 0;
    sim.converged = false;
    sim.convergeTimer = 0;
  }, []);

  // Toggle Optimizer
  const toggleOptimizer = () => {
    const next = optimizerType === 'adam' ? 'momentum' : 'adam';
    setOptimizerType(next);
    simRef.current.optimizer = next;
    dropParticle();
  };

  // Main Canvas Rendering & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    let width = container.clientWidth;
    let height = container.clientHeight;
    let dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    let lastUIUpdate = 0;

    // ── 3D Projection Helper ──
    const project3D = (x, y, z, rotX, rotY, w, h) => {
      const scaleCoord = 56;
      const heightCoord = 38;

      // Centered world coordinates
      const wx = x * scaleCoord;
      const wy = y * scaleCoord;
      const wz = (z - 1.4) * heightCoord;

      // 1. Yaw rotation (around Z axis)
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = wx * cosY - wy * sinY;
      const y1 = wx * sinY + wy * cosY;
      const z1 = wz;

      // 2. Pitch rotation (around X axis)
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;
      const x2 = x1;

      // 3. Perspective Camera
      const cameraDist = 380;
      const focalLength = 460;
      const depth = cameraDist + z2;
      const pScale = focalLength / Math.max(80, depth);

      const sx = w * 0.5 + x2 * pScale;
      const sy = h * 0.52 + y2 * pScale;

      return { sx, sy, depth: z2, pScale };
    };

    // ── Main Render Frame ──
    const render = (time) => {
      const sim = simRef.current;

      // 1. Smooth Orbit Damping
      if (!sim.isDragging) {
        // Slow autonomous rotation when idle
        sim.targetRotY += 0.0022;
      }
      sim.rotX += (sim.targetRotX - sim.rotX) * 0.08;
      sim.rotY += (sim.targetRotY - sim.rotY) * 0.08;

      // Clear Canvas with clean alpha
      ctx.clearRect(0, 0, width, height);

      // 2. Step Optimizer Simulation
      if (!sim.converged && sim.step < sim.maxSteps) {
        const { gx, gy } = computeGradient(sim.px, sim.py);
        const gradNorm = Math.hypot(gx, gy);

        if (sim.optimizer === 'adam') {
          // Adam Update Rule
          const t = sim.step + 1;
          sim.mX = sim.beta1 * sim.mX + (1 - sim.beta1) * gx;
          sim.mY = sim.beta1 * sim.mY + (1 - sim.beta1) * gy;
          sim.vX = sim.beta2 * sim.vX + (1 - sim.beta2) * (gx * gx);
          sim.vY = sim.beta2 * sim.vY + (1 - sim.beta2) * (gy * gy);

          const mHatX = sim.mX / (1 - Math.pow(sim.beta1, t));
          const mHatY = sim.mY / (1 - Math.pow(sim.beta1, t));
          const vHatX = sim.vX / (1 - Math.pow(sim.beta2, t));
          const vHatY = sim.vY / (1 - Math.pow(sim.beta2, t));

          const eps = 1e-7;
          sim.px -= (sim.lr / (Math.sqrt(vHatX) + eps)) * mHatX;
          sim.py -= (sim.lr / (Math.sqrt(vHatY) + eps)) * mHatY;
        } else {
          // Momentum SGD Update Rule
          sim.velX = sim.momentumCoeff * sim.velX + sim.sgdLr * gx;
          sim.velY = sim.momentumCoeff * sim.velY + sim.sgdLr * gy;
          sim.px -= sim.velX;
          sim.py -= sim.velY;
        }

        // Clamp inside domain
        sim.px = Math.max(-DOMAIN + 0.1, Math.min(DOMAIN - 0.1, sim.px));
        sim.py = Math.max(-DOMAIN + 0.1, Math.min(DOMAIN - 0.1, sim.py));

        const curZ = computeLoss(sim.px, sim.py);
        const proj = project3D(sim.px, sim.py, curZ, sim.rotX, sim.rotY, width, height);

        sim.trail.push({
          x: sim.px,
          y: sim.py,
          z: curZ,
          sx: proj.sx,
          sy: proj.sy,
        });

        // Limit trail history length
        if (sim.trail.length > 40) sim.trail.shift();

        sim.step += 1;

        // Check Convergence
        if (gradNorm < 0.05 || sim.step >= sim.maxSteps) {
          sim.converged = true;
          sim.ripples.push({
            x: sim.px,
            y: sim.py,
            z: curZ,
            radius: 4,
            alpha: 1,
          });
        }
      } else if (sim.converged) {
        sim.convergeTimer += 1;
        // Auto respawn after 2 seconds
        if (sim.convergeTimer > 110) {
          dropParticle();
        }
      }

      // Update React UI metrics periodically (every ~100ms)
      if (time - lastUIUpdate > 90) {
        lastUIUpdate = time;
        const currentLoss = computeLoss(sim.px, sim.py);
        setLossVal(currentLoss.toFixed(4));
        setStepVal(sim.step);
      }

      // 3. Project All Grid Vertices
      const { gridVertices, minZ, maxZ, rotX, rotY } = sim;
      if (!gridVertices || gridVertices.length === 0) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      const zRange = Math.max(0.001, maxZ - minZ);
      const projectedGrid = [];

      for (let i = 0; i <= GRID_SIZE; i++) {
        const row = [];
        for (let j = 0; j <= GRID_SIZE; j++) {
          const v = gridVertices[i][j];
          const p = project3D(v.x, v.y, v.z, rotX, rotY, width, height);
          const normZ = (v.z - minZ) / zRange;
          row.push({
            ...p,
            worldZ: v.z,
            normZ,
          });
        }
        projectedGrid.push(row);
      }

      // 4. Build and Depth-Sort Quads for Painter's Algorithm
      const quads = [];
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const p00 = projectedGrid[i][j];
          const p10 = projectedGrid[i + 1][j];
          const p11 = projectedGrid[i + 1][j + 1];
          const p01 = projectedGrid[i][j + 1];

          // Average depth for sorting (render furthest quads first)
          const avgDepth = (p00.depth + p10.depth + p11.depth + p01.depth) * 0.25;
          const avgNormZ = (p00.normZ + p10.normZ + p11.normZ + p01.normZ) * 0.25;

          quads.push({
            p00,
            p10,
            p11,
            p01,
            avgDepth,
            avgNormZ,
            i,
            j,
          });
        }
      }

      quads.sort((a, b) => b.avgDepth - a.avgDepth);

      // 5. Draw Surface Quads & Topographic Grid Lines
      for (let q = 0; q < quads.length; q++) {
        const quad = quads[q];
        const { p00, p10, p11, p01, avgDepth, avgNormZ } = quad;

        // Depth fog factor
        const depthFade = Math.max(0.2, Math.min(1, 1 - (avgDepth + 140) / 480));

        // Quad Solid Base Fill (translucent dark obsidian with subtle elevation tint)
        ctx.beginPath();
        ctx.moveTo(p00.sx, p00.sy);
        ctx.lineTo(p10.sx, p10.sy);
        ctx.lineTo(p11.sx, p11.sy);
        ctx.lineTo(p01.sx, p01.sy);
        ctx.closePath();

        // Subtle shaded face
        const faceAlpha = Math.max(0.18, 0.45 * depthFade);
        ctx.fillStyle = `rgba(10, 14, 22, ${faceAlpha.toFixed(3)})`;
        ctx.fill();

        // Grid Wireframe Edges
        const lineColor = getElevationColor(avgNormZ, depthFade);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Highlight contour lines (subtle isolines at specific elevation bands)
        if (Math.floor(avgNormZ * 12) % 3 === 0) {
          ctx.strokeStyle = `rgba(255, 184, 32, ${(0.35 * depthFade).toFixed(2)})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      }

      // 6. Draw Global Minimum Indicator Ring
      // Global minimum is near (-0.35, -0.35)
      const minPos = project3D(-0.35, -0.35, computeLoss(-0.35, -0.35), rotX, rotY, width, height);
      const minPulse = (Math.sin(time * 0.004) + 1) * 0.5;

      ctx.save();
      ctx.beginPath();
      ctx.arc(minPos.sx, minPos.sy, 7 + minPulse * 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${(0.6 + minPulse * 0.4).toFixed(2)})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(minPos.sx, minPos.sy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      // 7. Draw Optimizer Trajectory Trail
      if (sim.trail.length > 1) {
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < sim.trail.length; i++) {
          const pt = sim.trail[i];
          const proj = project3D(pt.x, pt.y, pt.z, rotX, rotY, width, height);
          if (i === 0) {
            ctx.moveTo(proj.sx, proj.sy);
          } else {
            ctx.lineTo(proj.sx, proj.sy);
          }
        }
        ctx.strokeStyle = 'rgba(255, 184, 32, 0.7)';
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#ffb820';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      // 8. Draw Active Optimizer Particle
      const curLoss = computeLoss(sim.px, sim.py);
      const pHead = project3D(sim.px, sim.py, curLoss, rotX, rotY, width, height);

      ctx.save();
      // Outer Glow Halo
      const gradient = ctx.createRadialGradient(
        pHead.sx,
        pHead.sy,
        0,
        pHead.sx,
        pHead.sy,
        18 * pHead.pScale
      );
      gradient.addColorStop(0, 'rgba(255, 220, 100, 0.95)');
      gradient.addColorStop(0.35, 'rgba(251, 133, 0, 0.65)');
      gradient.addColorStop(1, 'rgba(251, 133, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pHead.sx, pHead.sy, 18 * pHead.pScale, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Core Bead
      ctx.beginPath();
      ctx.arc(pHead.sx, pHead.sy, 4.5 * pHead.pScale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffb820';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.restore();

      // 9. Draw Expanding Convergence Shockwave Ripples
      for (let r = sim.ripples.length - 1; r >= 0; r--) {
        const rip = sim.ripples[r];
        const rPos = project3D(rip.x, rip.y, rip.z, rotX, rotY, width, height);

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
          rPos.sx,
          rPos.sy,
          rip.radius * rPos.pScale,
          rip.radius * 0.5 * rPos.pScale,
          rotY,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = `rgba(56, 189, 248, ${rip.alpha.toFixed(2)})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        rip.radius += 1.8;
        rip.alpha -= 0.024;
        if (rip.alpha <= 0) {
          sim.ripples.splice(r, 1);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
    };
  }, [dropParticle]);

  // ── Mouse & Touch Event Handlers for 3D Orbit & Clicking Surface ──
  const handlePointerDown = (e) => {
    // Only drag on canvas / container, not when clicking buttons
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

    const sim = simRef.current;
    sim.isDragging = true;
    setIsDraggingState(true);
    sim.dragStartX = e.clientX;
    sim.dragStartY = e.clientY;
    sim.startRotX = sim.rotX;
    sim.startRotY = sim.rotY;
    sim.hasInteracted = true;
  };

  const handlePointerMove = (e) => {
    const sim = simRef.current;
    if (!sim.isDragging) return;

    const dx = e.clientX - sim.dragStartX;
    const dy = e.clientY - sim.dragStartY;

    // Invert X/Y for intuitive turntable rotation
    sim.targetRotY = sim.startRotY + dx * 0.008;
    sim.targetRotX = Math.max(0.2, Math.min(1.35, sim.startRotX + dy * 0.008));
  };

  const handlePointerUp = (e) => {
    const sim = simRef.current;
    const dx = Math.abs(e.clientX - sim.dragStartX);
    const dy = Math.abs(e.clientY - sim.dragStartY);

    sim.isDragging = false;
    setIsDraggingState(false);

    // If it was a clean click without significant drag (under 5px), treat as surface click!
    if (dx < 6 && dy < 6) {
      handleSurfaceClick(e);
    }
  };

  // Find closest 3D world coordinate to user's 2D click and drop optimizer there
  const handleSurfaceClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const sim = simRef.current;
    const { gridVertices, rotX, rotY } = sim;
    const w = rect.width;
    const h = rect.height;

    let closestVertex = null;
    let minDist = 99999;

    // Helper for projected screen coordinate
    for (let i = 0; i <= GRID_SIZE; i += 2) {
      for (let j = 0; j <= GRID_SIZE; j += 2) {
        const v = gridVertices[i][j];
        // Standard projection
        const scaleCoord = 56;
        const heightCoord = 38;
        const wx = v.x * scaleCoord;
        const wy = v.y * scaleCoord;
        const wz = (v.z - 1.4) * heightCoord;

        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = wx * cosY - wy * sinY;
        const y1 = wx * sinY + wy * cosY;
        const z1 = wz;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const x2 = x1;

        const cameraDist = 380;
        const focalLength = 460;
        const pScale = focalLength / Math.max(80, cameraDist + z2);

        const sx = w * 0.5 + x2 * pScale;
        const sy = h * 0.52 + y2 * pScale;

        const dist = Math.hypot(clickX - sx, clickY - sy);
        if (dist < minDist) {
          minDist = dist;
          closestVertex = v;
        }
      }
    }

    if (closestVertex && minDist < 120) {
      dropParticle(closestVertex.x, closestVertex.y);
    }
  };

  return (
    <div
      className={`loss-landscape ${isDraggingState ? 'loss-landscape--dragging' : ''}`}
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      role="region"
      aria-label="3D Mathematical Loss Landscape Optimization"
    >
      {/* Soft Ambient Radial Background */}
      <div className="loss-landscape__ambient" aria-hidden="true" />

      {/* Top Glass Header & HUD Telemetry */}
      <div className="loss-landscape__header">
        <div className="loss-landscape__title-wrap">
          <span className="loss-landscape__status-dot" aria-hidden="true" />
          <span className="loss-landscape__title">Loss Landscape</span>
          <span className="loss-landscape__formula">L(θ₁, θ₂)</span>
        </div>

        <div className="loss-landscape__telemetry">
          <div className="loss-landscape__metric">
            <span className="loss-landscape__metric-label">Step:</span>
            <span className="loss-landscape__metric-val">{stepVal}</span>
          </div>
          <div className="loss-landscape__metric">
            <span className="loss-landscape__metric-label">Loss:</span>
            <span className="loss-landscape__metric-val loss-landscape__metric-val--cyan">
              {lossVal}
            </span>
          </div>
        </div>
      </div>

      {/* 3D WebGL / 2D Canvas */}
      <canvas className="loss-landscape__canvas" ref={canvasRef} />

      {/* Bottom Interactive Controls */}
      <div className="loss-landscape__footer">
        <div className="loss-landscape__hint">
          <span>Drag to rotate 3D</span>
          <span>·</span>
          <span>Click surface to drop</span>
        </div>

        <div className="loss-landscape__controls">
          <button
            type="button"
            className="loss-landscape__btn loss-landscape__btn--secondary"
            onClick={toggleOptimizer}
            title="Switch optimizer algorithm"
          >
            <span className="loss-landscape__btn-icon">⚡</span>
            <span>{optimizerType === 'adam' ? 'Opt: Adam' : 'Opt: Momentum'}</span>
          </button>

          <button
            type="button"
            className="loss-landscape__btn"
            onClick={() => dropParticle()}
            title="Drop new optimizer particle from random ridge"
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
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Drop</span>
          </button>
        </div>
      </div>
    </div>
  );
}
