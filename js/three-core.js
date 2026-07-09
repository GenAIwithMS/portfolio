/* =====================================================================
   THREE-CORE — About section "neural core" (cursor-reactive)
   ===================================================================== */
import * as THREE from "three";

(() => {
  const canvas = document.getElementById("coreCanvas");
  if (!canvas) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 5;

  const group = new THREE.Group();
  scene.add(group);

  // outer wireframe icosahedron
  const outerGeo = new THREE.IcosahedronGeometry(1.7, 1);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0xc6f24e,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const outer = new THREE.Mesh(outerGeo, outerMat);
  group.add(outer);

  // inner solid-ish icosahedron
  const innerGeo = new THREE.IcosahedronGeometry(0.9, 0);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xc6f24e,
    transparent: true,
    opacity: 0.08,
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  group.add(inner);

  // vertices (points) on the outer mesh for a "node" feel
  const nodeMat = new THREE.PointsMaterial({
    color: 0xc6f24e,
    size: 0.12,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: dotTexture(),
  });
  const nodes = new THREE.Points(outerGeo, nodeMat);
  group.add(nodes);

  // a few orbiting electrons
  const electronGeo = new THREE.SphereGeometry(0.05, 12, 12);
  const electronMat = new THREE.MeshBasicMaterial({ color: 0xff7a45 });
  const electrons = [];
  for (let i = 0; i < 3; i++) {
    const e = new THREE.Mesh(electronGeo, electronMat);
    e.userData = {
      radius: 1.9 + i * 0.25,
      speed: 0.6 + i * 0.3,
      tilt: (i / 3) * Math.PI,
      offset: i * 2.1,
    };
    electrons.push(e);
    group.add(e);
  }

  // cursor
  let tx = 0,
    ty = 0,
    rx = 0,
    ry = 0,
    pointerActive = false;
  const wrap = canvas.parentElement;
  const zone = document.getElementById("about") || wrap;
  zone.addEventListener("mousemove", (e) => {
    const r = wrap.getBoundingClientRect();
    tx = (e.clientX - (r.left + r.width / 2)) / (r.width * 0.6);
    ty = (e.clientY - (r.top + r.height / 2)) / (r.height * 0.6);
    ry = tx * 1.15;
    rx = -ty * 1.15;
    pointerActive = true;
  });
  zone.addEventListener("mouseleave", () => {
    rx = 0;
    ry = 0;
    pointerActive = false;
  });

  function resize() {
    const w = canvas.clientWidth || 300;
    const h = canvas.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    // ease toward cursor
    group.rotation.x += (rx - group.rotation.x) * 0.1;
    group.rotation.y += (ry - group.rotation.y) * 0.1;
    // idle drift
    group.rotation.y += 0.003;
    outer.rotation.z = t * 0.15;
    inner.rotation.x = -t * 0.2;
    inner.rotation.y = t * 0.25;

    electrons.forEach((e) => {
      const u = e.userData;
      const a = t * u.speed * (pointerActive ? 1.9 : 1) + u.offset;
      e.position.x = Math.cos(a) * u.radius;
      e.position.y = Math.sin(a) * u.radius * Math.cos(u.tilt);
      e.position.z = Math.sin(a) * u.radius * Math.sin(u.tilt);
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function dotTexture() {
    const size = 32;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  if (reduce) {
    renderer.render(scene, camera);
  } else {
    animate();
  }
})();
