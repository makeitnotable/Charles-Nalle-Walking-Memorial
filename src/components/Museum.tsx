import { useEffect, useRef, useState } from "react";
import type { Mesh, MeshBasicMaterial, PerspectiveCamera, WebGLRenderer } from "three";

/**
 * THE MUSEUM — the site's one concentrated boldness (v6 locked decision #2),
 * refined in v7 (Wil, 2026-08-15 review + docs/PLAN.md A10):
 *
 *  · The hall is shorter and closer (SPACING 5, works ~30% nearer), the rail
 *    walks slightly pitched down so the floor moves (the strongest forward
 *    cue), passes the last work, and the end wall + threshold are visible
 *    from the start (camera.far 80, fog 8→32). An entry wall behind you
 *    closes the room for the 360° look.
 *  · Look is free: unbounded yaw with light inertia, pitch clamped; a
 *    `Face forward` control appears once you've turned; a double-tap on the
 *    wall/floor recentres; keyboard: ←/→ look, ↑/↓ (W/S) walk, Enter
 *    approach the nearest work, Esc back, +/− zoom in approach. No mouse-move
 *    look — that was accidental.
 *  · Approach = a pure composition recomputed every frame through the lerp:
 *    the painting CENTRED in the frame; desktop card at the left edge with no
 *    border and one button (`Back to the hall`); the study hangs screen-right
 *    of its painting on both walls; phones get a peek-sheet that drags up to
 *    the full card while the painting recomposes above it.
 *  · "Bring it to life" is an Easter egg: tap the painting (or zoom in past a
 *    threshold) and Mark Priest's animated variant plays; an invisible
 *    focusable button over the projected painting keeps the capability for
 *    keyboard and screen readers.
 *  · Every canvas hangs at its TRUE aspect (build-time, sharp) — the portrait
 *    Barbershop Narrative II tall and narrow, the 16:9s wide.
 *  · Finish: MeshBasicMaterial + richer baked CanvasTextures — plank floor
 *    with a sheen band per bay, plaster walls, coffered ceiling, baseboard +
 *    cornice, moulded frames with a gilt lip whose top faces read lit.
 *
 * Craft bars kept from v6: no loading gate; DPR ≤ 1.5; the loop pauses when
 * off-screen or hidden and under the curtain; full dispose; `three` arrives
 * after load; no WebGL / reduced motion / thin pipe → the island renders
 * nothing and the 2-D grid below is the page. Keyboard path is real DOM.
 * Debug: `window.__museum` drives scripts/museum-check.mjs.
 */

export interface Work {
  slug: string;
  key: string;
  title: string;
  order: number;
  tex1440: string;
  tex800: string;
  video: string | null;
  sketch: string | null;
  /** True aspect (w/h) of the canvas — build-time from the 1440 asset. */
  aspect: number;
  /** True aspect of the study beside the main canvas. */
  sketchAspect?: number | null;
  line: string | null;
  lineBy: string | null;
}

interface Props {
  works: Work[];
  slotId?: string;
}

// ——— The hall, in metres ———
const SPACING = 5; // corridor per canvas (was 7)
const OVERRUN = 1.5; // the rail passes the last work
const END_GAP = 6; // last work → end wall
const CORRIDOR_HALF = 3.4;
const EYE = 1.55;
const RAIL_PITCH = -0.1; // rad, down — the floor moves
const RAIL_PITCH_PORTRAIT = -0.08;
const ENTRY_Z = 7; // the wall behind you

