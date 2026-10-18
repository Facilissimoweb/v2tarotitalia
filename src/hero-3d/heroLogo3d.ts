/**
 * Logo 3D Hero — moneta nativa Three.js (nessun GLB).
 * Cilindro geometrico + PNG ufficiale in faccia; retro e bordo neri.
 * Spin Y in ingresso, posa 3D stabile, zero hover.
 */
import {
  AmbientLight,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  SpotLight,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  WebGLRenderer,
} from "three";

export type HeroLogo3DOptions = {
  textureUrl?: string;
  spinTurns?: number;
  enterMs?: number;
  restPitch?: number;
  restYaw?: number;
};

export type HeroLogo3DHandle = {
  destroy: () => void;
};

const DEFAULTS: Required<HeroLogo3DOptions> = {
  textureUrl: "/logo-hero.png",
  spinTurns: 2.25,
  enterMs: 2600,
  // Faccia frontale e dritta; volume solo dallo spessore della moneta.
  restPitch: 0,
  restYaw: 0,
};

const SPIN_ONLY_UNTIL = 0.65;
const HOST_TOKEN = "__heroLogo3dToken";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeOutQuint(t: number) {
  return 1 - (1 - t) ** 5;
}

/**
 * Angoli neri del PNG (fuori dal sigillo circolare) → ivory.
 * L’inchiostro nero DENTRO il cerchio resta intatto.
 */
function ivoryOutsideSeal(source: Texture): CanvasTexture {
  const img = source.image as HTMLImageElement | ImageBitmap | HTMLCanvasElement;
  const w = Math.max(1, Number(("width" in img && img.width) || 1));
  const h = Math.max(1, Number(("height" in img && img.height) || 1));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img as CanvasImageSource, 0, 0);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  const cx = (w - 1) * 0.5;
  const cy = (h - 1) * 0.5;
  // Fuori dal disco del sigillo: ivory. Dentro: grafica originale (inchiostro incluso).
  const r2 = (Math.min(w, h) * 0.5 * 0.985) ** 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) continue;
      const i = (y * w + x) * 4;
      px[i] = 249;
      px[i + 1] = 248;
      px[i + 2] = 246;
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(data, 0, 0);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 16;
  tex.flipY = true;
  tex.needsUpdate = true;
  source.dispose();
  return tex;
}

