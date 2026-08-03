import { useEffect, useRef, useState } from "react";
import type { Color, Mesh, MeshBasicMaterial } from "three";

/**
 * THE MUSEUM — the site's one concentrated boldness (v6 locked decision #2).
 *
 * A single warm gallery corridor built from the site's own tokens. The page's
 * native scroll walks the camera down a rail past every canvas (a tall
 * wrapper + sticky viewport — NO scroll-jacking); drag adds a clamped look;
 * tapping a painting eases the camera frontal and raises its plaque, where
 * "Bring it to life" swaps the canvas for Mark Priest's animated variant
 * (one alive at a time). Esc or Back returns to the rail.
 *
 * Craft bars (PLAN.md P4):
 *  · No loading gate — canvases fade up from the ground color as textures
 *    arrive, nearest first.
 *  · DPR ≤ 1.5 · rAF paused when offscreen or tab-hidden · full dispose on
 *    unmount · `three` dynamically imported only after the capability gate.
 *  · Fallbacks — no WebGL, prefers-reduced-motion, Save-Data/2g/3g: the
 *    island renders nothing and the 2-D grid below is the page, unchanged.
 *  · Keyboard path: the work list under the stage is real buttons — Enter
 *    approaches; the plaque's controls are real buttons; Esc returns. The
 *    canvas itself stays aria-hidden; the DOM grid remains the SR surface.
 */

export interface Work {
  slug: string;
  key: string;
  title: string;
  order: number;
  /** Texture sources (1440 for desktop, 800 for phones) */
  tex1440: string;
  tex800: string;
  /** Animated variant, if Mark Priest made one */
  video: string | null;
  /** The study hung beside this canvas (main chapter paintings only) */
  sketch: string | null;
  /** Aspect ratio w/h of the canvas */
  aspect: number;
  /** A line from the day — the scene's approved quote, spoken on the plaque */
  line: string | null;
  lineBy: string | null;
}

interface Props {
  works: Work[];
}

const SPACING = 7; // metres of corridor per canvas
const CORRIDOR_HALF = 3.4; // wall distance from the rail
const EYE = 1.55;

