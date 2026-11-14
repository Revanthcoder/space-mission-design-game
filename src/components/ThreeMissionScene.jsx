import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function makeEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas texture support is unavailable.");

  context.fillStyle = "#236d8b";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#5eb18a";
  const continents = [
    [[115, 85], [165, 55], [224, 71], [247, 113], [217, 142], [224, 185], [183, 199], [165, 254], [128, 229], [118, 169], [88, 132]],
    [[250, 229], [302, 209], [330, 239], [313, 276], [330, 316], [298, 371], [271, 352], [255, 299], [230, 270]],
    [[457, 96], [514, 68], [569, 77], [594, 108], [576, 140], [540, 151], [519, 190], [484, 174], [457, 138]],
    [[505, 207], [551, 184], [588, 205], [605, 247], [578, 301], [549, 338], [520, 311], [497, 270]],
    [[702, 88], [758, 77], [799, 102], [783, 129], [746, 137], [728, 115]],
    [[814, 228], [850, 209], [886, 222], [870, 251], [833, 260]],
  ];
  continents.forEach((points) => {
    context.beginPath();
    points.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
    context.fill();
  });
  context.fillStyle = "rgba(224, 241, 238, .62)";
  context.fillRect(0, 0, canvas.width, 22);
  context.fillRect(0, canvas.height - 18, canvas.width, 18);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeSpacecraft() {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: "#e5edf1", metalness: 0.62, roughness: 0.35 });
  const panelMaterial = new THREE.MeshStandardMaterial({ color: "#258eaf", metalness: 0.55, roughness: 0.42, emissive: "#092637" });
  const detailMaterial = new THREE.MeshStandardMaterial({ color: "#f0b768", metalness: 0.35, roughness: 0.5 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.4), bodyMaterial);
  group.add(body);
  const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.23, 0.035), panelMaterial);
  leftPanel.position.x = -0.55;
  group.add(leftPanel);
  const rightPanel = leftPanel.clone();
  rightPanel.position.x = 0.55;
  group.add(rightPanel);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.32, 8), bodyMaterial);
  antenna.rotation.z = Math.PI / 2;
  antenna.position.set(0, 0.19, 0);
  group.add(antenna);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), detailMaterial);
  dish.scale.set(1, 0.25, 1);
  dish.position.set(0.22, 0.28, 0);
  group.add(dish);
  group.scale.setScalar(0.58);
  return group;
}

function makeSceneAccents() {
  const bird = new THREE.Group();
  const birdMaterial = new THREE.MeshStandardMaterial({
    color: "#ffc46f",
    emissive: "#613813",
    roughness: 0.48,
  });
  const birdBody = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), birdMaterial);
  birdBody.scale.set(1.45, 0.62, 0.62);
  bird.add(birdBody);

  const birdHead = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), birdMaterial);
  birdHead.position.set(0.16, 0.045, 0);
  bird.add(birdHead);

  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.045, 0.14, 5),
    new THREE.MeshStandardMaterial({ color: "#ff8c63", roughness: 0.55 }),
  );
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.28, 0.045, 0);
  bird.add(beak);

  const wingGeometry = new THREE.ConeGeometry(0.12, 0.42, 4);
  const upperWing = new THREE.Group();
  const upperFeather = new THREE.Mesh(wingGeometry, birdMaterial);
  upperFeather.position.y = 0.2;
  upperWing.add(upperFeather);
  bird.add(upperWing);

  const lowerWing = new THREE.Group();
  const lowerFeather = new THREE.Mesh(wingGeometry, birdMaterial);
  lowerFeather.rotation.z = Math.PI;
  lowerFeather.position.y = -0.2;
  lowerWing.add(lowerFeather);
  bird.add(lowerWing);
  bird.position.set(-3.3, 1.85, 0.1);

  const bouncingBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 18),
    new THREE.MeshStandardMaterial({
      color: "#69d8c0",
      emissive: "#123d39",
      roughness: 0.34,
      metalness: 0.18,
    }),
  );
  bouncingBall.position.set(3.35, -1.65, 0.15);

  const rotatingCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.34, 0.34),
    new THREE.MeshStandardMaterial({
      color: "#ad91ff",
      emissive: "#261957",
      roughness: 0.38,
      metalness: 0.2,
    }),
  );
  rotatingCube.position.set(-3.35, -1.72, 0.15);
  rotatingCube.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(rotatingCube.geometry),
    new THREE.LineBasicMaterial({ color: "#e5ddff", transparent: true, opacity: 0.78 }),
  ));

  return { bird, upperWing, lowerWing, bouncingBall, rotatingCube };
}

function createTrajectory(orbit) {
  if (orbit?.path === "moon" || orbit?.path === "mars") {
    const start = new THREE.Vector3(-2.5, 0, 0);
    const end = new THREE.Vector3(2.55, 0.08, 0);
    const curve = new THREE.CubicBezierCurve3(
      start,
      new THREE.Vector3(-1.45, 2.15, 0.1),
      new THREE.Vector3(1.3, -1.7, -0.05),
      end,
    );
    return { curve, center: new THREE.Vector3(0, 0, 0), transfer: true };
  }

  const radius = orbit?.id === "geo" ? 3.25 : 2.45;
  const height = orbit?.id === "geo" ? 1.72 : 1.35;
  const ellipse = new THREE.EllipseCurve(0, 0, radius, height, 0, Math.PI * 2, false, 0);
  const points = ellipse.getPoints(160).map((point) => new THREE.Vector3(point.x, point.y, 0));
  const curve = new THREE.CatmullRomCurve3(points, true);
  return { curve, center: new THREE.Vector3(0, 0, 0), transfer: false, polar: orbit?.id === "polar" };
}

