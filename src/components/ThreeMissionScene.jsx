import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function makeEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas texture support is unavailable.");

  context.fillStyle = "#173d5d";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#7ed7a4";
  const continents = [
    [[96, 104], [155, 66], [222, 80], [261, 110], [253, 151], [230, 176], [226, 214], [190, 240], [134, 232], [111, 189], [85, 150]],
    [[246, 242], [315, 208], [352, 238], [333, 280], [354, 320], [296, 359], [258, 338], [236, 294]],
    [[420, 92], [476, 58], [540, 80], [580, 116], [566, 166], [523, 183], [486, 210], [463, 176], [440, 134]],
    [[492, 220], [550, 190], [603, 208], [632, 250], [601, 305], [548, 342], [512, 318], [495, 274]],
    [[686, 90], [740, 74], [784, 94], [773, 138], [728, 146], [706, 122]],
    [[790, 224], [832, 201], [884, 214], [872, 246], [830, 262]],
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

  context.fillStyle = "rgba(255, 255, 255, 0.35)";
  for (let i = 0; i < 20; i += 1) {
    const x = 30 + i * 52;
    const y = 16 + (i % 4) * 18;
    context.fillRect(x, y, 24, 4);
  }

  context.fillStyle = "rgba(206, 245, 255, 0.7)";
  context.fillRect(0, 0, canvas.width, 20);
  context.fillRect(0, canvas.height - 18, canvas.width, 18);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeSpacecraft() {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: "#edf6ff", metalness: 0.68, roughness: 0.28 });
  const panelMaterial = new THREE.MeshStandardMaterial({ color: "#52b7d9", metalness: 0.8, roughness: 0.32, emissive: "#103651", emissiveIntensity: 0.35 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: "#f6ae67", metalness: 0.4, roughness: 0.5, emissive: "#6d4515" });

  const core = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.72, 4, 12), bodyMaterial);
  core.rotation.z = Math.PI / 2;
  group.add(core);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.42, 18), bodyMaterial);
  nose.rotation.z = -Math.PI / 2;
  nose.position.x = 0.46;
  group.add(nose);

  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 14), new THREE.MeshPhysicalMaterial({
    color: "#d4f4ff",
    transparent: true,
    opacity: 0.88,
    transmission: 0.28,
    roughness: 0.18,
    metalness: 0.12,
  }));
  cockpit.position.set(-0.12, 0.08, 0);
  group.add(cockpit);

  const leftSolar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.42), panelMaterial);
  leftSolar.position.set(-0.18, 0.22, 0.48);
  leftSolar.rotation.y = 0.24;
  group.add(leftSolar);

  const rightSolar = leftSolar.clone();
  rightSolar.position.z = -0.48;
  rightSolar.rotation.y = -0.24;
  group.add(rightSolar);

  const engineRing = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 12, 40), new THREE.MeshBasicMaterial({ color: "#4fe3ff", transparent: true, opacity: 0.7 }));
  engineRing.rotation.y = Math.PI / 2;
  engineRing.position.set(-0.55, 0, 0);
  group.add(engineRing);

  const engineBell = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.26, 16), accentMaterial);
  engineBell.rotation.z = Math.PI / 2;
  engineBell.position.set(-0.62, 0, 0);
  group.add(engineBell);

  const secondaryBell = engineBell.clone();
  secondaryBell.position.set(-0.62, 0.16, 0.1);
  group.add(secondaryBell);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.38, 10), bodyMaterial);
  antenna.rotation.z = Math.PI / 2;
  antenna.position.set(0.02, 0.34, 0);
  group.add(antenna);

  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 16), accentMaterial);
  dish.scale.set(1.2, 0.4, 1);
  dish.position.set(0.34, 0.22, 0);
  group.add(dish);

  group.scale.setScalar(0.75);
  return group;
}

function makeOrbitalStation() {
  const group = new THREE.Group();

  const coreMaterial = new THREE.MeshStandardMaterial({ color: "#dfeafc", metalness: 0.75, roughness: 0.35, emissive: "#1f2f46" });
  const ringMaterial = new THREE.MeshStandardMaterial({ color: "#8ae7ff", metalness: 0.8, roughness: 0.28, emissive: "#219cc6", emissiveIntensity: 0.28 });

  const module = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.25, 20), coreMaterial);
  group.add(module);

  const solarA = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.26), ringMaterial);
  solarA.position.set(0.9, 0.7, 0);
  solarA.rotation.z = 0.42;
  group.add(solarA);

  const solarB = solarA.clone();
  solarB.position.x = -0.9;
  solarB.rotation.z = -0.42;
  group.add(solarB);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.08, 14, 60), ringMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.rotation.y = 0.8;
  group.add(ring);

  const module2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.48, 0.7), new THREE.MeshStandardMaterial({ color: "#9bbdff", metalness: 0.82, roughness: 0.28 }));
  module2.position.set(0, 0.92, 0.2);
  group.add(module2);

  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 18), new THREE.MeshStandardMaterial({ color: "#74f0ff", emissive: "#74f0ff", emissiveIntensity: 0.4 }));
  hub.position.set(0, 0.2, 0);
  group.add(hub);

  return group;
}