export default function Museum({ works, slotId }: Props) {
  const [capable, setCapable] = useState<boolean | null>(null);
  const [approached, setApproached] = useState<number | null>(null);
  const [alive, setAlive] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [railIdx, setRailIdx] = useState(0);
  const [lookedAway, setLookedAway] = useState(false);
  /** Phone sheet: "peek" (title only) or "full". */
  const [sheet, setSheet] = useState<"peek" | "full">("peek");
  const [paintRect, setPaintRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [portraitUI, setPortraitUI] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const api = useRef<{
    approach: (i: number | null) => void;
    turnOn: (i: number) => void;
    turnOff: () => void;
    recenter: () => void;
    setZoom: (z: number) => void;
    dispose: () => void;
  } | null>(null);
  const sheetRefState = useRef<"peek" | "full">("peek");
  sheetRefState.current = sheet;

  // ——— Capability gate (runs once, before three is even fetched) ———
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as any).connection;
    const thin = Boolean(
      conn && (conn.saveData || /(^|-)(2g|slow-2g|3g)$/.test(String(conn.effectiveType || ""))),
    );
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = document.createElement("canvas").getContext("webgl");
    } catch {
      gl = null;
    }
    setCapable(Boolean(gl) && !reduced && !thin);
  }, []);

  // Expand the server-rendered slot once we know the museum is coming.
  // ~90vh per work: a shorter hall walks at the same pace as before.
  useEffect(() => {
    if (!capable || !slotId) return;
    const slot = document.getElementById(slotId);
    if (!slot) return;
    slot.style.height = `${works.length * 90 + 100}vh`;
    /* The server-rendered lead painting (the incapable fallback) sits under
       the opaque stage from now on — hide it from paint and from AT. */
    const lead = slot.querySelector<HTMLElement>(":scope > div");
    if (lead) {
      lead.style.visibility = "hidden";
      lead.setAttribute("aria-hidden", "true");
    }
    return () => {
      slot.style.height = "";
      if (lead) {
        lead.style.visibility = "";
        lead.removeAttribute("aria-hidden");
      }
    };
  }, [capable, slotId, works.length]);

  // Layout is live (column vs sheet) while the world stays as built.
  useEffect(() => {
    /* Phones AND portrait tablets: a side card next to a 16:9 canvas does not
       fit a 2.4m half-corridor even at the 84° fov cap — the sheet does. */
    const mq = window.matchMedia("(max-width: 1023px) and (orientation: portrait)");
    const on = () => setPortraitUI(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // ——— Scene ———
  useEffect(() => {
    if (!capable || !stageRef.current || !wrapRef.current) return;
    let disposed = false;
    let raf = 0;
    let inView = true;
    let visible = !document.hidden;
    let covered = false;

    const stage = stageRef.current;
    const wrap = wrapRef.current;

    (async () => {
      await new Promise<void>((resolve) => {
        const idle = () =>
          "requestIdleCallback" in window
            ? (window as any).requestIdleCallback(() => resolve(), { timeout: 2500 })
            : setTimeout(resolve, 350);
        if (document.readyState === "complete") idle();
        else window.addEventListener("load", idle, { once: true });
      });
      if (disposed) return;
      const THREE = await import("three");
      if (disposed) return;
      /* The build is chunked across idle callbacks so no single task runs
         long: room → works → loop (Lighthouse TBT stays where v6 left it). */
      const breathe = () => new Promise<void>((r) => ("requestIdleCallback" in window ? (window as any).requestIdleCallback(() => r(), { timeout: 200 }) : setTimeout(r, 0)));

      const renderer: WebGLRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(stage.clientWidth, stage.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      stage.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.display = "block";
      renderer.domElement.style.touchAction = "pan-y";

      const scene = new THREE.Scene();
      const GROUND = new THREE.Color("#1d1411");
      scene.background = GROUND;
      scene.fog = new THREE.Fog(GROUND, 8, 32);

      const portrait = stage.clientWidth < stage.clientHeight;
      const phone = stage.clientWidth < 640 || stage.clientHeight < 560;
      const CH = portrait ? 2.4 : CORRIDOR_HALF;
      const CEIL_Y = portrait ? 3.2 : 4.2;
      const fovFor = () => (stage.clientWidth < stage.clientHeight ? 72 : 58);
      const camera: PerspectiveCamera = new THREE.PerspectiveCamera(fovFor(), stage.clientWidth / stage.clientHeight, 0.1, 80);
      const BASE_FOV = fovFor();

      const lastZ = -works.length * SPACING; // last work
      const endZ = lastZ - END_GAP; // end wall
      const hallLen = ENTRY_Z - endZ;
      const hallMid = (ENTRY_Z + endZ) / 2;

      // ——— Baked textures (procedural, cheap, no assets) ———
      const noise = (g: CanvasRenderingContext2D, w: number, h: number, amp: number) => {
        const img = g.getImageData(0, 0, w, h);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const n = (Math.random() - 0.5) * amp;
          d[i] += n;
          d[i + 1] += n;
          d[i + 2] += n;
        }
        g.putImageData(img, 0, 0);
      };
      const tex = (c: HTMLCanvasElement, rx = 1, ry = 1) => {
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(rx, ry);
        t.anisotropy = 4;
        return t;
      };
      // Plaster walls: the v6 vertical light gradient + fine grain
      const wallC = document.createElement("canvas");
      wallC.width = 128;
      wallC.height = 256;
      {
        const g = wallC.getContext("2d")!;
        const lg = g.createLinearGradient(0, 0, 0, 256);
        lg.addColorStop(0, "#221510");
        lg.addColorStop(0.45, "#3a241a");
        lg.addColorStop(0.68, "#2c1b12");
        lg.addColorStop(1, "#20130d");
        g.fillStyle = lg;
        g.fillRect(0, 0, 128, 256);
        noise(g, 128, 256, 14);
        // baseboard + cornice baked in (two draw calls fewer per wall)
        g.fillStyle = "#2a170f";
        g.fillRect(0, 256 - 10, 128, 10);
        g.fillStyle = "#3a2419";
        g.fillRect(0, 256 - 11, 128, 1);
        g.fillStyle = "#2f1b13";
        g.fillRect(0, 0, 128, 7);
        g.fillStyle = "#3a2419";
        g.fillRect(0, 7, 128, 1);
      }
      const wallTex = tex(wallC, 1, 1);
      wallTex.repeat.set(hallLen / 4, 1);
      const wallMat = new THREE.MeshBasicMaterial({ map: wallTex });
      // Plank floor: boards along the hall, per-board jitter, grain, a sheen
      // band under every bay so the pace of the works reads in the floor.
      const floorC = document.createElement("canvas");
      floorC.width = 256;
      floorC.height = 512; // one SPACING of hall
      {
        const g = floorC.getContext("2d")!;
        g.fillStyle = "#1a110c";
        g.fillRect(0, 0, 256, 512);
        const boards = 9;
        const bw = 256 / boards;
        for (let b = 0; b < boards; b++) {
          const j = (Math.random() - 0.5) * 10;
          g.fillStyle = `rgb(${30 + j},${19 + j * 0.6},${13 + j * 0.4})`;
          g.fillRect(b * bw + 1, 0, bw - 2, 512);
          g.strokeStyle = "rgba(0,0,0,0.35)";
          g.lineWidth = 1;
          for (let k = 0; k < 5; k++) {
            g.beginPath();
            const x = b * bw + 3 + Math.random() * (bw - 6);
            g.moveTo(x, 0);
            g.bezierCurveTo(x + 4, 150, x - 4, 350, x + 2, 512);
            g.stroke();
          }
          g.fillStyle = "rgba(0,0,0,0.5)";
          g.fillRect(b * bw, 0, 1, 512);
        }
        // sheen band (light landing under the paintings), soft
        const sg = g.createLinearGradient(0, 190, 0, 320);
        sg.addColorStop(0, "rgba(255,205,155,0)");
        sg.addColorStop(0.5, "rgba(255,205,155,0.10)");
        sg.addColorStop(1, "rgba(255,205,155,0)");
        g.fillStyle = sg;
        g.fillRect(0, 190, 256, 130);
        noise(g, 256, 512, 10);
      }
      const floorTex = tex(floorC, 1, hallLen / SPACING);
      // Coffered ceiling with soft disc highlights
      const ceilC = document.createElement("canvas");
      ceilC.width = 256;
      ceilC.height = 256;
      {
        const g = ceilC.getContext("2d")!;
        g.fillStyle = "#150d09";
        g.fillRect(0, 0, 256, 256);
        g.strokeStyle = "#1e130d";
        g.lineWidth = 5;
        g.strokeRect(12, 12, 232, 232);
        g.strokeStyle = "#0e0806";
        g.lineWidth = 2;
        g.strokeRect(30, 30, 196, 196);
        const rg = g.createRadialGradient(128, 128, 5, 128, 128, 75);
        rg.addColorStop(0, "rgba(255,200,150,0.10)");
        rg.addColorStop(1, "rgba(255,200,150,0)");
        g.fillStyle = rg;
        g.fillRect(0, 0, 256, 256);
        noise(g, 256, 256, 8);
      }
      const ceilTex = tex(ceilC, 1, hallLen / SPACING);

      const mat = (c: string) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c) });

      // ——— The room (every long surface a FrontSide plane) ———
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(CH * 2 + 2, hallLen), new THREE.MeshBasicMaterial({ map: floorTex }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, 0, hallMid);
      scene.add(floor);
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(CH * 2 + 2, hallLen), new THREE.MeshBasicMaterial({ map: ceilTex }));
      ceil.rotation.x = Math.PI / 2;
      ceil.position.set(0, CEIL_Y, hallMid);
      scene.add(ceil);
      for (const side of [-1, 1]) {
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(hallLen, CEIL_Y), wallMat);
        wall.rotation.y = (Math.PI / 2) * side;
        wall.position.set(CH * -side, CEIL_Y / 2, hallMid);
        scene.add(wall);
      }
      // End wall with a doorway (U9), the entry wall behind you (U4)
      const endW = CH * 2 + 2;
      const doorW = 1.6;
      const doorH = 2.6;
      for (const sx of [-1, 1]) {
        const jamb = new THREE.Mesh(new THREE.PlaneGeometry((endW - doorW) / 2, CEIL_Y + 0.2), wallMat);
        jamb.position.set(sx * (doorW / 2 + (endW - doorW) / 4), CEIL_Y / 2, endZ);
        scene.add(jamb);
      }
      const lintel = new THREE.Mesh(new THREE.PlaneGeometry(doorW, CEIL_Y - doorH + 0.2), wallMat);
      lintel.position.set(0, doorH + (CEIL_Y - doorH) / 2, endZ);
      scene.add(lintel);
      const entry = new THREE.Mesh(new THREE.PlaneGeometry(endW, CEIL_Y + 0.2), wallMat);
      entry.position.set(0, CEIL_Y / 2, ENTRY_Z);
      entry.rotation.y = Math.PI;
      scene.add(entry);
      // Threshold: three steps descending toward the glow beyond the doorway
      const stepMat = mat("#1f130d");
      for (let k = 0; k < 3; k++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.4, 0.14, 0.5), stepMat);
        step.position.set(0, -0.07 - k * 0.14, endZ - 0.4 - k * 0.5);
        scene.add(step);
      }
      // The far-end draw: warm light beyond the doorway
      const drawCanvas = document.createElement("canvas");
      drawCanvas.width = drawCanvas.height = 128;
      {
        const g = drawCanvas.getContext("2d")!;
        const rg = g.createRadialGradient(64, 64, 4, 64, 64, 64);
        rg.addColorStop(0, "rgba(255, 190, 130, 0.6)");
        rg.addColorStop(1, "rgba(255, 190, 130, 0)");
        g.fillStyle = rg;
        g.fillRect(0, 0, 128, 128);
      }
      const drawGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 3.4),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(drawCanvas), transparent: true, depthWrite: false, fog: false }),
      );
      drawGlow.position.set(0, 1.2, endZ - 2.2);
      scene.add(drawGlow);

      // Radial "spotlight pool" sprite, shared by every canvas
      const poolCanvas = document.createElement("canvas");
      poolCanvas.width = poolCanvas.height = 256;
      {
        const g = poolCanvas.getContext("2d")!;
        const grad = g.createRadialGradient(128, 128, 8, 128, 128, 128);
        grad.addColorStop(0, "rgba(255, 220, 180, 0.34)");
        grad.addColorStop(0.5, "rgba(255, 200, 150, 0.09)");
        grad.addColorStop(1, "rgba(255, 200, 150, 0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 256, 256);
      }
      const poolTex = new THREE.CanvasTexture(poolCanvas);
      const poolMat = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false });
      const floorPoolMat = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, opacity: 0.4 });

      await breathe();
      if (disposed) return;
      // ——— The works ———
      const loader = new THREE.TextureLoader();
      const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const paintingMeshes: Mesh[] = [];
      const paintingMats: MeshBasicMaterial[] = [];
      const videoEls: (HTMLVideoElement | null)[] = works.map(() => null);
      const loadedFlags: boolean[] = works.map(() => false);
      // Frame finish: moulding, gilt lip (top face lit), slip, rebate. The
      // lit top reads through VERTEX colours on a single material — one draw
      // call per box (a per-face material array costs six).
      const litBox = (w: number, h: number, d: number, side: string, top: string) => {
        const g = new THREE.BoxGeometry(w, h, d);
        const cs = new THREE.Color(side), ct = new THREE.Color(top);
        const n = g.attributes.position.count;
        const col = new Float32Array(n * 3);
        const nrm = g.attributes.normal;
        for (let i = 0; i < n; i++) {
          const up = nrm.getY(i) > 0.5;
          const c = up ? ct : cs;
          col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        }
        g.setAttribute("color", new THREE.BufferAttribute(col, 3));
        return g;
      };
      const vcMat = new THREE.MeshBasicMaterial({ vertexColors: true });
      const slipMat = mat("#1a100a");

      type Placement = { pos: { x: number; y: number; z: number }; side: number; w: number; h: number };
      const placements: Placement[] = [];

      works.forEach((work, i) => {
        const side = i % 2 === 0 ? 1 : -1; // 1 = right wall
        const z = -(i + 1) * SPACING;
        const isPortrait = work.aspect < 1;
        // U8: true aspect inside a max box; portrait hangs tall and narrow
        let h = isPortrait ? (phone ? 2.3 : 2.6) : 2.0;
        let w = h * work.aspect;
        const maxW = isPortrait ? 3.2 : 3.6;
        if (w > maxW) {
          w = maxW;
          h = w / work.aspect;
        }
        const yC = isPortrait ? 1.6 : 1.7;
        const x = (CH - 0.1) * side;
        placements.push({ pos: { x, y: yC, z }, side, w, h });

        const rotY = side === 1 ? 0 : Math.PI;
        const moulding = new THREE.Mesh(litBox(0.11, h + 0.3, w + 0.3, "#80412b", "#95502f"), vcMat);
        moulding.position.set((CH + 0.03) * side, yC, z);
        moulding.rotation.y = rotY;
        scene.add(moulding);
        const lip = new THREE.Mesh(litBox(0.13, h + 0.16, w + 0.16, "#8f7040", "#ad8950"), vcMat);
        lip.position.set((CH + 0.03) * side, yC, z);
        lip.rotation.y = rotY;
        scene.add(lip);
        // slip: the dark inner ring (also the shadow behind the canvas edge)
        const slip = new THREE.Mesh(new THREE.BoxGeometry(0.14, h + 0.07, w + 0.07), slipMat);
        slip.position.set((CH + 0.03) * side, yC, z);
        slip.rotation.y = rotY;
        scene.add(slip);

        const cmat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#2f1d14") });
        const canvasMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), cmat);
        canvasMesh.position.set(x - 0.045 * side, yC, z);
        canvasMesh.rotation.y = (-Math.PI / 2) * side;
        canvasMesh.userData.workIndex = i;
        scene.add(canvasMesh);
        paintingMeshes.push(canvasMesh);
        paintingMats.push(cmat);

        const pool = new THREE.Mesh(new THREE.PlaneGeometry(w * 2.0, h * 2.0), poolMat);
        pool.position.set((CH - 0.02) * side, yC + 0.15, z);
        pool.rotation.y = (-Math.PI / 2) * side;
        scene.add(pool);
        // floor echo under the five chapter canvases (draw-call budget ≤ 80)
        if (work.sketch) {
          const fpool = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.3, 1.4), floorPoolMat);
          fpool.rotation.x = -Math.PI / 2;
          fpool.rotation.z = Math.PI / 2;
          fpool.position.set((CH - 0.8) * side, 0.012, z);
          scene.add(fpool);
        }

        // The study, hung screen-RIGHT of its painting on BOTH walls
        if (work.sketch) {
          const sh = 0.85;
          const sw = sh * (work.sketchAspect ?? 1.25);
          const sz = z + side * (w / 2 + sw / 2 + 0.6);
          const sframe = new THREE.Mesh(litBox(0.08, sh + 0.14, sw + 0.14, "#80412b", "#95502f"), vcMat);
          sframe.position.set((CH + 0.03) * side, 1.55, sz);
          sframe.rotation.y = rotY;
          scene.add(sframe);
          const smat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#2f1d14") });
          const smesh = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), smat);
          smesh.position.set((CH - 0.03) * side, 1.55, sz);
          smesh.rotation.y = (-Math.PI / 2) * side;
          scene.add(smesh);
          loader.load(work.sketch, (t) => {
            if (disposed) return;
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = maxAniso;
            smat.map = t;
            smat.color.set("#ffffff");
            smat.needsUpdate = true;
          });
        }
      });

      const isPhoneTex = window.innerWidth < 1024;
      const loadWork = (i: number) => {
        if (loadedFlags[i]) return;
        loadedFlags[i] = true;
        loader.load(isPhoneTex ? works[i].tex800 : works[i].tex1440, (t) => {
          if (disposed) return;
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = maxAniso;
          paintingMats[i].map = t;
          paintingMats[i].color.set("#ffffff");
          paintingMats[i].needsUpdate = true;
        });
      };
      loadWork(0);
      loadWork(1);
      setTimeout(() => {
        if (!disposed) works.forEach((_, i) => loadWork(i));
      }, 1200);

      await breathe();
      if (disposed) return;
      // ——— Rail + look state ———
      let railT = 0;
      let mode: "rail" | "approach" = "rail";
      let approachedIdx: number | null = null;
      let zoom = 1;
      let alivePrimed = true; // edge-triggered zoom rule
      let dragYaw = 0;
      let dragPitch = 0;
      let yawVel = 0;
      const cur = { x: 0, y: EYE, z: 0, yaw: 0, pitch: 0 };
      let target = { x: 0, y: EYE, z: 0, yaw: 0, pitch: 0 };
      const railPitch = portrait ? RAIL_PITCH_PORTRAIT : RAIL_PITCH;
      const railZ = () => 0.4 - railT * (works.length * SPACING + OVERRUN - 0.4);

      let lastRailIdx = -1;
      const onScroll = () => {
        const r = wrap.getBoundingClientRect();
        const total = r.height - stage.clientHeight;
        railT = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
        const idx = Math.min(works.length - 1, Math.max(0, Math.round(-railZ() / SPACING) - 1));
        if (idx !== lastRailIdx) {
          lastRailIdx = idx;
          setRailIdx(idx);
        }
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      // ——— Approach composition (pure, per frame) ———
      const layout = () => {
        const W = stage.clientWidth;
        const H = stage.clientHeight;
        const isPortraitUI = W < 1024 && H > W;
        const inset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-inset")) || 20;
        if (isPortraitUI) {
          const sheetH = sheetRef.current?.getBoundingClientRect().height ?? 110;
          const top = inset + 56; // chip row + Back
          return { F: 0.86, V: Math.max(0.3, 1 - (sheetH + 16) / H - top / H), cx: 0.5, cy: 0.5 - (sheetH / H) / 2 + top / H / 2 };
        }
        // desktop / landscape: card left ~30%, painting centred, sketch right
        const cardFrac = Math.min(0.34, (Math.min(0.3 * W, 22 * 16) + inset + 24) / W);
        return { F: 1 - 2 * cardFrac, V: 0.72, cx: 0.5, cy: 0.5 };
      };
      const compose = (i: number) => {
        const p = placements[i];
        const L = layout();
        const vfov = (BASE_FOV * Math.PI) / 180;
        const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
        let d = Math.max(p.w / (2 * Math.tan(hfov / 2) * L.F), p.h / (2 * Math.tan(vfov / 2) * L.V));
        const dMax = 2 * CH - 0.15;
        let fov = BASE_FOV;
        if (d > dMax) {
          // widen the eye instead of leaving the corridor (up to 84°)
          const need = 2 * Math.atan(Math.tan(vfov / 2) * (d / dMax));
          fov = Math.min(84, (need * 180) / Math.PI);
          d = dMax;
        }
        const dEff = Math.max(0.6, d / zoom);
        // vertical: place the painting centre at cy of the frame
        const vfovNow = (fov * Math.PI) / 180;
        const yShift = (0.5 - L.cy) * 2 * dEff * Math.tan(vfovNow / 2);
        return {
          x: p.pos.x - p.side * dEff,
          y: p.pos.y - yShift,
          z: p.pos.z,
          yaw: (-Math.PI / 2) * p.side,
          pitch: 0,
          fov,
        };
      };

      // ——— Look controller ———
      let dragging = false;
      let px = 0;
      let py = 0;
      let downAt = 0;
      let downX = 0;
      let downY = 0;
      let lastTap = 0;
      let moved = 0;
      const dyaws: number[] = [];
      const down = (e: PointerEvent) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        dragging = true;
        px = downX = e.clientX;
        py = downY = e.clientY;
        downAt = performance.now();
        moved = 0;
        yawVel = 0;
        dyaws.length = 0;
        renderer.domElement.style.touchAction = mode === "approach" ? "none" : "pan-y";
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - px;
        const dy = e.clientY - py;
        moved += Math.abs(dx) + Math.abs(dy);
        const dyaw = dx * 0.0035;
        dragYaw += dyaw;
        dragPitch = Math.max(-0.55, Math.min(0.5, dragPitch + dy * 0.0025));
        dyaws.push(dyaw);
        if (dyaws.length > 3) dyaws.shift();
        px = e.clientX;
        py = e.clientY;
      };
      const up = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        yawVel = dyaws.length ? (dyaws.reduce((a, b) => a + b, 0) / dyaws.length) * 60 : 0; // rad/s
        const dt = performance.now() - downAt;
        const isTap = dt < 300 && moved < 8;
        if (isTap) {
          const now = performance.now();
          const dbl = now - lastTap < 320;
          lastTap = now;
          tap(e, dbl);
        }
      };
      renderer.domElement.addEventListener("pointerdown", down);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);

      const ray = new THREE.Raycaster();
      const hitPainting = (e: { clientX: number; clientY: number }) => {
        const rect = renderer.domElement.getBoundingClientRect();
        const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        return ray.intersectObjects(paintingMeshes)[0] ?? null;
      };
      const tap = (e: PointerEvent, dbl: boolean) => {
        const hit = hitPainting(e);
        if (mode === "rail") {
          if (hit) approach(hit.object.userData.workIndex as number);
          else if (dbl) recenter();
          return;
        }
        // approach: tapping the painting toggles the Easter egg
        if (hit && (hit.object.userData.workIndex as number) === approachedIdx) toggleAlive();
        else if (dbl) recenter();
      };
      const recenter = () => {
        dragYaw = 0;
        dragPitch = 0;
        yawVel = 0;
      };
      // wheel: zoom in approach, page scroll on the rail
      const onWheel = (e: WheelEvent) => {
        if (mode !== "approach") return;
        e.preventDefault();
        setZoom(zoom * Math.exp(-e.deltaY * 0.0016));
      };
      stage.addEventListener("wheel", onWheel, { passive: false });
      // pinch in approach
      const pinch = new Map<number, { x: number; y: number }>();
      let pinchD = 0;
      stage.addEventListener("pointerdown", (e) => {
        if (mode !== "approach" || e.pointerType !== "touch") return;
        pinch.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch.size === 2) {
          const [a, b] = [...pinch.values()];
          pinchD = Math.hypot(a.x - b.x, a.y - b.y);
          dragging = false;
        }
      });
      stage.addEventListener("pointermove", (e) => {
        if (!pinch.has(e.pointerId)) return;
        pinch.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch.size === 2 && pinchD > 0) {
          const [a, b] = [...pinch.values()];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          setZoom(zoom * (d / pinchD));
          pinchD = d;
        }
      });
      const pinchEnd = (e: PointerEvent) => {
        pinch.delete(e.pointerId);
        pinchD = 0;
      };
      stage.addEventListener("pointerup", pinchEnd);
      stage.addEventListener("pointercancel", pinchEnd);

      const setZoom = (z: number) => {
        zoom = Math.max(1, Math.min(2.4, z));
        // edge-triggered alive: ≥1.35 turns on once, ≤1.20 turns off and re-arms
        if (mode === "approach" && approachedIdx !== null) {
          if (zoom >= 1.35 && alivePrimed) {
            alivePrimed = false;
            if (videoEls[approachedIdx] === null) turnOn(approachedIdx);
          } else if (zoom <= 1.2 && !alivePrimed) {
            alivePrimed = true;
            turnOff();
          }
        }
      };
      const toggleAlive = () => {
        if (approachedIdx === null) return;
        if (videoEls[approachedIdx]) turnOff();
        else turnOn(approachedIdx);
      };

      // ——— Approach / return ———
      let approachedAt = 0;
      const approach = (i: number | null) => {
        approachedIdx = i;
        if (i === null) {
          mode = "rail";
          zoom = 1;
          alivePrimed = true;
          setApproached(null);
          setPaintRect(null);
          setSheet("peek");
          turnOff();
          renderer.domElement.style.touchAction = "pan-y";
          return;
        }
        loadWork(i);
        mode = "approach";
        zoom = 1;
        alivePrimed = true;
        recenter();
        approachedAt = performance.now();
        setSheet("peek");
        setApproached(i);
        renderer.domElement.style.touchAction = "none";
        // pre-create the film so a later tap plays inside the gesture on iOS
        if (works[i].video && !videoEls[i]) {
          /* nothing yet — created on turnOn; preload hint below */
        }
      };

      const turnOn = (i: number) => {
        turnOff();
        const w = works[i];
        if (!w.video) return;
        const v = document.createElement("video");
        v.src = w.video;
        v.loop = true;
        v.muted = true;
        v.playsInline = true;
        v.preload = "auto";
        v.crossOrigin = "anonymous";
        const vt = new THREE.VideoTexture(v);
        vt.colorSpace = THREE.SRGBColorSpace;
        v.addEventListener(
          "loadedmetadata",
          () => {
            // cover-fit the film's real aspect onto the canvas's real aspect
            const va = v.videoWidth / v.videoHeight || w.aspect;
            const pa = w.aspect;
            if (va > pa) {
              vt.repeat.set(pa / va, 1);
              vt.offset.set((1 - pa / va) / 2, 0);
            } else {
              vt.repeat.set(1, va / pa);
              vt.offset.set(0, (1 - va / pa) / 2);
            }
          },
          { once: true },
        );
        const tryPlay = () => v.play().catch(() => {
          // iOS Low-Power may reject: retry on the next ending gesture
          const retry = () => {
            v.play().catch(() => {});
            window.removeEventListener("pointerup", retry);
          };
          window.addEventListener("pointerup", retry, { once: true });
        });
        tryPlay();
        paintingMats[i].map = vt;
        paintingMats[i].needsUpdate = true;
        videoEls[i] = v;
        setAlive(i);
      };
      const turnOff = () => {
        videoEls.forEach((v, i) => {
          if (v) {
            v.pause();
            v.removeAttribute("src");
            v.load();
            videoEls[i] = null;
            loadedFlags[i] = false;
            loadWork(i);
          }
        });
        setAlive(null);
      };

      // ——— Keyboard (window-level; the DOM buttons remain the primary path) ———
      const onKey = (e: KeyboardEvent) => {
        const t = e.target as HTMLElement | null;
        if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;
        const stageIn = (() => {
          const r = stage.getBoundingClientRect();
          return r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
        })();
        if (!stageIn) return;
        if (e.key === "Escape") {
          if (approachedIdx !== null) {
            approach(null);
            e.preventDefault();
          }
          return;
        }
        if (mode === "rail") {
          if (e.key === "ArrowLeft") { dragYaw += 0.35; e.preventDefault(); }
          else if (e.key === "ArrowRight") { dragYaw -= 0.35; e.preventDefault(); }
          else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { window.scrollBy({ top: window.innerHeight * 0.45, behavior: "smooth" }); e.preventDefault(); }
          else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { window.scrollBy({ top: -window.innerHeight * 0.45, behavior: "smooth" }); e.preventDefault(); }
          else if (e.key === "Enter" && t && t.tagName === "BODY") { approach(lastRailIdx < 0 ? 0 : lastRailIdx); e.preventDefault(); }
        } else {
          if (e.key === "ArrowLeft") { approach(Math.max(0, (approachedIdx ?? 0) - 1)); e.preventDefault(); }
          else if (e.key === "ArrowRight") { approach(Math.min(works.length - 1, (approachedIdx ?? 0) + 1)); e.preventDefault(); }
          else if (e.key === "+" || e.key === "=") { setZoom(zoom * 1.25); e.preventDefault(); }
          else if (e.key === "-" || e.key === "_") { setZoom(zoom / 1.25); e.preventDefault(); }
        }
      };
      window.addEventListener("keydown", onKey);

      // ——— Frame loop ———
      let lastT = performance.now();
      let lookedFlag = false;
      let rectTick = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!(inView && visible && !covered)) return;
        const now = performance.now();
        const dt = Math.min((now - lastT) / 1000, 0.05);
        lastT = now;
        // damping τ ≈ 0.22s dolly / 0.16s look
        const kMove = 1 - Math.exp(-dt / 0.22);
        const kLook = 1 - Math.exp(-dt / 0.16);

        if (mode === "rail") {
          target = { x: 0, y: EYE, z: railZ(), yaw: 0, pitch: railPitch };
          const idx = Math.min(works.length - 1, Math.max(0, Math.round(-target.z / SPACING)));
          loadWork(idx);
          if (idx + 1 < works.length) loadWork(idx + 1);
          if (Math.abs(camera.fov - BASE_FOV) > 0.01) {
            camera.fov += (BASE_FOV - camera.fov) * kMove;
            camera.updateProjectionMatrix();
          }
        } else if (approachedIdx !== null) {
          const c = compose(approachedIdx);
          target = { x: c.x, y: c.y, z: c.z, yaw: c.yaw, pitch: c.pitch };
          if (Math.abs(camera.fov - c.fov) > 0.01) {
            camera.fov += (c.fov - camera.fov) * kMove;
            camera.updateProjectionMatrix();
          }
        }
        // inertia on the look (decays with τ 0.18s)
        if (!dragging && Math.abs(yawVel) > 0.0005) {
          dragYaw += yawVel * dt;
          yawVel *= Math.exp(-dt / 0.18);
        }
        cur.x += (target.x - cur.x) * kMove;
        cur.y += (target.y - cur.y) * kMove;
        cur.z += (target.z - cur.z) * kMove;
        // yaw wraps: take the short way round
        let dy = target.yaw + dragYaw - cur.yaw;
        dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        cur.yaw += dy * kLook;
        const totalPitch = Math.max(-0.55, Math.min(0.5, target.pitch + dragPitch));
        cur.pitch += (totalPitch - cur.pitch) * kLook;

        camera.position.set(cur.x, cur.y, cur.z);
        camera.rotation.set(cur.pitch, cur.yaw, 0, "YXZ");
        renderer.render(scene, camera);

        const away = Math.abs(dragYaw) > 0.35;
        if (away !== lookedFlag) {
          lookedFlag = away;
          setLookedAway(away);
        }
        // the projected painting rect for the invisible focus button (4 Hz)
        if (mode === "approach" && approachedIdx !== null && now - approachedAt > 600 && ++rectTick % 15 === 0) {
          const r = paintingRect(approachedIdx);
          if (r && !r.behind) setPaintRect({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.right - r.left), h: Math.round(r.bottom - r.top) });
        }
      };
      tick();
      setReady(true);

      // Pause when offscreen / hidden / covered (v7: split, lastT reset on resume)
      const resume = () => {
        lastT = performance.now();
      };
      const io = new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        if (inView) resume();
      });
      io.observe(stage);
      const onVis = () => {
        visible = !document.hidden;
        if (visible) resume();
        else videoEls.forEach((v) => v && v.pause());
      };
      document.addEventListener("visibilitychange", onVis);
      const onCover = () => {
        covered = true;
        videoEls.forEach((v) => v && v.pause());
      };
      document.addEventListener("cnwm:curtain-cover", onCover);
      window.addEventListener("pagehide", onCover);
      const onResize = () => {
        renderer.setSize(stage.clientWidth, stage.clientHeight);
        camera.aspect = stage.clientWidth / stage.clientHeight;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);
      renderer.domElement.addEventListener("webglcontextlost", () => setCapable(false));

      // ——— Debug hook (scripts/museum-check.mjs) ———
      const paintingRect = (i: number) => {
        const m = paintingMeshes[i];
        if (!m) return null;
        m.updateWorldMatrix(true, false);
        const geo = m.geometry as any;
        geo.computeBoundingBox?.();
        const bb = geo.boundingBox;
        if (!bb) return null;
        const rect = renderer.domElement.getBoundingClientRect();
        const pts = [
          [bb.min.x, bb.min.y, 0],
          [bb.max.x, bb.min.y, 0],
          [bb.min.x, bb.max.y, 0],
          [bb.max.x, bb.max.y, 0],
        ].map(([x, y, z]) => {
          const v = new THREE.Vector3(x, y, z).applyMatrix4(m.matrixWorld).project(camera);
          return { x: rect.left + ((v.x + 1) / 2) * rect.width, y: rect.top + ((1 - v.y) / 2) * rect.height, behind: v.z > 1 };
        });
        const xs = pts.map((p) => p.x);
        const ys = pts.map((p) => p.y);
        return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys), behind: pts.some((p) => p.behind) };
      };
      const hook = {
        get state() {
          return {
            mode,
            railT,
            railIdx: lastRailIdx,
            approached: approachedIdx,
            zoom,
            cur: { ...cur },
            target: { ...target },
            look: { yaw: cur.yaw, pitch: cur.pitch, dragYaw, dragPitch },
            alive: videoEls.findIndex((v) => Boolean(v)),
            fov: camera.fov,
            far: camera.far,
            portrait,
            running: inView && visible && !covered,
            works: works.length,
            spacing: SPACING,
            sheet: sheetRefState.current,
          };
        },
        approach,
        turnOn,
        turnOff,
        recenter,
        setZoom,
        setLook: (yaw: number, pitch: number) => {
          dragYaw = yaw;
          dragPitch = pitch;
        },
        setSheet: (s: "peek" | "full") => setSheet(s),
        paintingRect,
        placements,
        get info() {
          return renderer.info;
        },
        camera,
      };
      (window as any).__museum = hook;

      api.current = {
        approach,
        turnOn,
        turnOff,
        recenter,
        setZoom,
        dispose: () => {
          disposed = true;
          if ((window as any).__museum === hook) delete (window as any).__museum;
          cancelAnimationFrame(raf);
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          window.removeEventListener("pointercancel", up);
          window.removeEventListener("keydown", onKey);
          window.removeEventListener("resize", onResize);
          document.removeEventListener("visibilitychange", onVis);
          document.removeEventListener("cnwm:curtain-cover", onCover);
          window.removeEventListener("pagehide", onCover);
          stage.removeEventListener("wheel", onWheel);
          io.disconnect();
          turnOff();
          renderer.dispose();
          scene.traverse((o: any) => {
            o.geometry?.dispose?.();
            const m = o.material;
            if (m) (Array.isArray(m) ? m : [m]).forEach((mm: any) => { mm.map?.dispose?.(); mm.dispose?.(); });
          });
          renderer.domElement.remove();
        },
      };
    })();

    return () => {
      api.current?.dispose();
      api.current = null;
    };
  }, [capable, works]);

  // Focus management (V7-080): approach → Back gets focus; return → the dot
  // of the work you were looking at.
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const returnIdx = useRef<number | null>(null);
  useEffect(() => {
    if (approached !== null) {
      returnIdx.current = approached;
      setTimeout(() => backRef.current?.focus({ preventScroll: true }), 50);
    } else if (returnIdx.current !== null) {
      dotRefs.current[returnIdx.current]?.focus({ preventScroll: true });
      returnIdx.current = null;
    }
  }, [approached]);

  // ——— Phone sheet drag (pointer capture, rAF-throttled transform, velocity settles) ———
  const dragState = useRef<{ y0: number; h0: number; t0: number; ly: number; lt: number; dy: number } | null>(null);
  const onSheetDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = sheetRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    dragState.current = { y0: e.clientY, h0: el.getBoundingClientRect().height, t0: performance.now(), ly: e.clientY, lt: performance.now(), dy: 0 };
    el.style.transition = "none";
  };
  const onSheetMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragState.current;
    const el = sheetRef.current;
    if (!d || !el) return;
    d.dy = e.clientY - d.y0;
    const now = performance.now();
    d.ly = e.clientY;
    d.lt = now;
    requestAnimationFrame(() => {
      if (!dragState.current) return;
      const shift = sheet === "peek" ? Math.min(0, d.dy) : Math.max(0, d.dy);
      el.style.transform = `translateY(${shift}px)`;
    });
  };
  const onSheetUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragState.current;
    const el = sheetRef.current;
    dragState.current = null;
    if (!d || !el) return;
    const dt = Math.max(1, performance.now() - d.t0);
    const v = d.dy / dt; // px/ms
    el.style.transition = "transform var(--dur-fast) var(--ease)";
    el.style.transform = "";
    const stageH = stageRef.current?.clientHeight ?? 800;
    if (Math.abs(v) > 0.3) setSheet(v < 0 ? "full" : "peek");
    else if (Math.abs(d.dy) > stageH * 0.12) setSheet(d.dy < 0 ? "full" : "peek");
    else if (Math.abs(d.dy) < 6) setSheet(sheet === "peek" ? "full" : "peek"); // a tap toggles
    void e;
  };

  if (!capable) return null;

  const plaque = approached !== null ? works[approached] : null;
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const inApproach = approached !== null;

  return (
    <div ref={wrapRef} style={slotId ? undefined : { height: `${works.length * 90 + 100}vh` }} className={slotId ? "relative h-full" : "relative"}>
      <div ref={stageRef} className="sticky top-0 h-dvh w-full overflow-hidden bg-primary-2" style={{ overscrollBehaviorX: "none" }}>
        {/* Wayfinding chip (rail) → Face forward (looked away). Top-centre; the
            top-right lane belongs to the corner menu on this page. */}
        {ready && !inApproach && (
          <div className="pointer-events-none absolute inset-x-0 z-10 flex justify-center" style={{ top: "calc(var(--ui-inset) + env(safe-area-inset-top))" }}>
            {lookedAway ? (
              <button
                type="button"
                className="btn-sm btn-ghost pointer-events-auto"
                style={{ background: "color-mix(in srgb, var(--color-primary-2) 82%, transparent)" }}
                onClick={() => api.current?.recenter()}
              >
                Face forward
              </button>
            ) : (
              <p className="t-meta inline-block rounded-full px-4 py-2" style={{ background: "color-mix(in srgb, var(--color-primary-2) 72%, transparent)" }}>
                <span className="hidden sm:inline">The Museum · scroll to walk · drag to look · tap a painting</span>
                <span className="sm:hidden">Scroll to walk</span>
              </p>
            )}
          </div>
        )}

        {/* Skip — top-LEFT on the inset (the menu owns top-right). */}
        {ready && !inApproach && (
          <div className="absolute z-10" style={{ top: "calc(var(--ui-inset) + env(safe-area-inset-top))", left: "var(--ui-inset)" }}>
            <button
              type="button"
              className="btn-sm btn-ghost"
              style={{ background: "color-mix(in srgb, var(--color-primary-2) 72%, transparent)" }}
              onClick={() => {
                const r = wrapRef.current?.getBoundingClientRect();
                if (r) window.scrollTo({ top: window.scrollY + r.bottom, behavior: "smooth" });
              }}
              aria-label="Skip the hall"
            >
              <span className="hidden sm:inline">Skip the hall</span>
              <span className="sm:hidden">Skip</span>
              <svg className="icon icon-sm icon-filled" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: "rotate(90deg)" }}>
                <path d="M16.42 11.35H3.3a0.65 0.65 0 000 1.3h13.12z" />
                <path d="M14.39 17.12c0.19 0.18 0.4 0.2 0.64 0.06l6.74-4.3c0.33-0.21 0.49-0.5 0.49-0.88 0-0.38-0.16-0.67-0.49-0.88l-6.74-4.3c-0.24-0.14-0.45-0.12-0.64 0.06-0.19 0.18-0.22 0.39-0.1 0.64l2.13 3.83v1.3l-2.13 3.82c-0.12 0.25-0.09 0.47 0.1 0.65z" />
              </svg>
            </button>
          </div>
        )}

        {/* Approach: Back to the hall — top-left, always reachable (phones);
            in the card on larger screens. */}
        {plaque && portraitUI && (
          <button
            ref={backRef}
            type="button"
            className="btn-sm btn-ghost absolute z-20"
            style={{ top: "calc(var(--ui-inset) + env(safe-area-inset-top))", left: "var(--ui-inset)", background: "color-mix(in srgb, var(--color-primary-2) 82%, transparent)" }}
            onClick={() => api.current?.approach(null)}
          >
            Back to the hall
          </button>
        )}

        {/* The invisible, focusable Easter-egg toggle over the projected painting */}
        {plaque && plaque.video && paintRect && (
          <button
            type="button"
            className="museum-alive-toggle absolute z-10"
            style={{ left: paintRect.x, top: paintRect.y, width: paintRect.w, height: paintRect.h }}
            aria-label={alive === approached ? "Let the painting rest" : "Bring the painting to life"}
            onClick={() => (alive === approached ? api.current?.turnOff() : api.current?.turnOn(approached!))}
          />
        )}

        {/* Desktop / landscape card — left edge, vertically centred, no border, one button */}
        {plaque && !portraitUI && (
          <div
            className="absolute z-20 -translate-y-1/2"
            style={{ left: "var(--ui-inset)", top: "50%", width: "min(calc(30vw - var(--ui-inset) - 24px), 22rem)" }}
          >
            <div className="rounded-[12px] p-5" style={{ background: "color-mix(in srgb, var(--color-primary-2) 84%, transparent)", backdropFilter: "blur(8px)" }}>
              <p className="t-meta">Mark Priest · Nalle Series · Spot {pad2(plaque.order)}</p>
              <p className="t-title-sm mt-3">{plaque.title}</p>
              {plaque.line && !(stageRef.current && stageRef.current.clientHeight < 500) && (
                <figure className="mt-4">
                  <blockquote className="t-meta-body italic">“{plaque.line}”</blockquote>
                  {plaque.lineBy && <figcaption className="t-meta mt-2">{plaque.lineBy}</figcaption>}
                </figure>
              )}
              <div className="mt-5">
                <button ref={backRef} type="button" className="btn-sm btn-ghost" onClick={() => api.current?.approach(null)}>
                  Back to the hall
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phone portrait: the peek-sheet (drag or tap the header) */}
        {plaque && portraitUI && (
          <div
            ref={sheetRef}
            className="museum-sheet absolute inset-x-0 bottom-0 z-20"
            data-state={sheet}
            style={{ maxHeight: sheet === "full" ? "55dvh" : undefined, transition: "transform var(--dur-fast) var(--ease)" }}
          >
            <div
              className="museum-sheet-head cursor-grab touch-none px-[var(--ui-inset)] pt-3 pb-3"
              onPointerDown={onSheetDown}
              onPointerMove={onSheetMove}
              onPointerUp={onSheetUp}
              onPointerCancel={onSheetUp}
              role="button"
              tabIndex={0}
              aria-expanded={sheet === "full"}
              aria-label={sheet === "full" ? "Collapse the plaque" : "Expand the plaque"}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSheet(sheet === "peek" ? "full" : "peek");
                }
              }}
            >
              <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-primary-7" aria-hidden="true" />
              <p className="t-meta">Mark Priest · Nalle Series · Spot {pad2(plaque.order)}</p>
              <p className="t-title-sm mt-2">{plaque.title}</p>
            </div>
            {sheet === "full" && (
              <div className="museum-sheet-body px-[var(--ui-inset)] pb-[calc(var(--ui-inset)+8px)]" style={{ overflowY: "auto", overscrollBehavior: "contain", maxHeight: "calc(55dvh - 118px)" }}>
                {plaque.line && (
                  <figure>
                    <blockquote className="t-meta-body italic">“{plaque.line}”</blockquote>
                    {plaque.lineBy && <figcaption className="t-meta mt-2">{plaque.lineBy}</figcaption>}
                  </figure>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dot rail — every mode; rides above the sheet on phones */}
        {ready && (
          <nav
            className="absolute left-1/2 z-30 flex -translate-x-1/2 items-center gap-4"
            style={{
              bottom: plaque && portraitUI ? `calc(${sheet === "full" ? "55dvh" : "132px"} + 12px)` : "calc(var(--ui-inset) + 4px)",
              transition: "bottom var(--dur-fast) var(--ease)",
            }}
            aria-label="Works in the hall"
          >
            <p className="t-meta hidden whitespace-nowrap sm:block" aria-hidden="true">
              {pad2((approached ?? railIdx) + 1)} / {pad2(works.length)}
            </p>
            <ol className="flex items-center gap-2">
              {works.map((w, i) => {
                const active = i === (approached ?? railIdx);
                return (
                  <li key={w.slug + w.key}>
                    <button
                      type="button"
                      ref={(el) => {
                        dotRefs.current[i] = el;
                      }}
                      onClick={() => api.current?.approach(i)}
                      aria-label={`Approach “${w.title}”`}
                      aria-current={active ? "true" : undefined}
                      className={`grid h-6 w-6 cursor-pointer place-items-center rounded-full border transition-colors ${active ? "border-primary-9" : "border-primary-7 hover:border-primary-9"}`}
                      style={{ background: "color-mix(in srgb, var(--color-primary-2) 72%, transparent)" }}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-primary-9" : "bg-primary-11/60"}`} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
      </div>
    </div>
  );
}
