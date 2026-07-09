/* =====================================================================
   THREE-HERO — cursor-reactive neural particle network
   ===================================================================== */
import * as THREE from "three";

(() => {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 14;

  // ---- particles ----
  const COUNT = window.innerWidth < 768 ? 90 : 150;
  const SPREAD = 16;
  const positions = new Float32Array(COUNT * 3);
  const velocities = new Float32Array(COUNT * 3);
  const basePos = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * SPREAD;
    positions[i3 + 1] = (Math.random() - 0.5) * SPREAD * 0.7;
    positions[i3 + 2] = (Math.random() - 0.5) * SPREAD * 0.6;
    basePos[i3] = positions[i3];
    basePos[i3 + 1] = positions[i3 + 1];
    basePos[i3 + 2] = positions[i3 + 2];
  }

  const pointGeo = new THREE.BufferGeometry();
  pointGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  // soft round point sprite
  const pointMat = new THREE.PointsMaterial({
    size: 0.13,
    color: 0xc6f24e,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: makeDotTexture(),
  });

  const points = new THREE.Points(pointGeo, pointMat);
  scene.add(points);

  // ---- connection lines (pooled) ----
  const MAX_LINES = COUNT * 6;
  const linePos = new Float32Array(MAX_LINES * 6); // 2 verts * 3
  const lineCol = new Float32Array(MAX_LINES * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  const LINK_DIST = 2.6;
  const LINK_DIST2 = LINK_DIST * LINK_DIST;

  // ---- cursor (in 3D space) ----
  const mouse = new THREE.Vector2(0, 0);
  const mouseWorld = new THREE.Vector3(0, 0, 0);
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const tmp = new THREE.Vector3();

  // glowing marker that tracks the cursor inside the 3D scene
  const cursorDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xff7a45,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  cursorDot.visible = false;
  scene.add(cursorDot);

  let targetRotX = 0,
    targetRotY = 0;
  let rotX = 0,
    rotY = 0;

  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    ray.setFromCamera(mouse, camera);
    ray.ray.intersectPlane(plane, tmp);
    mouseWorld.copy(tmp);
    cursorDot.position.copy(mouseWorld);
    cursorDot.visible = true;
    targetRotY = mouse.x * 0.35;
    targetRotX = -mouse.y * 0.26;
  });
  window.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget) cursorDot.visible = false;
  });

  // touch support
  window.addEventListener("touchmove", (e) => {
    if (!e.touches[0]) return;
    mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((e.touches[0].clientY / window.innerHeight) * 2 - 1);
    targetRotY = mouse.x * 0.35;
    targetRotX = -mouse.y * 0.26;
  }, { passive: true });

  const MOUSE_R = 4.2;
  const MOUSE_R2 = MOUSE_R * MOUSE_R;
  const colA = new THREE.Color(0xc6f24e);
  const colB = new THREE.Color(0xff7a45);
  const colWhite = new THREE.Color(0xffffff);

  // ---- resize ----
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // ---- animate ----
  const clock = new THREE.Clock();
  let lineCount = 0;

  function animate() {
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05);

    // float + mouse repulsion
    const pos = pointGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      // gentle float
      pos[i3] = basePos[i3] + Math.sin(t * 0.4 + i) * 0.18;
      pos[i3 + 1] = basePos[i3 + 1] + Math.cos(t * 0.3 + i * 1.3) * 0.18;
      pos[i3 + 2] = basePos[i3 + 2] + Math.sin(t * 0.5 + i * 0.7) * 0.12;

      // mouse repulsion (in plane z=0)
      const dx = pos[i3] - mouseWorld.x;
      const dy = pos[i3 + 1] - mouseWorld.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_R2) {
        const d = Math.sqrt(d2) + 0.0001;
        const force = (1 - d / MOUSE_R) * 0.85;
        pos[i3] += (dx / d) * force;
        pos[i3 + 1] += (dy / d) * force;
      }
    }
    pointGeo.attributes.position.needsUpdate = true;

    // build connections
    lineCount = 0;
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const ix = pos[i3],
        iy = pos[i3 + 1],
        iz = pos[i3 + 2];
      for (let j = i + 1; j < COUNT; j++) {
        if (lineCount >= MAX_LINES) break;
        const j3 = j * 3;
        const dx = ix - pos[j3];
        const dy = iy - pos[j3 + 1];
        const dz = iz - pos[j3 + 2];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < LINK_DIST2) {
          const k = lineCount * 6;
          linePos[k] = ix;
          linePos[k + 1] = iy;
          linePos[k + 2] = iz;
          linePos[k + 3] = pos[j3];
          linePos[k + 4] = pos[j3 + 1];
          linePos[k + 5] = pos[j3 + 2];

          const alpha = 1 - Math.sqrt(d2) / LINK_DIST;
          // distance to mouse brightens lines
          const mx = (ix + pos[j3]) / 2 - mouseWorld.x;
          const my = (iy + pos[j3 + 1]) / 2 - mouseWorld.y;
          const md = Math.sqrt(mx * mx + my * my);
          const heat = Math.max(0, 1 - md / 3.5);

          const c = colA.clone().lerp(colB, heat).multiplyScalar(alpha * (0.4 + heat * 0.8));
          lineCol[k] = c.r;
          lineCol[k + 1] = c.g;
          lineCol[k + 2] = c.b;
          lineCol[k + 3] = c.r;
          lineCol[k + 4] = c.g;
          lineCol[k + 5] = c.b;

          lineCount++;
        }
      }
    }
    lineGeo.setDrawRange(0, lineCount * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;

    // smooth rotation toward cursor
    rotX += (targetRotX - rotX) * 0.09;
    rotY += (targetRotY - rotY) * 0.09;
    points.rotation.x = rotX;
    points.rotation.y = rotY;
    lines.rotation.x = rotX;
    lines.rotation.y = rotY;

    // slow auto-rotate
    points.rotation.z += 0.0008;
    lines.rotation.z = points.rotation.z;

    // pulse the cursor marker so the 3D clearly reacts to the pointer
    if (cursorDot.visible) {
      const cp = 1 + Math.sin(t * 5) * 0.18;
      cursorDot.scale.setScalar(cp);
      cursorDot.material.opacity = 0.55 + Math.sin(t * 5) * 0.25;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function makeDotTexture() {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.3, "rgba(255,255,255,0.7)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  if (reduce) {
    renderer.render(scene, camera);
  } else {
    animate();
  }
})();
