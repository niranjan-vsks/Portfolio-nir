import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
const root = document.getElementById('root') ?? document.body;
root.appendChild(renderer.domElement);

// Mouse tracking
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let isFlipped = false;
let flipProgress = 0;
let flipTarget = 0;
let autoRotate = true;

// Lights
const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
ambientLight.name = 'ambientLight';
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
mainLight.name = 'mainLight';
mainLight.position.set(5, 5, 5);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(1024, 1024);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0x6688ff, 0.5);
fillLight.name = 'fillLight';
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xff4488, 1.5, 15);
rimLight.name = 'rimLight';
rimLight.position.set(-3, 2, -3);
scene.add(rimLight);

const accentLight = new THREE.PointLight(0x44aaff, 1.5, 15);
accentLight.name = 'accentLight';
accentLight.position.set(3, -1, 2);
scene.add(accentLight);

// Card dimensions
const cardWidth = 2.2;
const cardHeight = 3.2;
const cardDepth = 0.06;
const cornerRadius = 0.12;

// Create rounded rectangle shape
function createRoundedRectShape(w, h, r) {
  const shape = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

// Create card textures using canvas
function createFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 740;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 740);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(0.5, '#16213e');
  grad.addColorStop(1, '#0f3460');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 740);

  // Border glow
  ctx.strokeStyle = 'rgba(100, 180, 255, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 472, 700);

  // Inner border
  ctx.strokeStyle = 'rgba(255, 100, 180, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(35, 35, 442, 670);

  // Diamond shape in center
  ctx.save();
  ctx.translate(256, 300);
  ctx.rotate(Math.PI / 4);
  const diamondGrad = ctx.createLinearGradient(-80, -80, 80, 80);
  diamondGrad.addColorStop(0, '#ff6b9d');
  diamondGrad.addColorStop(0.5, '#c44dff');
  diamondGrad.addColorStop(1, '#4d9fff');
  ctx.fillStyle = diamondGrad;
  ctx.fillRect(-70, -70, 140, 140);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-70, -70, 140, 140);
  ctx.restore();

  // Inner diamond
  ctx.save();
  ctx.translate(256, 300);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-45, -45, 90, 90);
  ctx.restore();

  // Star symbol in center
  ctx.save();
  ctx.translate(256, 300);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff6b9d';
  ctx.shadowBlur = 20;
  ctx.fillText('✦', 0, 0);
  ctx.restore();

  // Top text
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 28px Arial';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#4d9fff';
  ctx.shadowBlur = 15;
  ctx.fillText('ETHEREAL', 256, 100);

  // Subtitle
  ctx.font = '300 16px Arial';
  ctx.fillStyle = 'rgba(200, 200, 255, 0.7)';
  ctx.shadowBlur = 8;
  ctx.fillText('INTERACTIVE  •  3D  •  CARD', 256, 135);

  // Bottom text
  ctx.font = '500 20px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ff6b9d';
  ctx.shadowBlur = 12;
  ctx.fillText('CLICK TO FLIP', 256, 620);

  // Corner symbols
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = 'rgba(255, 100, 180, 0.8)';
  ctx.shadowBlur = 10;
  ctx.textAlign = 'left';
  ctx.fillText('A', 50, 75);
  ctx.fillText('♦', 52, 110);
  ctx.textAlign = 'right';
  ctx.save();
  ctx.translate(462, 680);
  ctx.rotate(Math.PI);
  ctx.textAlign = 'left';
  ctx.fillText('A', 0, 10);
  ctx.fillText('♦', 2, 45);
  ctx.restore();

  // Decorative lines
  ctx.strokeStyle = 'rgba(100, 180, 255, 0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(50, 450 + i * 25);
    ctx.lineTo(462, 450 + i * 25);
    ctx.stroke();
  }

  // Small dots pattern
  ctx.fillStyle = 'rgba(200, 150, 255, 0.15)';
  for (let x = 60; x < 460; x += 30) {
    for (let y = 170; y < 240; y += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createBackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 740;
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, 512, 740);
  grad.addColorStop(0, '#2d1b4e');
  grad.addColorStop(0.5, '#1a0a3e');
  grad.addColorStop(1, '#0d0520');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 740);

  // Repeating pattern
  ctx.save();
  for (let x = 0; x < 512; x += 40) {
    for (let y = 0; y < 740; y += 40) {
      const offset = (Math.floor(y / 40) % 2) * 20;
      ctx.save();
      ctx.translate(x + offset, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = 'rgba(120, 80, 200, 0.12)';
      ctx.fillRect(-12, -12, 24, 24);
      ctx.strokeStyle = 'rgba(160, 120, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-12, -12, 24, 24);
      ctx.restore();
    }
  }
  ctx.restore();

  // Border
  ctx.strokeStyle = 'rgba(160, 120, 255, 0.5)';
  ctx.lineWidth = 6;
  ctx.strokeRect(15, 15, 482, 710);

  ctx.strokeStyle = 'rgba(200, 160, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, 452, 680);

  // Center ornament
  ctx.save();
  ctx.translate(256, 370);
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 8);
    ctx.fillStyle = `rgba(${150 + i * 12}, ${100 + i * 8}, 255, 0.3)`;
    ctx.beginPath();
    ctx.ellipse(0, -60, 15, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 35, 0, Math.PI * 2);
  const cGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 35);
  cGrad.addColorStop(0, 'rgba(200, 150, 255, 0.8)');
  cGrad.addColorStop(1, 'rgba(100, 50, 200, 0.3)');
  ctx.fillStyle = cGrad;
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#a066ff';
  ctx.shadowBlur = 20;
  ctx.fillText('✧', 0, 0);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// Materials