function makeOrbitalSatellite(color, scale = 1) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.18 * scale, 0.11 * scale, 0.26 * scale),
    new THREE.MeshStandardMaterial({
      color,
      metalness: 0.7,
      roughness: 0.3,
      emissive: color,
      emissiveIntensity: 0.12,
    }),
  );
  group.add(body);

  const wingOne = new THREE.Mesh(
    new THREE.BoxGeometry(0.12 * scale, 0.03 * scale, 0.36 * scale),
    new THREE.MeshStandardMaterial({ color: "#dbeafe", metalness: 0.8, roughness: 0.28 }),
  );
  wingOne.position.set(-0.18 * scale, 0, 0);
  wingOne.rotation.z = Math.PI / 2;
  group.add(wingOne);

  const wingTwo = wingOne.clone();
  wingTwo.position.x = 0.18 * scale;
  group.add(wingTwo);

  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(0.06 * scale, 0.2 * scale, 0.16 * scale),
    new THREE.MeshStandardMaterial({ color: "#67e8f9", emissive: "#67e8f9", emissiveIntensity: 0.35 }),
  );
  panel.position.set(0, 0.08 * scale, 0);
  group.add(panel);

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

function makeAsteroidField() {
  const asteroids = [];
  for (let i = 0; i < 24; i += 1) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.12, 0),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? "#9aa5b1" : "#c3c7d7",
        roughness: 1,
        metalness: 0.08,
      }),
    );
    rock.position.set(
      (Math.random() - 0.5) * 6.8,
      (Math.random() - 0.5) * 4.6,
      (Math.random() - 0.5) * 2.8,
    );
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    asteroids.push(rock);
  }
  return asteroids;
}

