import { useEffect, useRef, useCallback } from 'react';
import './NeuralNetwork.css';

/**
 * Modern 3D Floating Neural Constellation / Synaptic Cluster
 *
 * Visual Concept:
 *  - Volumetric 3D constellation of interconnected neural nodes revolving in deep space.
 *  - Cinematic depth-of-field: foreground nodes are bright, large, and richly glowing;
 *    background nodes fade softly into the distance.
 *  - Dynamic 3D synaptic pathways with glowing energy sparks flowing between neurons.
 *  - Synaptic bloom: neurons flash and pulse warmly upon receiving data impulses.
 *  - Interactive: subtle, smooth holographic mouse parallax + hypnotic autonomous 3D orbit.
 *  - Floating neural dust / micro-particles adding atmospheric depth.
 */

// Constellation configuration
const NODE_COUNT = 36;
const DUST_COUNT = 32;
const FOCAL_LENGTH = 500;
const CAMERA_DIST = 520;

export default function NeuralNetwork() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const stateRef = useRef({
    width: 600,
    height: 560,
    nodes: [],
    dust: [],
    edges: [],
    signals: [],
    ripples: [],
    rotX: 0.15,
    rotY: 0,
    targetRotX: 0.15,
    targetRotY: 0,
    isHovered: false,
  });

  // Dynamically build 3D nodes, dust & edges scaled to current container dimensions
  const buildConstellation = useCallback((w, h) => {
    const nodes = [];
    // Dynamic radius scaled boldly to container dimensions
    const radius = Math.min(w * 0.42, h * 0.45);
    const maxConnectDist = radius * 0.78;

    // Golden spiral / Fibonacci sphere distribution with volumetric depth
    const phi = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 rad

    for (let i = 0; i < NODE_COUNT; i++) {
      const y = 1 - (i / (NODE_COUNT - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      // Volumetric cloud with natural radial jitter
      const rJitter = radius * (0.45 + 0.55 * Math.sqrt((i + 1) / NODE_COUNT));
      const x = Math.cos(theta) * radiusAtY * rJitter;
      const z = Math.sin(theta) * radiusAtY * rJitter;
      const py = y * rJitter * 0.88; // Slightly flattened vertically for balance

      nodes.push({
        id: i,
        x,
        y: py,
        z,
        baseRadius: 4.8 + (i % 3) * 1.6,
        activation: 0,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.002 + Math.random() * 0.0015,
      });
    }

    // Atmospheric micro-particles (neural dust)
    const dust = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phiAngle = Math.acos(2.0 * v - 1.0);
      const r = (radius * 1.32) * Math.cbrt(Math.random());

      dust.push({
        x: r * Math.sin(phiAngle) * Math.cos(theta),
        y: r * Math.sin(phiAngle) * Math.sin(theta) * 0.88,
        z: r * Math.cos(phiAngle),
        size: 1.0 + Math.random() * 1.6,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // Pre-calculate fixed 3D distance-based edges
    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxConnectDist && connections < 4) {
          edges.push({
            nodeA: nodes[i],
            nodeB: nodes[j],
            dist,
            maxDist: maxConnectDist,
            activeHeat: 0,
          });
          connections++;
        }
      }
    }

    return { nodes, dust, edges };
  }, []);

  // Handle responsive canvas resizing & DPI
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width <= 0 || height <= 0) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        stateRef.current.width = width;
        stateRef.current.height = height;

        const { nodes, dust, edges } = buildConstellation(width, height);
        stateRef.current.nodes = nodes;
        stateRef.current.dust = dust;
        stateRef.current.edges = edges;
        stateRef.current.ripples = [];

        // Pre-seed signals
        const initialSignals = [];
        for (let i = 0; i < 5; i++) {
          if (edges.length > 0) {
            const edge = edges[Math.floor(Math.random() * edges.length)];
            initialSignals.push({
              edge,
              progress: Math.random(),
              speed: 0.008 + Math.random() * 0.006,
              forward: Math.random() > 0.5,
            });
          }
        }
        stateRef.current.signals = initialSignals;
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [buildConstellation]);

  // Mouse parallax interaction on container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - (rect.height / 2 + 24);

      // Subtle parallax tilt angles
      stateRef.current.targetRotY = (x / rect.width) * 0.65;
      stateRef.current.targetRotX = -(y / rect.height) * 0.45 + 0.15;
      stateRef.current.isHovered = true;
    };

    const handleMouseLeave = () => {
      stateRef.current.isHovered = false;
      stateRef.current.targetRotX = 0.15;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Main 60fps render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let lastSpawnTime = 0;

    const render = (time) => {
      const state = stateRef.current;
      const { width, height, nodes, dust, edges, signals, ripples } = state;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Autonomous continuous 3D orbit + smooth mouse tilt
      state.rotY += 0.0030;
      state.rotX += (state.targetRotX - state.rotX) * 0.04;
      const effectiveRotY = state.rotY + state.targetRotY * 0.35;
      const effectiveRotX = state.rotX;

      const cosY = Math.cos(effectiveRotY);
      const sinY = Math.sin(effectiveRotY);
      const cosX = Math.cos(effectiveRotX);
      const sinX = Math.sin(effectiveRotX);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5 + 24;

      // ── 1. Central Ambient Warm Core Glow ──
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.44);
      coreGrad.addColorStop(0, 'rgba(251, 133, 0, 0.14)');
      coreGrad.addColorStop(0.5, 'rgba(255, 184, 32, 0.035)');
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, width, height);

      // ── 2. Project 3D Nodes to 2D Screen ──
      nodes.forEach((node) => {
        // Rotate around Y-axis
        const x1 = node.x * cosY + node.z * sinY;
        const z1 = -node.x * sinY + node.z * cosY;

        // Rotate around X-axis
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;

        // Perspective scale & depth
        const scale = FOCAL_LENGTH / (CAMERA_DIST - z2);
        node.projX = cx + x1 * scale;
        node.projY = cy + y2 * scale;
        node.projZ = z2;
        node.projScale = scale;

        // Normalized depth from 0 (farthest) to 1 (closest)
        node.depthAlpha = Math.max(0.2, Math.min(1.0, (z2 + 220) / 440));

        // Smooth activation decay
        if (node.activation > 0.01) {
          node.activation *= 0.94;
        } else {
          node.activation = 0;
        }
      });

      // ── 3. Project 3D Neural Dust (Micro-Particles) ──
      dust.forEach((p) => {
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const scale = FOCAL_LENGTH / (CAMERA_DIST - z2);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;
        const depthAlpha = Math.max(0.1, Math.min(0.85, (z2 + 240) / 480));
        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.003 + p.twinklePhase);

        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 205, 90, ${depthAlpha * twinkle * 0.65})`;
        ctx.fill();
      });

      // ── 4. Draw 3D Synaptic Connections ──
      edges.forEach((edge) => {
        if (edge.activeHeat > 0.01) {
          edge.activeHeat *= 0.94;
        } else {
          edge.activeHeat = 0;
        }

        const na = edge.nodeA;
        const nb = edge.nodeB;

        // Proximity factor based on 3D distance
        const distFactor = 1 - edge.dist / edge.maxDist;
        const avgDepthAlpha = (na.depthAlpha + nb.depthAlpha) * 0.5;
        const lineAlpha = (distFactor * 0.38 + edge.activeHeat * 0.55) * avgDepthAlpha;

        if (lineAlpha > 0.02) {
          ctx.beginPath();
          ctx.moveTo(na.projX, na.projY);
          ctx.lineTo(nb.projX, nb.projY);
          ctx.strokeStyle = `rgba(255, 184, 32, ${lineAlpha})`;
          ctx.lineWidth = (0.85 + edge.activeHeat * 1.5) * ((na.projScale + nb.projScale) * 0.5);
          ctx.stroke();
        }
      });

      // ── 5. Spawn & Advance 3D Energy Signals ──
      if (time - lastSpawnTime > 360 && signals.length < 9 && edges.length > 0) {
        lastSpawnTime = time;
        const edge = edges[Math.floor(Math.random() * edges.length)];
        signals.push({
          edge,
          progress: 0,
          speed: 0.012 + Math.random() * 0.008,
          forward: Math.random() > 0.5,
        });
      }

      for (let sIdx = signals.length - 1; sIdx >= 0; sIdx--) {
        const s = signals[sIdx];
        s.progress += s.speed;
        s.edge.activeHeat = Math.max(s.edge.activeHeat, 0.7);

        const na = s.forward ? s.edge.nodeA : s.edge.nodeB;
        const nb = s.forward ? s.edge.nodeB : s.edge.nodeA;

        // 3D position interpolation
        const curr3X = na.x + (nb.x - na.x) * s.progress;
        const curr3Y = na.y + (nb.y - na.y) * s.progress;
        const curr3Z = na.z + (nb.z - na.z) * s.progress;

        // Rotate & project to 2D
        const x1 = curr3X * cosY + curr3Z * sinY;
        const z1 = -curr3X * sinY + curr3Z * cosY;
        const y2 = curr3Y * cosX - z1 * sinX;
        const z2 = curr3Y * sinX + z1 * cosX;

        const scale = FOCAL_LENGTH / (CAMERA_DIST - z2);
        const sx = cx + x1 * scale;
        const sy = cy + y2 * scale;
        const depthAlpha = Math.max(0.3, Math.min(1.0, (z2 + 220) / 440));

        // Draw glowing energy spark
        const sparkSize = 3.0 * scale;
        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFB820';
        ctx.shadowBlur = 12 * scale;
        ctx.fill();

        // Outer warm halo
        ctx.beginPath();
        ctx.arc(sx, sy, sparkSize * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 184, 32, ${depthAlpha * 0.45})`;
        ctx.fill();
        ctx.restore();

        // Arrival at destination neuron
        if (s.progress >= 1) {
          nb.activation = 1.0;

          ripples.push({
            node: nb,
            radius: nb.baseRadius * nb.projScale,
            maxRadius: nb.baseRadius * nb.projScale * 2.8,
            alpha: 0.85,
          });

          // Cascade forward spark
          if (Math.random() < 0.55) {
            const candidateEdges = edges.filter(
              (e) => (e.nodeA === nb || e.nodeB === nb) && e !== s.edge
            );
            if (candidateEdges.length > 0) {
              const nextEdge = candidateEdges[Math.floor(Math.random() * candidateEdges.length)];
              signals.push({
                edge: nextEdge,
                progress: 0,
                speed: 0.012 + Math.random() * 0.008,
                forward: nextEdge.nodeA === nb,
              });
            }
          }

          signals.splice(sIdx, 1);
        }
      }

      // ── 6. Draw Concentric Synaptic Ripples ──
      for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
        const r = ripples[rIdx];
        r.radius += 0.7;
        r.alpha *= 0.92;

        ctx.beginPath();
        ctx.arc(r.node.projX, r.node.projY, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 184, 32, ${r.alpha * r.node.depthAlpha * 0.65})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (r.alpha < 0.02 || r.radius >= r.maxRadius) {
          ripples.splice(rIdx, 1);
        }
      }

      // ── 7. Sort and Render 3D Neurons (Back-to-Front) ──
      const sortedNodes = [...nodes].sort((a, b) => a.projZ - b.projZ);

      sortedNodes.forEach((node) => {
        const r = node.baseRadius * node.projScale;
        const act = node.activation;
        const depthAlpha = node.depthAlpha;
        const breath = Math.sin(time * node.pulseSpeed + node.pulsePhase) * (1.0 * node.projScale);

        // 7a. Radiant ambient aura
        const auraRadius = (r * 2.4 + act * 12) * node.projScale;
        const auraGrad = ctx.createRadialGradient(
          node.projX,
          node.projY,
          0,
          node.projX,
          node.projY,
          auraRadius
        );
        auraGrad.addColorStop(0, `rgba(255, 184, 32, ${(0.28 + act * 0.45) * depthAlpha})`);
        auraGrad.addColorStop(0.5, `rgba(251, 133, 0, ${(0.09 + act * 0.2) * depthAlpha})`);
        auraGrad.addColorStop(1, 'rgba(255, 184, 32, 0)');

        ctx.beginPath();
        ctx.arc(node.projX, node.projY, auraRadius, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // 7b. Outer delicate breathing ring
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, r + breath, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 184, 32, ${(0.38 + act * 0.5) * depthAlpha})`;
        ctx.lineWidth = 1.0 * node.projScale;
        ctx.stroke();

        // 7c. Dark translucent core disc
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, Math.max(1, r - 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(12, 14, 20, ${0.85 * depthAlpha})`;
        ctx.fill();

        // 7d. Luminous golden pearl center dot
        const coreR = (3.2 + act * 2.2) * node.projScale;
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, coreR, 0, Math.PI * 2);
        ctx.fillStyle = act > 0.35 ? '#FFFEE8' : '#FFB820';
        ctx.shadowColor = '#FFB820';
        ctx.shadowBlur = (8 + act * 14) * node.projScale * depthAlpha;
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <div className="neural-wrap" ref={containerRef}>
      <canvas ref={canvasRef} className="neural-canvas" />
    </div>
  );
}