const frontTexture = createFrontTexture();
const backTexture = createBackTexture();

const frontMaterial = new THREE.MeshStandardMaterial({
  map: frontTexture,
  metalness: 0.3,
  roughness: 0.4,
  envMapIntensity: 1.0,
});
frontMaterial.name = 'frontMaterial';

const backMaterial = new THREE.MeshStandardMaterial({
  map: backTexture,
  metalness: 0.3,
  roughness: 0.4,
  envMapIntensity: 1.0,
});
backMaterial.name = 'backMaterial';

const edgeMaterial = new THREE.MeshStandardMaterial({
  color: 0x8866cc,
  metalness: 0.7,
  roughness: 0.2,
});
edgeMaterial.name = 'edgeMaterial';

// Build card from separate planes (front, back, edge) for reliability
// Front face
const frontShape = createRoundedRectShape(cardWidth, cardHeight, cornerRadius);
const frontGeo = new THREE.ShapeGeometry(frontShape, 12);
const frontFace = new THREE.Mesh(frontGeo, frontMaterial);
frontFace.name = 'frontFace';
frontFace.position.z = cardDepth / 2;

// Back face
const backShape = createRoundedRectShape(cardWidth, cardHeight, cornerRadius);
const backGeo = new THREE.ShapeGeometry(backShape, 12);
const backFace = new THREE.Mesh(backGeo, backMaterial);
backFace.name = 'backFace';
backFace.position.z = -cardDepth / 2;
backFace.rotation.y = Math.PI; // flip to face outward

// Edge (extruded ring)
const edgeShape = createRoundedRectShape(cardWidth, cardHeight, cornerRadius);
const edgeExtrudeSettings = {
  depth: cardDepth,
  bevelEnabled: false,
};
const edgeGeo = new THREE.ExtrudeGeometry(edgeShape, edgeExtrudeSettings);
// Remove front/back caps — keep only the sides
// We'll just use the full extrude and hide front/back behind our planes
const edgeMesh = new THREE.Mesh(edgeGeo, edgeMaterial);
edgeMesh.name = 'edgeMesh';
edgeMesh.position.z = -cardDepth / 2;

// Assemble card
const cardMesh = new THREE.Group();
cardMesh.name = 'card';
cardMesh.add(frontFace);
cardMesh.add(backFace);
cardMesh.add(edgeMesh);

// Card group for transforms
const cardGroup = new THREE.Group();
cardGroup.name = 'cardGroup';
cardGroup.add(cardMesh);
scene.add(cardGroup);

// Particle system for ambient particles
const particleCount = 200;
const particlesGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleSizes = new Float32Array(particleCount);
const particleSpeeds = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 12;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
  particleSizes[i] = Math.random() * 3 + 1;
  particleSpeeds[i] = Math.random() * 0.5 + 0.2;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