export default function Museum({ works }: Props) {
  const [capable, setCapable] = useState<boolean | null>(null);
  const [approached, setApproached] = useState<number | null>(null);
  const [alive, setAlive] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  /** Nearest work while walking — drives the dot rail's active state. */
  const [railIdx, setRailIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const api = useRef<{
    approach: (i: number | null) => void;
    turnOn: (i: number) => void;
    turnOff: () => void;
    dispose: () => void;
  } | null>(null);

  // ——— Capability gate (runs once, before three is even fetched) ———
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as any).connection;
    const thin = Boolean(
      conn &&
        (conn.saveData || /(^|-)(2g|slow-2g|3g)$/.test(String(conn.effectiveType || ""))),
    );
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = document.createElement("canvas").getContext("webgl");
    } catch {
      gl = null;
    }
    setCapable(Boolean(gl) && !reduced && !thin);
  }, []);

  // ——— Scene ———
  useEffect(() => {
    if (!capable || !stageRef.current || !wrapRef.current) return;
    let disposed = false;
    let raf = 0;
    let running = true;

    const stage = stageRef.current;
    const wrap = wrapRef.current;

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(stage.clientWidth, stage.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      stage.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.display = "block";

      const scene = new THREE.Scene();
      const GROUND = new THREE.Color("#1d1411");
      const WALL = new THREE.Color("#2f1d14");
      const FLOOR = new THREE.Color("#1a110c");
      scene.background = GROUND;
      scene.fog = new THREE.Fog(GROUND, 10, 40);

      /* A phone corridor is narrower — on the desktop width the art hung at
         the extreme edges of a portrait frame and the centre of the walk was
         void (juror P1-6). */
      const portrait = stage.clientWidth < stage.clientHeight;
      const CH = portrait ? 2.4 : CORRIDOR_HALF;

      /* A portrait phone sees a sliver of corridor at 58° — widen the eye so
         the canvases still command the frame. */
      const fovFor = () => (stage.clientWidth < stage.clientHeight ? 72 : 58);
      const camera = new THREE.PerspectiveCamera(
        fovFor(),
        stage.clientWidth / stage.clientHeight,
        0.1,
        60,
      );

      const hallLen = works.length * SPACING + 14;
      /* A phone's tall frame showed mostly ceiling void — bring the roof
         down and the room fills the format (juror P1-4, pass 2). */
      const CEIL_Y = portrait ? 3.2 : 4.2;

      // ——— The hall. Walls carry a baked vertical light gradient (lit at
      // picture height, falling to dark at floor and ceiling) so the room
      // has a light MODEL, not just sprites (juror P1-3). Fog does depth. ———
      const mat = (c: Color) => new THREE.MeshBasicMaterial({ color: c });
      const wallGradCanvas = document.createElement("canvas");
      wallGradCanvas.width = 2;
      wallGradCanvas.height = 256;
      {
        const g = wallGradCanvas.getContext("2d")!;
        const lg = g.createLinearGradient(0, 0, 0, 256); // top → bottom
        lg.addColorStop(0, "#221510");
        lg.addColorStop(0.45, "#3a241a"); // picture-height glow
        lg.addColorStop(0.68, "#2c1b12");
        lg.addColorStop(1, "#20130d");
        g.fillStyle = lg;
        g.fillRect(0, 0, 2, 256);
      }
      const wallTex = new THREE.CanvasTexture(wallGradCanvas);
      wallTex.colorSpace = THREE.SRGBColorSpace;
      const wallMat = new THREE.MeshBasicMaterial({ map: wallTex });

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(CH * 2 + 2, hallLen + 20),
        mat(FLOOR),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, 0, -hallLen / 2 + 6);
      scene.add(floor);
      const ceil = new THREE.Mesh(
        new THREE.PlaneGeometry(CH * 2 + 2, hallLen + 20),
        mat(new THREE.Color("#150d09")),
      );
      ceil.rotation.x = Math.PI / 2;
      ceil.position.set(0, CEIL_Y, -hallLen / 2 + 6);
      scene.add(ceil);
      for (const side of [-1, 1]) {
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(hallLen + 20, CEIL_Y), wallMat);
        wall.rotation.y = (Math.PI / 2) * side;
        wall.position.set(CH * -side, CEIL_Y / 2, -hallLen / 2 + 6);
        scene.add(wall);
      }
      // The far end wall closes the room
      const end = new THREE.Mesh(new THREE.PlaneGeometry(CH * 2 + 2, CEIL_Y + 0.2), wallMat);
      end.position.set(0, CEIL_Y / 2, -(works.length * SPACING) - 8);
      scene.add(end);

      /* The far-end draw: a warm glow at the end of the hall so the walk is
         pulled forward by LIGHT, not by UI copy (juror: "no destination
         cue"). It sits beyond the last canvas, inside the fog. */
      const drawCanvas = document.createElement("canvas");
      drawCanvas.width = drawCanvas.height = 128;
      {
        const g = drawCanvas.getContext("2d")!;
        const rg = g.createRadialGradient(64, 64, 4, 64, 64, 64);
        rg.addColorStop(0, "rgba(255, 190, 130, 0.5)");
        rg.addColorStop(1, "rgba(255, 190, 130, 0)");
        g.fillStyle = rg;
        g.fillRect(0, 0, 128, 128);
      }
      const drawTex = new THREE.CanvasTexture(drawCanvas);
      const drawGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 4),
        new THREE.MeshBasicMaterial({ map: drawTex, transparent: true, depthWrite: false, fog: false }),
      );
      drawGlow.position.set(0, 1.7, -(works.length * SPACING) - 7.8);
      scene.add(drawGlow);

      // Skirting hairlines — the one linework the hall allows itself. Quiet
      // enough to obey the fog (juror P2-9).
      const skirtMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#4a2416") });
      for (const side of [-1, 1]) {
        const skirt = new THREE.Mesh(new THREE.PlaneGeometry(hallLen + 20, 0.06), skirtMat);
        skirt.rotation.y = (Math.PI / 2) * side;
        skirt.position.set((CH - 0.005) * -side, 0.09, -hallLen / 2 + 6);
        scene.add(skirt);
      }

      // Radial "spotlight pool" sprite, shared by every canvas.
      const poolCanvas = document.createElement("canvas");
      poolCanvas.width = poolCanvas.height = 256;
      const pctx = poolCanvas.getContext("2d")!;
      const grad = pctx.createRadialGradient(128, 128, 8, 128, 128, 128);
      grad.addColorStop(0, "rgba(255, 220, 180, 0.36)");
      grad.addColorStop(0.5, "rgba(255, 200, 150, 0.1)");
      grad.addColorStop(1, "rgba(255, 200, 150, 0)");
      pctx.fillStyle = grad;
      pctx.fillRect(0, 0, 256, 256);
      const poolTex = new THREE.CanvasTexture(poolCanvas);
      const poolMat = new THREE.MeshBasicMaterial({
        map: poolTex,
        transparent: true,
        depthWrite: false,
      });
      /* Floor echoes run dimmer than wall pools — light that has travelled. */
      const floorPoolMat = new THREE.MeshBasicMaterial({
        map: poolTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      });
      const fixtureMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#0d0805") });
      /* The beam: a vertical wash from fixture toward the canvas. */
      const beamCanvas = document.createElement("canvas");
      beamCanvas.width = 64;
      beamCanvas.height = 256;
      {
        const g = beamCanvas.getContext("2d")!;
        const lg = g.createLinearGradient(0, 0, 0, 256);
        lg.addColorStop(0, "rgba(255, 205, 155, 0.14)");
        lg.addColorStop(1, "rgba(255, 205, 155, 0)");
        g.fillStyle = lg;
        // taper: narrow at top, wide at bottom
        g.beginPath();
        g.moveTo(24, 0);
        g.lineTo(40, 0);
        g.lineTo(64, 256);
        g.lineTo(0, 256);
        g.closePath();
        g.clip();
        g.fillRect(0, 0, 64, 256);
      }
      const beamTex = new THREE.CanvasTexture(beamCanvas);
      const beamMat = new THREE.MeshBasicMaterial({
        map: beamTex,
        transparent: true,
        depthWrite: false,
      });

      // ——— The works ———
      const loader = new THREE.TextureLoader();
      const isPhone = window.innerWidth < 1024;
      /* Oblique canvases blur without anisotropic filtering (juror P1-3). */
      const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const paintingMeshes: Mesh[] = [];
      const paintingMats: MeshBasicMaterial[] = [];
      const videoEls: (HTMLVideoElement | null)[] = works.map(() => null);
      const loadedFlags: boolean[] = works.map(() => false);

      const frameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#80412b") });
      const frameBackMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#100a06") });

      type Placement = {
        pos: { x: number; y: number; z: number };
        side: number;
        w: number;
        h: number;
      };
      const placements: Placement[] = [];

      works.forEach((work, i) => {
        const side = i % 2 === 0 ? 1 : -1; // 1 = right wall
        const z = -(i + 1) * SPACING;
        const h = 2.0;
        const w = h * work.aspect;
        const x = (CH - 0.09) * side;
        placements.push({ pos: { x, y: 1.7, z }, side, w, h });

        // Frame: a slab slightly proud of the wall, canvas on its face.
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.12, h + 0.22, w + 0.22), frameMat);
        frame.rotation.y = 0;
        frame.position.set((CH + 0.02) * side, 1.7, z);
        frame.rotation.z = 0;
        // orient the box's long axes along the wall
        frame.rotation.y = side === 1 ? 0 : Math.PI;
        scene.add(frame);
        const inner = new THREE.Mesh(new THREE.BoxGeometry(0.13, h + 0.08, w + 0.08), frameBackMat);
        inner.position.copy(frame.position);
        inner.rotation.copy(frame.rotation);
        inner.position.x -= 0.012 * side;
        scene.add(inner);

        // Canvas — ground-colored until its texture arrives.
        const cmat = new THREE.MeshBasicMaterial({ color: WALL.clone() });
        const canvasMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), cmat);
        canvasMesh.position.set(x - 0.005 * side, 1.7, z);
        canvasMesh.rotation.y = (-Math.PI / 2) * side;
        canvasMesh.userData.workIndex = i;
        scene.add(canvasMesh);
        paintingMeshes.push(canvasMesh);
        paintingMats.push(cmat);

        // Spotlight pool behind the canvas, and its echo on the floor —
        // light lands somewhere, so the room believes it.
        const pool = new THREE.Mesh(new THREE.PlaneGeometry(w * 2.2, h * 2.2), poolMat);
        pool.position.set((CH - 0.03) * side, 1.85, z);
        pool.rotation.y = (-Math.PI / 2) * side;
        scene.add(pool);
        const fpool = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, 1.6), floorPoolMat);
        fpool.rotation.x = -Math.PI / 2;
        fpool.rotation.z = Math.PI / 2;
        fpool.position.set((CH - 0.9) * side, 0.012, z);
        scene.add(fpool);

        /* The fixture and its beam — the story of where the light comes
           from. A small dark track head at the ceiling and a soft cone
           washing down to the canvas top. */
        const head = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.07, 0.16, 10),
          fixtureMat,
        );
        head.position.set((CH - 0.55) * side, CEIL_Y - 0.12, z);
        head.rotation.z = 0.5 * side;
        scene.add(head);
        const beamH = CEIL_Y - (1.7 + h / 2) + 0.35;
        const beam = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, beamH), beamMat);
        beam.position.set((CH - 0.28) * side, CEIL_Y - beamH / 2 - 0.05, z);
        beam.rotation.y = (-Math.PI / 2) * side;
        beam.rotation.x = 0;
        scene.add(beam);

        // The study beside its painting
        if (work.sketch) {
          const sh = 0.85;
          const sw = sh * 1.45;
          const sz = z + (w / 2 + sw / 2 + 0.7);
          const sframe = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, sh + 0.14, sw + 0.14),
            frameMat,
          );
          sframe.position.set((CH + 0.03) * side, 1.55, sz);
          sframe.rotation.y = side === 1 ? 0 : Math.PI;
          scene.add(sframe);
          const smat = new THREE.MeshBasicMaterial({ color: WALL.clone() });
          const smesh = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), smat);
          smesh.position.set((CH - 0.045) * side, 1.55, sz);
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

      const loadWork = (i: number) => {
        if (loadedFlags[i]) return;
        loadedFlags[i] = true;
        loader.load(isPhone ? works[i].tex800 : works[i].tex1440, (t) => {
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
      /* Juror P0-2: a half-loaded hall reads as a broken one. The gate
         already excludes thin pipes, so after the first breath the whole
         catalogue loads — nearest-first stays only for the first second. */
      setTimeout(() => {
        if (!disposed) works.forEach((_, i) => loadWork(i));
      }, 1200);

      // ——— Rail + look state ———
      let railT = 0; // 0..1 scroll progress
      let camZ = 2.5;
      let lookYaw = 0;
      let lookPitch = 0;
      let dragYaw = 0;
      let dragPitch = 0;
      // Approach state
      let mode: "rail" | "approach" = "rail";
      let target = { x: 0, y: EYE, z: camZ, yaw: 0, pitch: 0 };
      const cur = { x: 0, y: EYE, z: camZ, yaw: 0, pitch: 0 };

      /* Start close to the first canvas — the opening frame must sell the
         room, not nine metres of fog (juror: "first-paint darkness"). */
      const railZ = () => 0.2 - railT * (works.length * SPACING - 2.8);

      let lastRailIdx = -1;
      const onScroll = () => {
        const r = wrap.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        railT = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
        /* Camera z = 0.2 − railT·(n·S − 2.8); painting i sits at −(i+1)·S,
           so the nearest work is round(−z/S) − 1. */
        const idx = Math.min(
          works.length - 1,
          Math.max(
            0,
            Math.round((railT * (works.length * SPACING - 2.8) - 0.2) / SPACING) - 1,
          ),
        );
        if (idx !== lastRailIdx) {
          lastRailIdx = idx;
          setRailIdx(idx);
        }
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      // Drag = clamped look
      let dragging = false;
      let px = 0;
      let py = 0;
      const down = (e: PointerEvent) => {
        dragging = true;
        px = e.clientX;
        py = e.clientY;
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        dragYaw = Math.max(-0.6, Math.min(0.6, dragYaw + (e.clientX - px) * 0.003));
        dragPitch = Math.max(-0.3, Math.min(0.3, dragPitch + (e.clientY - py) * 0.002));
        px = e.clientX;
        py = e.clientY;
      };
      const up = () => {
        dragging = false;
      };
      renderer.domElement.addEventListener("pointerdown", down);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);

      // Tap → approach
      const ray = new THREE.Raycaster();
      const clickAt = (e: MouseEvent) => {
        if (mode === "approach") return;
        const rect = renderer.domElement.getBoundingClientRect();
        const ndc = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(paintingMeshes)[0];
        if (hit) approach(hit.object.userData.workIndex as number);
      };
      let downAt = 0;
      renderer.domElement.addEventListener("pointerdown", () => (downAt = Date.now()));
      renderer.domElement.addEventListener("click", (e) => {
        // a drag is not a tap
        if (Date.now() - downAt < 250) clickAt(e);
      });

      const approach = (i: number | null) => {
        if (i === null) {
          mode = "rail";
          setApproached(null);
          turnOff();
          return;
        }
        loadWork(i);
        const p = placements[i];
        mode = "approach";
        /* Composition, not just fit. Landscape reserves a left column for
           the plaque (the plaque NEVER sits on the art) and hangs the whole
           canvas in the remaining field; portrait centres the canvas above
           the plaque. Yaw −π/2·side turns the camera INTO the wall (three's
           yaw is counter-clockwise: +π/2 faces −x). */
        const vfov = (camera.fov * Math.PI) / 180;
        const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
        const landscape = stage.clientWidth > stage.clientHeight;
        let dist: number;
        let lateral = 0;
        let yOff = 0;
        if (landscape) {
          const COLUMN = 0.44; // plaque column fraction, incl. breathing room
          const FIELD = 0.5; // canvas field fraction
          dist = Math.min(
            6,
            Math.max(
              p.w / (2 * Math.tan(hfov / 2) * FIELD),
              p.h / (2 * Math.tan(vfov / 2) * 0.62),
            ),
          );
          const centerFrac = COLUMN + FIELD / 2; // canvas centre in [0..1] of the frame
          lateral = (centerFrac - 0.5) * 2 * dist * Math.tan(hfov / 2);
          yOff = -0.1; // lift the canvas clear of the plaque's top edge
        } else {
          dist = Math.min(
            6,
            Math.max(
              (p.w / 2) / Math.tan(hfov / 2),
              (p.h / 2) / Math.tan(vfov / 2),
            ) *
              1.18 +
              0.15,
          );
          /* Portrait: the plaque owns the bottom third, so the canvas rises
             into the field above it instead of hiding a corner behind it. */
          yOff = -0.3;
        }
        target = {
          x: p.pos.x - p.side * dist,
          y: p.pos.y + yOff,
          z: p.pos.z - lateral * p.side,
          yaw: (-Math.PI / 2) * p.side,
          pitch: 0,
        };
        dragYaw = 0;
        dragPitch = 0;
        setApproached(i);
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
        v.crossOrigin = "anonymous";
        const vt = new THREE.VideoTexture(v);
        vt.colorSpace = THREE.SRGBColorSpace;
        /* Cover-fit: the film's aspect rarely equals the canvas plane's —
           unfitted it stretched, so the swap visibly zoom-jumped (P2-13). */
        v.addEventListener(
          "loadedmetadata",
          () => {
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
        v.play().catch(() => {});
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
            videoEls[i] = null;
            // restore the still
            loadedFlags[i] = false;
            loadWork(i);
          }
        });
        setAlive(null);
      };

      // ——— Frame loop ———
      let lastT = performance.now();
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!running) return;
        const now = performance.now();
        const dt = Math.min((now - lastT) / 1000, 0.05);
        lastT = now;
        const k = 1 - Math.pow(0.0018, dt); // critically-damped-ish lerp

        if (mode === "rail") {
          target = { x: 0, y: EYE, z: railZ(), yaw: 0, pitch: 0 };
          // near-canvas load look-ahead
          const idx = Math.min(
            works.length - 1,
            Math.max(0, Math.round(-target.z / SPACING) ),
          );
          loadWork(idx);
          if (idx + 1 < works.length) loadWork(idx + 1);
        }
        cur.x += (target.x - cur.x) * k;
        cur.y += (target.y - cur.y) * k;
        cur.z += (target.z - cur.z) * k;
        lookYaw += (target.yaw + dragYaw - lookYaw) * k;
        lookPitch += (target.pitch + dragPitch - lookPitch) * k;

        camera.position.set(cur.x, cur.y, cur.z);
        camera.rotation.set(lookPitch, lookYaw + Math.PI * 0, 0, "YXZ");
        // face down the corridor: base forward is -z, yaw rotates
        camera.rotation.y = lookYaw;
        renderer.render(scene, camera);
      };
      tick();
      setReady(true);

      // Pause when offscreen / hidden
      const io = new IntersectionObserver(([e]) => {
        running = e.isIntersecting;
      });
      io.observe(stage);
      const onVis = () => {
        running = !document.hidden && running;
        if (!document.hidden) running = true;
      };
      document.addEventListener("visibilitychange", onVis);

      const onResize = () => {
        renderer.setSize(stage.clientWidth, stage.clientHeight);
        camera.aspect = stage.clientWidth / stage.clientHeight;
        camera.fov = fovFor();
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      // Context loss → fall back to the grid
      renderer.domElement.addEventListener("webglcontextlost", () => {
        setCapable(false);
      });

      api.current = {
        approach,
        turnOn,
        turnOff,
        dispose: () => {
          disposed = true;
          cancelAnimationFrame(raf);
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          window.removeEventListener("resize", onResize);
          document.removeEventListener("visibilitychange", onVis);
          io.disconnect();
          turnOff();
          renderer.dispose();
          scene.traverse((o: any) => {
            o.geometry?.dispose?.();
            const m = o.material;
            if (m) {
              (Array.isArray(m) ? m : [m]).forEach((mm: any) => {
                mm.map?.dispose?.();
                mm.dispose?.();
              });
            }
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

  // Esc returns to the rail
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && approached !== null) api.current?.approach(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [approached]);

  if (!capable) return null;

  const plaque = approached !== null ? works[approached] : null;

  return (
    <div ref={wrapRef} style={{ height: `${(works.length + 1) * 100}vh` }} className="relative">
      <div ref={stageRef} className="sticky top-0 h-dvh w-full overflow-hidden bg-primary-2">
        {/* Wayfinding line — contextual: never instructs a state you left */}
        {ready && (
          <div className="pointer-events-none absolute inset-x-0 top-[max(env(safe-area-inset-top),24px)] z-10 text-center">
            <p
              className="t-meta inline-block rounded-full px-4 py-2"
              style={{ background: "color-mix(in srgb, var(--color-primary-2) 72%, transparent)" }}
            >
              {approached !== null ? (
                window.matchMedia("(pointer: coarse)").matches ? (
                  "Back returns to the hall"
                ) : (
                  "Esc or Back returns to the hall"
                )
              ) : (
                <>
                  <span className="hidden sm:inline">The Museum · scroll to walk · tap a painting</span>
                  <span className="sm:hidden">Scroll to walk · tap a work</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Touch skip — small, clear of the hint pill (its own row, phones only) */}
        {ready && approached === null && (
          <div className="absolute top-[calc(max(env(safe-area-inset-top),24px)+44px)] right-[var(--gutter)] z-10 sm:hidden">
            <button
              type="button"
              className="t-meta cursor-pointer rounded-full px-3 py-1.5"
              style={{ background: "color-mix(in srgb, var(--color-primary-2) 72%, transparent)" }}
              onClick={() => {
                const r = wrapRef.current?.getBoundingClientRect();
                if (r) window.scrollTo({ top: window.scrollY + r.bottom, behavior: "smooth" });
              }}
            >
              Skip ↓
            </button>
          </div>
        )}
        {/* The quiet exit: the index of works is one press away. sm+ only —
            on a phone it collided with the hint pill, and a flick already
            exits in a breath. The wrapper carries the visibility: `.link-meta`
            sets display and out-cascades a bare `hidden` utility. */}
        {ready && approached === null && (
          <div className="absolute top-[max(env(safe-area-inset-top),24px)] right-[var(--gutter)] z-10 hidden sm:block">
            <button
              type="button"
              className="link-meta t-meta rounded-full px-4 py-2"
              style={{ background: "color-mix(in srgb, var(--color-primary-2) 72%, transparent)" }}
              onClick={() => {
                const r = wrapRef.current?.getBoundingClientRect();
                if (r) window.scrollTo({ top: window.scrollY + r.bottom, behavior: "smooth" });
              }}
            >
              Skip the hall
            </button>
          </div>
        )}

        {/* The plaque */}
        {plaque && (
          <div className="absolute inset-x-0 bottom-0 z-10">
            <div className="shell pb-[max(4dvh,24px)]">
              <div
                className="max-w-[46ch] rounded-[12px] border border-primary-7 p-6"
                style={{ background: "color-mix(in srgb, var(--color-primary-2) 88%, transparent)" }}
              >
                <p className="t-meta">
                  Mark Priest<span className="hidden sm:inline"> · Nalle Series</span> · Chapter{" "}
                  {plaque.order}
                </p>
                <p className="t-title-sm mt-3">{plaque.title}</p>
                {plaque.line && (
                  <p className="t-meta-body mt-4 italic">
                    “{plaque.line}”{plaque.lineBy ? ` — ${plaque.lineBy}` : ""}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {plaque.video && (
                    <button
                      type="button"
                      className="btn-sm btn-solid"
                      onClick={() =>
                        alive === approached
                          ? api.current?.turnOff()
                          : api.current?.turnOn(approached!)
                      }
                    >
                      {alive === approached ? "Let it rest" : "Bring it to life"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-sm btn-ghost"
                    onClick={() => api.current?.approach(null)}
                  >
                    Back to the hall
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard path + wayfinding: real buttons, one per work, the
            nearest one lit, the count said out loud. */}
        {ready && !plaque && (
          <nav
            className="absolute bottom-[max(3dvh,16px)] left-1/2 z-10 flex -translate-x-1/2 items-center gap-4"
            aria-label="Works in the hall"
          >
            <p className="t-meta hidden whitespace-nowrap sm:block" aria-hidden="true">
              {String(railIdx + 1).padStart(2, "0")} / {String(works.length).padStart(2, "0")}
            </p>
            <ol className="flex items-center gap-2">
              {works.map((w, i) => (
                <li key={w.slug + w.key}>
                  <button
                    type="button"
                    onClick={() => api.current?.approach(i)}
                    aria-label={`Approach “${w.title}”`}
                    aria-current={i === railIdx ? "true" : undefined}
                    className={`grid h-6 w-6 cursor-pointer place-items-center rounded-full border transition-colors ${
                      i === railIdx ? "border-primary-9" : "border-primary-7 hover:border-primary-9"
                    }`}
                    style={{ background: "color-mix(in srgb, var(--color-primary-2) 72%, transparent)" }}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${i === railIdx ? "bg-primary-9" : "bg-primary-11/60"}`}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </div>
  );
}