async function loadFaceTexture(url: string) {
  const tryUrls = [url, "/logo-hero.png", "/logo.png"];
  let lastError: unknown;
  for (const candidate of tryUrls) {
    try {
      const raw = await new TextureLoader().loadAsync(candidate);
      return ivoryOutsideSeal(raw);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Logo texture unavailable");
}

export async function mountHeroLogo3D(
  container: HTMLElement,
  options: HeroLogo3DOptions = {},
): Promise<HeroLogo3DHandle> {
  const opts = { ...DEFAULTS, ...options };
  const reduced = prefersReducedMotion();
  const token = Symbol("hero-logo-3d");
  (container as HTMLElement & { [HOST_TOKEN]?: symbol })[HOST_TOKEN] = token;

  const isActive = () =>
    (container as HTMLElement & { [HOST_TOKEN]?: symbol })[HOST_TOKEN] === token;

  container.classList.add("hero-logo-3d", "is-loading");
  container.replaceChildren();

  const canvas = document.createElement("canvas");
  canvas.className = "hero-logo-3d__canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.pointerEvents = "none";
  container.appendChild(canvas);

  const scene = new Scene();
  scene.background = null;

  // Ortografica con margine: raggio mesh = 1 → frustum 1.28 evita i poli tagliati.
  const frustum = 1.28;
  const camera = new OrthographicCamera(-frustum, frustum, frustum, -frustum, 0.1, 40);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = false;

  // Illuminazione calda Lumiere: volume sul bordo, logo nitido.
  const hemi = new HemisphereLight(0xfff8f0, 0x8a857c, 0.9);
  const ambient = new AmbientLight(0xffffff, 0.62);
  const key = new DirectionalLight(0xfff5ea, 2.15);
  key.position.set(-2.2, 3.4, 3.2);
  const fill = new DirectionalLight(new Color("#e4ebe0"), 0.75);
  fill.position.set(2.6, 0.4, 2.0);
  const rim = new DirectionalLight(0xffffff, 1.2);
  rim.position.set(1.8, 1.8, -2.6);
  const spot = new SpotLight(0xffffff, 1.15, 14, Math.PI / 4.8, 0.42, 1);
  spot.position.set(-1.1, 2.7, 3.2);
  spot.target.position.set(0, 0, 0);
  scene.add(hemi, ambient, key, fill, rim, spot, spot.target);

  const spinY = new Group();
  const pose = new Group();
  spinY.add(pose);
  scene.add(spinY);

  const faceMap = await loadFaceTexture(opts.textureUrl);
  if (!isActive()) {
    faceMap.dispose();
    renderer.dispose();
    return { destroy: () => undefined };
  }

  // Moneta: tanti segmenti = bordo liscio; spessore da medaglia.
  const geometry = new CylinderGeometry(1, 1, 0.14, 128, 1, false);
  geometry.rotateX(Math.PI / 2);
  geometry.center();

  const faceMat = new MeshStandardMaterial({
    map: faceMap,
    color: 0xffffff,
    metalness: 0.08,
    roughness: 0.42,
    side: DoubleSide,
  });
  const blackMat = new MeshStandardMaterial({
    color: 0x1a1614,
    metalness: 0.35,
    roughness: 0.38,
    side: DoubleSide,
  });

  // groups: 0 = side, 1 = top (+Z dopo rotateX), 2 = bottom
  const mesh = new Mesh(geometry, [blackMat, faceMat, blackMat]);
  // Raddrizza: TAROT ITALIA in alto (livello EST—2012 orizzontale).
  mesh.rotation.z = Math.PI / 2 + 0.02;
  mesh.scale.setScalar(1);
  pose.add(mesh);

  if (reduced) {
    spinY.rotation.set(0, 0, 0);
    pose.rotation.set(opts.restPitch, opts.restYaw, 0);
  } else {
    spinY.rotation.set(0, 0, 0);
    pose.rotation.set(0, 0, 0);
  }

  container.classList.remove("is-loading");

  let raf = 0;
  let running = true;
  let enterStart = 0;
  const spinRadians = -opts.spinTurns * Math.PI * 2;

  const resize = () => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    const aspect = width / height;
    if (aspect >= 1) {
      camera.left = -frustum * aspect;
      camera.right = frustum * aspect;
      camera.top = frustum;
      camera.bottom = -frustum;
    } else {
      camera.left = -frustum;
      camera.right = frustum;
      camera.top = frustum / aspect;
      camera.bottom = -frustum / aspect;
    }
    camera.updateProjectionMatrix();
  };

  window.addEventListener("resize", resize);
  resize();

  const applyPose = (enterT: number) => {
    const t = Math.min(1, enterT);
    const spinEased = t * 0.4 + easeOutQuint(t) * 0.6;
    spinY.rotation.set(0, spinRadians * (1 - spinEased), 0);

    const poseRaw = Math.max(0, (t - SPIN_ONLY_UNTIL) / (1 - SPIN_ONLY_UNTIL));
    const poseEased = easeOutCubic(Math.min(1, poseRaw));
    pose.rotation.set(opts.restPitch * poseEased, opts.restYaw * poseEased, 0);
  };

  const tick = (now: number) => {
    if (!running) return;
    if (!enterStart) enterStart = now;
    if (!reduced) applyPose(Math.min(1, (now - enterStart) / opts.enterMs));
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  if (!reduced) applyPose(0);
  else renderer.render(scene, camera);
  raf = requestAnimationFrame(tick);

  return {
    destroy: () => {
      if (!isActive()) return;
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      faceMat.dispose();
      blackMat.dispose();
      faceMap.dispose();
      renderer.dispose();
      container.replaceChildren();
      container.classList.remove("hero-logo-3d", "is-loading");
      delete (container as HTMLElement & { [HOST_TOKEN]?: symbol })[HOST_TOKEN];
    },
  };
}