const particleMaterial = new THREE.PointsMaterial({
  color: 0x8888ff,
  size: 0.03,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
particleMaterial.name = 'particleMaterial';

const particles = new THREE.Points(particlesGeometry, particleMaterial);
particles.name = 'ambientParticles';
scene.add(particles);

// Edge glow effect
const glowShape = createRoundedRectShape(cardWidth + 0.05, cardHeight + 0.05, cornerRadius + 0.02);
const glowPoints = glowShape.getPoints(60);
const glowGeometry = new THREE.BufferGeometry().setFromPoints(glowPoints);
const glowMaterial = new THREE.LineBasicMaterial({
  color: 0x6688ff,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
});
glowMaterial.name = 'glowMaterial';
const glowLine = new THREE.LineLoop(glowGeometry, glowMaterial);
glowLine.name = 'edgeGlow';
cardGroup.add(glowLine);

// Second glow layer
const glowShape2 = createRoundedRectShape(cardWidth + 0.12, cardHeight + 0.12, cornerRadius + 0.05);
const glowPoints2 = glowShape2.getPoints(60);
const glowGeometry2 = new THREE.BufferGeometry().setFromPoints(glowPoints2);
const glowMaterial2 = new THREE.LineBasicMaterial({
  color: 0xff4488,
  transparent: true,
  opacity: 0.3,
  blending: THREE.AdditiveBlending,
});
glowMaterial2.name = 'glowMaterial2';
const glowLine2 = new THREE.LineLoop(glowGeometry2, glowMaterial2);
glowLine2.name = 'edgeGlow2';
cardGroup.add(glowLine2);

// Floor for shadow/reflection
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x0a0a15,
  metalness: 0.8,
  roughness: 0.3,
});
floorMaterial.name = 'floorMaterial';
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.name = 'floor';
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.5;
floor.receiveShadow = true;
scene.add(floor);

// Event listeners
window.addEventListener('mousemove', (e) => {
  mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  autoRotate = false;
});

window.addEventListener('click', () => {
  isFlipped = !isFlipped;
  flipTarget = isFlipped ? Math.PI : 0;
});

window.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  mouse.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(touch.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  mouse.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(touch.clientY / window.innerHeight) * 2 + 1;
  autoRotate = false;
  e.preventDefault();
}, { passive: false });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Easing function
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// UI overlay
const infoDiv = document.createElement('div');
infoDiv.style.cssText = `
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 13px;
  color: rgba(180, 180, 220, 0.6);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  pointer-events: none;
  user-select: none;
`;
infoDiv.textContent = 'Move mouse to rotate • Click to flip';
document.body.appendChild(infoDiv);

const titleDiv = document.createElement('div');
titleDiv.style.cssText = `
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: rgba(200, 200, 255, 0.5);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  pointer-events: none;
  user-select: none;
`;
titleDiv.textContent = '3D Interactive Card';
document.body.appendChild(titleDiv);

// Animation
const clock = new THREE.Clock();

function animate() {
  const time = clock.getElapsedTime();
  const delta = clock.getDelta();

  // Smooth mouse interpolation
  mouse.x += (mouse.targetX - mouse.x) * 0.06;
  mouse.y += (mouse.targetY - mouse.y) * 0.06;

  // Auto rotate if no mouse input
  if (autoRotate) {
    mouse.targetX = Math.sin(time * 0.3) * 0.3;
    mouse.targetY = Math.cos(time * 0.4) * 0.15;
  }

  // Flip animation
  flipProgress += (flipTarget - flipProgress) * 0.08;

  // Card rotation from mouse + flip
  const tiltX = mouse.y * 0.5;
  const tiltY = mouse.x * 0.6 + flipProgress;

  cardGroup.rotation.x = tiltX;
  cardGroup.rotation.y = tiltY;

  // Subtle floating animation
  cardGroup.position.y = Math.sin(time * 1.2) * 0.08;
  cardGroup.position.x = Math.sin(time * 0.8) * 0.03;

  // Glow pulse
  const pulse = Math.sin(time * 2) * 0.3 + 0.7;
  glowMaterial.opacity = pulse * 0.5;
  glowMaterial2.opacity = (1 - pulse) * 0.3 + 0.1;

  // Color shift on glow
  const hue1 = (time * 0.1) % 1;
  const hue2 = (time * 0.1 + 0.5) % 1;
  glowMaterial.color.setHSL(hue1, 0.7, 0.6);
  glowMaterial2.color.setHSL(hue2, 0.8, 0.5);

  // Animate particles
  const positions = particles.geometry.getAttribute('position');
  for (let i = 0; i < particleCount; i++) {
    positions.array[i * 3 + 1] += particleSpeeds[i] * 0.003;
    positions.array[i * 3] += Math.sin(time + i) * 0.001;
    if (positions.array[i * 3 + 1] > 5) {
      positions.array[i * 3 + 1] = -5;
    }
  }
  positions.needsUpdate = true;
  particles.rotation.y = time * 0.02;

  // Animate lights
  rimLight.position.x = Math.sin(time * 0.5) * 4;
  rimLight.position.z = Math.cos(time * 0.5) * 3;
  accentLight.position.x = Math.cos(time * 0.7) * 4;
  accentLight.position.y = Math.sin(time * 0.3) * 2;

  // Dynamic material properties based on viewing angle
  const viewAngle = Math.abs(Math.sin(tiltY));
  frontMaterial.metalness = 0.2 + viewAngle * 0.3;
  backMaterial.metalness = 0.2 + viewAngle * 0.3;

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);