function createTrajectory(orbit) {
  if (orbit?.path === "moon" || orbit?.path === "mars" || orbit?.path === "planetary") {
    const start = new THREE.Vector3(-2.5, 0, 0);
    const end = new THREE.Vector3(2.55, 0.08, 0);
    const curve = new THREE.CubicBezierCurve3(
      start,
      new THREE.Vector3(-1.7, 2.2, 0.2),
      new THREE.Vector3(1.6, -1.8, -0.2),
      end,
    );
    return { curve, center: new THREE.Vector3(0, 0, 0), transfer: true };
  }

  const radius = orbit?.id === "geo" ? 3.35 : 2.5;
  const height = orbit?.id === "geo" ? 1.75 : 1.4;
  const ellipse = new THREE.EllipseCurve(0, 0, radius, height, 0, Math.PI * 2, false, 0);
  const points = ellipse.getPoints(180).map((point) => new THREE.Vector3(point.x, point.y, 0));
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
    camera.position.set(0, 0, orbit?.path === "earth" ? 8.7 : 8.3);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.className = "three-canvas";
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
      "aria-label",
      `${orbit?.name || "Selected orbit"} mission view${orbit?.destinationName ? ` to ${orbit.destinationName}` : ""} with a detailed spacecraft, orbiting outpost, asteroid field, and layered planetary environment. Drag to rotate and scroll to zoom.`,
    );
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.minDistance = 5;
    controls.maxDistance = 14;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight("#afc9dc", 1.45));
    const sunLight = new THREE.DirectionalLight("#fff1d2", 3.4);
    sunLight.position.set(-5, 5, 7);
    scene.add(sunLight);
    const rimLight = new THREE.PointLight("#43d5ff", 22, 18);
    rimLight.position.set(4, -2, 4);
    scene.add(rimLight);

    const starPositions = [];
    for (let index = 0; index < 900; index += 1) {
      starPositions.push(
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 16,
        -6 - Math.random() * 12,
      );
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: "#d7ebff", size: 0.025, transparent: true, opacity: 0.8 }),
    );
    scene.add(stars);

    const trajectory = createTrajectory(orbit);
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(trajectory.curve.getPoints(220));
    const pathMaterial = new THREE.LineDashedMaterial({
      color: "#73d9ff",
      dashSize: 0.09,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.9,
    });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    pathLine.computeLineDistances();
    if (trajectory.polar) pathLine.rotation.x = 0.7;
    scene.add(pathLine);

    const orbitHalo = new THREE.Mesh(
      new THREE.TorusGeometry(2.18, 0.022, 18, 180),
      new THREE.MeshBasicMaterial({ color: "#7dd3fc", transparent: true, opacity: 0.5 }),
    );
    orbitHalo.rotation.x = Math.PI / 2;
    orbitHalo.rotation.z = 0.7;
    scene.add(orbitHalo);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.75, 0.012, 12, 220),
      new THREE.MeshBasicMaterial({ color: "#a78bfa", transparent: true, opacity: 0.22 }),
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.rotation.y = 0.55;
    scene.add(innerRing);

    const scanRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.9, 0.014, 12, 200),
      new THREE.MeshBasicMaterial({ color: "#5eead4", transparent: true, opacity: 0.4 }),
    );
    scanRing.rotation.x = Math.PI / 2;
    scanRing.rotation.z = 0.65;
    scene.add(scanRing);

    const earthGroup = new THREE.Group();
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 56, 40),
      new THREE.MeshStandardMaterial({
        map: makeEarthTexture(),
        roughness: 0.92,
        metalness: 0.02,
      }),
    );
    earthGroup.add(earth);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.24, 40, 30),
      new THREE.MeshBasicMaterial({ color: "#58c5e1", transparent: true, opacity: 0.08, side: THREE.BackSide }),
    );
    earthGroup.add(atmosphere);

    const cloudBand = new THREE.Mesh(
      new THREE.SphereGeometry(1.29, 40, 30),
      new THREE.MeshStandardMaterial({
        color: "#dff9ff",
        transparent: true,
        opacity: 0.16,
        emissive: "#5eead4",
        emissiveIntensity: 0.22,
        roughness: 0.8,
        metalness: 0.08,
      }),
    );
    earthGroup.add(cloudBand);

    const glowShell = new THREE.Mesh(
      new THREE.SphereGeometry(1.45, 40, 30),
      new THREE.MeshBasicMaterial({ color: "#67e8f9", transparent: true, opacity: 0.09, side: THREE.BackSide }),
    );
    earthGroup.add(glowShell);

    if (trajectory.transfer) earthGroup.position.x = -2.5;
    scene.add(earthGroup);

    let destination;
    if (orbit?.path === "moon" || orbit?.path === "mars" || orbit?.path === "planetary") {
      const isMars = orbit.path === "mars";
      const isMoon = orbit.path === "moon";
      const destinationColors = {
        mercury: "#d68d67",
        venus: "#e5b35e",
        jupiter: "#d99c73",
        saturn: "#d8c28c",
        uranus: "#75cbd0",
        neptune: "#557ee0",
      };
      const destinationColor = destinationColors[orbit.destinationId] || "#b8bec9";
      destination = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.SphereGeometry(isMars ? 0.52 : isMoon ? 0.38 : 0.48, 32, 24),
        new THREE.MeshStandardMaterial({
          color: isMars ? "#c76d4a" : isMoon ? "#b8bec9" : destinationColor,
          roughness: 1,
          metalness: 0,
        }),
      );
      destination.add(body);

      const accentRing = new THREE.Mesh(
        new THREE.TorusGeometry(isMars ? 0.76 : isMoon ? 0.58 : 0.7, 0.04, 14, 80),
        new THREE.MeshBasicMaterial({ color: isMars ? "#f5b087" : isMoon ? "#d5ecff" : destinationColor, transparent: true, opacity: 0.55 }),
      );
      accentRing.rotation.x = Math.PI / 2.3;
      destination.add(accentRing);

      destination.position.set(2.55, 0.08, 0);
      scene.add(destination);
    }

    const spacecraft = makeSpacecraft();
    scene.add(spacecraft);

    const station = makeOrbitalStation();
    station.position.set(1.8, 1.2, -1.2);
    station.rotation.x = 0.4;
    scene.add(station);

    const satellites = [
      makeOrbitalSatellite("#7dd3fc", 1.1),
      makeOrbitalSatellite("#a78bfa", 0.8),
      makeOrbitalSatellite("#67e8f9", 0.9),
    ];
    const satelliteBases = [
      { x: -0.7, y: 0.8, z: 0.4 },
      { x: 0.1, y: 1.6, z: 0.2 },
      { x: 1.2, y: 0.8, z: -0.9 },
    ];
    satellites.forEach((satellite, index) => {
      const base = satelliteBases[index];
      satellite.position.set(base.x, base.y, base.z);
      satellite.rotation.z = index * 0.8;
      scene.add(satellite);
    });

    const asteroidField = makeAsteroidField();
    asteroidField.forEach((asteroid) => scene.add(asteroid));

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
      const elapsed = window.performance.now() / 1000;
      if (!prefersReducedMotion) {
        earthGroup.rotation.y += 0.0018;
        cloudBand.rotation.y += 0.0036;
        glowShell.rotation.y += 0.0012;
        orbitHalo.rotation.z += 0.0022;
        innerRing.rotation.z += 0.0014;
        scanRing.rotation.z += 0.003;
        station.rotation.y += 0.008;
        station.position.y = 1.2 + Math.sin(elapsed * 1.4) * 0.18;

        satellites.forEach((satellite, index) => {
          const base = satelliteBases[index];
          satellite.rotation.y += 0.012 + index * 0.004;
          satellite.position.x = base.x + Math.sin(elapsed * 1.4 + index * 1.7) * 0.25;
          satellite.position.y = base.y + Math.cos(elapsed * 1.1 + index * 1.2) * 0.18;
          satellite.position.z = base.z + Math.sin(elapsed * 1.7 + index * 1.5) * 0.24;
        });

        asteroidField.forEach((asteroid, index) => {
          asteroid.rotation.x += 0.005 + index * 0.0008;
          asteroid.rotation.y += 0.006 + index * 0.0007;
        });

        if (destination) destination.rotation.y += 0.0012;
        stars.rotation.z += 0.00005;

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
      spacecraft.rotation.x = Math.sin(elapsed * 2.3) * 0.18;
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