export default function ThreeMissionScene({ orbit, progress, onUnavailable }) {
  const mountRef = useRef(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
    } catch (error) {
      console.warn("WebGL is unavailable; using the lightweight mission visualization.", error);
      onUnavailable(error);
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#071321");
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, orbit?.path === "earth" ? 8.5 : 8.2);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.className = "three-canvas";
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
      "aria-label",
      `${orbit?.name || "Selected orbit"} mission view with a decorative flying bird, bouncing ball, and rotating cube. These accents are not mission hardware. Drag to rotate and use the mouse wheel to zoom. Trajectory is illustrative and not to scale.`,
    );
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.minDistance = 5;
    controls.maxDistance = 13;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight("#a8c9dd", 1.5));
    const sunLight = new THREE.DirectionalLight("#fff1d2", 3.1);
    sunLight.position.set(-4, 5, 7);
    scene.add(sunLight);
    const rimLight = new THREE.PointLight("#48bce0", 18, 15);
    rimLight.position.set(4, -2, 4);
    scene.add(rimLight);

    const starPositions = [];
    for (let index = 0; index < 620; index += 1) {
      starPositions.push(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 12,
        -3 - Math.random() * 8,
      );
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: "#bdd8e8", size: 0.025, transparent: true, opacity: 0.72 }),
    );
    scene.add(stars);

    const trajectory = createTrajectory(orbit);
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(trajectory.curve.getPoints(180));
    const pathMaterial = new THREE.LineDashedMaterial({
      color: "#6bd4ec",
      dashSize: 0.09,
      gapSize: 0.075,
      transparent: true,
      opacity: 0.82,
    });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    pathLine.computeLineDistances();
    if (trajectory.polar) pathLine.rotation.x = 0.7;
    scene.add(pathLine);

    const earthGroup = new THREE.Group();
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 48, 36),
      new THREE.MeshStandardMaterial({
        map: makeEarthTexture(),
        roughness: 0.92,
        metalness: 0.02,
      }),
    );
    earthGroup.add(earth);
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.24, 40, 30),
      new THREE.MeshBasicMaterial({ color: "#58c5e1", transparent: true, opacity: 0.075, side: THREE.BackSide }),
    );
    earthGroup.add(atmosphere);
    if (trajectory.transfer) earthGroup.position.x = -2.5;
    scene.add(earthGroup);

    let destination;
    if (orbit?.path === "moon" || orbit?.path === "mars") {
      const isMars = orbit.path === "mars";
      destination = new THREE.Mesh(
        new THREE.SphereGeometry(isMars ? 0.52 : 0.38, 32, 24),
        new THREE.MeshStandardMaterial({
          color: isMars ? "#bd6549" : "#b5c3cc",
          roughness: 1,
          metalness: 0,
        }),
      );
      destination.position.set(2.55, 0.08, 0);
      scene.add(destination);
    }

    const spacecraft = makeSpacecraft();
    scene.add(spacecraft);

    const accents = makeSceneAccents();
    scene.add(accents.bird, accents.bouncingBall, accents.rotatingCube);

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    let resizeObserver;
    if ("ResizeObserver" in window) {
      resizeObserver = new window.ResizeObserver(resize);
      resizeObserver.observe(mount);
    } else {
      window.addEventListener("resize", resize);
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameId;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      if (!prefersReducedMotion) {
        earthGroup.rotation.y += 0.0018;
        if (destination) destination.rotation.y += 0.0012;
        stars.rotation.z += 0.00005;
        const elapsed = window.performance.now() / 1000;
        const flightAngle = elapsed * 0.52;
        accents.bird.position.x = Math.cos(flightAngle) * 3.2;
        accents.bird.position.y = 1.85 + Math.sin(flightAngle * 2) * 0.1;
        accents.bird.position.z = Math.sin(flightAngle) * 0.65;
        accents.bird.rotation.y = Math.atan2(-Math.cos(flightAngle) * 0.65, -Math.sin(flightAngle) * 3.2);
        const flap = Math.sin(elapsed * 8) * 0.62;
        accents.upperWing.rotation.z = flap;
        accents.lowerWing.rotation.z = -flap;
        accents.bouncingBall.position.y = -1.65 + Math.abs(Math.sin(elapsed * 2.4)) * 0.55;
        accents.rotatingCube.rotation.x += 0.012;
        accents.rotatingCube.rotation.y += 0.018;
      }
      const t = Math.max(0, Math.min(1, progressRef.current / 100));
      const position = trajectory.curve.getPoint(t);
      const tangent = trajectory.curve.getTangent(t);
      if (trajectory.polar) {
        position.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.7);
        tangent.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.7);
      }
      spacecraft.position.copy(position);
      spacecraft.rotation.z = Math.atan2(tangent.y, tangent.x);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleContextLost = (event) => {
      event.preventDefault();
      const error = new Error("The WebGL context was lost.");
      console.warn("WebGL context lost; using the lightweight mission visualization.", error);
      onUnavailable(error);
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost, false);

    return () => {
      window.cancelAnimationFrame(frameId);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      controls.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (material.map) material.map.dispose();
            material.dispose();
          });
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [orbit, onUnavailable]);

  return <div className="three-scene" ref={mountRef} />;
}
