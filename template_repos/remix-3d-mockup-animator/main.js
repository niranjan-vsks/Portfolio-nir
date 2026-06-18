// iPhone 3D Model Viewer

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 0.5, 5.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.logarithmicDepthBuffer = true;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 1.5;
controls.maxDistance = 8;
controls.autoRotate = false;
controls.target.set(0, 0, 0);

// Lighting setup — studio-style
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
ambientLight.name = 'ambientLight';
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
keyLight.name = 'keyLight';
keyLight.position.set(3, 5, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.bias = -0.001;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xc8d8ff, 0.8);
fillLight.name = 'fillLight';
fillLight.position.set(-3, 3, -2);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
rimLight.name = 'rimLight';
rimLight.position.set(0, 2, -5);
scene.add(rimLight);

const bottomLight = new THREE.PointLight(0x4488ff, 0.5, 10);
bottomLight.name = 'bottomLight';
bottomLight.position.set(0, -3, 0);
scene.add(bottomLight);

// Subtle environment — gradient sphere
const envGeo = new THREE.SphereGeometry(30, 32, 32);
const envMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: {
    colorTop: { value: new THREE.Color(0x111118) },
    colorBottom: { value: new THREE.Color(0x050508) }
  },
  vertexShader: `
    varying vec3 vWorldPos;
    void main() {
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `,
  fragmentShader: `
    uniform vec3 colorTop;
    uniform vec3 colorBottom;
    varying vec3 vWorldPos;
    void main() {
      float t = clamp((vWorldPos.y + 10.0) / 20.0, 0.0, 1.0);
      gl_FragColor = vec4(mix(colorBottom, colorTop, t), 1.0);
    }
  `
});
const envMesh = new THREE.Mesh(envGeo, envMat);
envMesh.name = 'envSphere';
scene.add(envMesh);



// UI Overlay
const ui = document.createElement('div');
ui.innerHTML = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    .viewer-ui {
      font-family: 'Inter', sans-serif;
      position: fixed;
      color: #fff;
      pointer-events: none;
      user-select: none;
    }
    .title-bar {
      position: fixed;
      top: 20px;
      left: 24px;
    }
    .title-bar h1 {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin: 0 0 4px 0;
      color: rgba(255,255,255,0.9);
    }
    .title-bar p {
      font-size: 12px;
      font-weight: 400;
      margin: 0;
      color: rgba(255,255,255,0.4);
    }
    .controls-bar {
      position: fixed;
      bottom: 168px;
      left: 20px;
      display: flex;
      gap: 6px;
      pointer-events: auto;
    }
    .ctrl-btn {
      background: rgba(12,12,16,0.85);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.7);
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
    }
    .ctrl-btn:hover {
      background: rgba(24,24,30,0.9);
      color: rgba(255,255,255,0.95);
    }
    .ctrl-btn.active {
      background: rgba(20,20,26,0.9);
      border-color: rgba(255,255,255,0.2);
      color: #fff;
    }
    .loader-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      background: rgba(10,10,10,0.95);
      z-index: 100;
      transition: opacity 0.6s ease;
    }
    .loader-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }
    .spinner {
      width: 32px; height: 32px;
      border: 2px solid rgba(255,255,255,0.1);
      border-top-color: rgba(255,255,255,0.6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loader-text {
      font-size: 13px;
      color: rgba(255,255,255,0.4);
    }
    .info-badge {
      position: fixed;
      top: 20px;
      right: 24px;
      font-size: 11px;
      color: rgba(255,255,255,0.3);
      text-align: right;
      line-height: 1.6;
    }
    /* Timeline */
    .timeline-container {
      position: fixed;
      bottom: 12px;
      left: 20px;
      right: 20px;
      height: 140px;
      background: rgba(12,12,16,0.85);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      z-index: 50;
      padding: 0;
      overflow: visible;
    }
    /* Timeline tabs */
    .timeline-tabs-bar {
      display: flex;
      align-items: center;
      gap: 0;
      padding: 0;
      flex-shrink: 0;
      overflow: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
      border-radius: 14px 14px 0 0;
    }
    .timeline-tabs-bar::-webkit-scrollbar { display: none; }
    .timeline-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      font-size: 11px;
      font-weight: 500;
      color: rgba(255,255,255,0.35);
      background: transparent;
      border: none;
      border-radius: 0;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
      font-family: 'Inter', sans-serif;
      position: relative;
    }
    .timeline-tab:hover {
      color: rgba(255,255,255,0.6);
      background: rgba(255,255,255,0.04);
    }
    .timeline-tab.active {
      color: rgba(255,255,255,0.85);
      background: rgba(255,255,255,0.06);
    }
    .timeline-tab .tab-close {
      display: none;
      width: 14px;
      height: 14px;
      border-radius: 3px;
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.3);
      font-size: 10px;
      line-height: 14px;
      text-align: center;
      cursor: pointer;
      padding: 0;
      font-family: 'Inter', sans-serif;
      transition: all 0.15s ease;
    }
    .timeline-tab.active .tab-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .timeline-tab .tab-close:hover {
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.7);
    }
    .timeline-tab-name {
      pointer-events: none;
    }
    .timeline-tab-name[contenteditable="true"] {
      pointer-events: auto;
      outline: none;
      border-bottom: 1px solid rgba(255,255,255,0.3);
      min-width: 30px;
    }
    .tab-add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.3);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
      margin-left: 6px;
      font-family: 'Inter', sans-serif;
      padding: 0;
    }
    .tab-add-btn:hover {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.7);
      border-color: rgba(255,255,255,0.12);
    }
    .timeline-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 14px 6px 14px;
      flex-shrink: 0;
    }
    .timeline-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .timeline-label {
      font-size: 10px;
      font-weight: 600;
      color: rgba(255,255,255,0.3);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .timeline-time {
      font-size: 11px;
      font-weight: 500;
      color: rgba(255,255,255,0.45);
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
    }
    .timeline-actions {
      display: flex;
      gap: 3px;
      align-items: center;
    }
    .tl-btn {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.45);
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.01em;
      height: 28px;
      line-height: 18px;
    }
    .tl-btn:hover {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.85);
      border-color: rgba(255,255,255,0.12);
    }
    .tl-btn.play {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.8);
      padding: 4px 12px;
      border-radius: 6px;
      width: 36px;
      height: 28px;
      line-height: 18px;
      text-align: center;
    }
    .tl-btn.play:hover {
      background: rgba(255,255,255,0.18);
      color: #fff;
    }
    .tl-divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.08);
      margin: 0 4px;
    }
    .tl-btn:disabled {
      opacity: 0.2;
      cursor: default;
      pointer-events: none;
    }
    .timeline-ruler-bar {
      position: relative;
      height: 28px;
      margin: 0 14px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
      pointer-events: auto;
      cursor: pointer;
      overflow: visible;
    }
    .ruler-tick-label {
      position: absolute;
      bottom: 6px;
      transform: translateX(-50%);
      font-size: 10px;
      font-weight: 500;
      color: rgba(255,255,255,0.3);
      font-variant-numeric: tabular-nums;
    }
    .ruler-dot {
      position: absolute;
      bottom: 11px;
      width: 3px;
      height: 3px;
      background: rgba(255,255,255,0.12);
      border-radius: 50%;
      transform: translateX(-50%);
    }
    .timeline-track-area {
      flex: 1;
      position: relative;
      margin: 0 14px 10px 14px;
      cursor: pointer;
      -webkit-user-select: none;
      user-select: none;
    }
    .timeline-ruler {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      pointer-events: none;
    }
    .timeline-ruler-tick {
      position: absolute;
      top: 50%;
      width: 1px;
      height: 8px;
      background: rgba(255,255,255,0.06);
      transform: translateY(-50%);
    }
    .timeline-ruler-tick.major {
      height: 14px;
      background: rgba(255,255,255,0.1);
    }
    .timeline-track {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      background: rgba(255,255,255,0.08);
      border-radius: 1px;
      transform: translateY(-50%);
    }
    .timeline-track-fill {
      position: absolute;
      top: 50%;
      left: 0;
      width: 0%;
      height: 2px;
      background: linear-gradient(90deg, rgba(232,70,90,0.3), rgba(232,70,90,0.6));
      border-radius: 1px;
      transform: translateY(-50%);
      pointer-events: none;
    }
    .timeline-playhead-group {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0%;
      width: 0;
      pointer-events: none;
      z-index: 10;
    }
    .timeline-playhead-line {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 1.5px;
      background: #e8465a;
      transform: translateX(-50%);
      border-radius: 1px;
    }
    .timeline-playhead-badge {
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      background: #e8465a;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 12px;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
      box-shadow: 0 2px 8px rgba(232,70,90,0.3);
      cursor: grab;
      transition: background 0.2s ease, box-shadow 0.2s ease;
    }
    .timeline-playhead-badge.editing {
      background: #f5a623;
      box-shadow: 0 2px 10px rgba(245,166,35,0.5);
    }

    .timeline-keyframe {
      position: absolute;
      top: 50%;
      width: 10px;
      height: 10px;
      background: rgba(255,255,255,0.85);
      border: 1.5px solid rgba(255,255,255,1);
      border-radius: 2px;
      transform: translate(-50%, -50%) rotate(45deg);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      z-index: 2;
    }
    .timeline-keyframe:hover {
      background: rgba(255,255,255,1);
      border-color: rgba(255,255,255,1);
      transform: translate(-50%, -50%) rotate(45deg) scale(1.25);
      box-shadow: 0 0 10px rgba(255,255,255,0.4);
    }
    .timeline-keyframe.dragging {
      transition: none !important;
      transform: translate(-50%, -50%) rotate(45deg) scale(1.25);
    }
    .timeline-keyframe.active {
      background: #e8465a;
      border-color: #e8465a;
      box-shadow: 0 0 12px rgba(232,70,90,0.5);
    }
    .timeline-keyframe.editing {
      background: #f5a623;
      border-color: #f5a623;
      box-shadow: 0 0 14px rgba(245,166,35,0.6);
      animation: kf-pulse 1.2s ease-in-out infinite;
    }
    @keyframes kf-pulse {
      0%, 100% { box-shadow: 0 0 10px rgba(245,166,35,0.4); }
      50% { box-shadow: 0 0 18px rgba(245,166,35,0.7); }
    }
    .timeline-keyframe .kf-time {
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translate(-50%, 0) rotate(-45deg);
      font-size: 8px;
      font-weight: 500;
      color: rgba(255,255,255,0.3);
      white-space: nowrap;
      pointer-events: none;
      font-variant-numeric: tabular-nums;
    }
    /* Easing connector button between keyframes */
    .easing-connector {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: rgba(30,30,36,1);
      border: 1px solid rgba(255,255,255,0.35);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      z-index: 3;
    }
    .easing-connector:hover {
      background: rgba(50,50,58,1);
      border-color: rgba(255,255,255,0.6);
      transform: translate(-50%, -50%) scale(1.1);
    }
    .easing-connector.active {
      background: rgba(232,70,90,0.9);
      border-color: rgba(232,70,90,1);
    }
    .easing-connector svg {
      width: 12px;
      height: 12px;
      fill: none;
      stroke: rgba(255,255,255,0.8);
      stroke-width: 1.5;
      stroke-linecap: round;
    }
    .easing-connector:hover svg {
      stroke: rgba(255,255,255,1);
    }
    .easing-connector.active svg {
      stroke: rgba(255,255,255,1);
    }
    /* Easing panel */
    .easing-panel {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(12,12,16,0.95);
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 14px;
      padding: 16px;
      z-index: 200;
      pointer-events: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      overflow: hidden;
      width: 280px;
    }
    .easing-panel-title {
      font-size: 10px;
      font-weight: 600;
      color: rgba(255,255,255,0.3);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .easing-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
      width: 100%;
    }
    .easing-option {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
      min-width: 0;
      overflow: hidden;
    }
    .easing-option:hover {
      background: rgba(255,255,255,0.06);
    }
    .easing-option.selected {
      background: rgba(232,70,90,0.12);
      border-color: rgba(232,70,90,0.3);
    }
    .easing-option-curve {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
    .easing-option-curve svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: rgba(255,255,255,0.35);
      stroke-width: 1.5;
      stroke-linecap: round;
    }
    .easing-option.selected .easing-option-curve svg {
      stroke: rgba(232,70,90,0.9);
    }
    .easing-option-label {
      font-size: 11px;
      font-weight: 500;
      color: rgba(255,255,255,0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }
    .easing-option.selected .easing-option-label {
      color: rgba(255,255,255,0.9);
    }
    /* Export dropdown */
    .export-dropdown {
      position: fixed;
      top: 20px;
      right: 24px;
      pointer-events: auto;
      z-index: 60;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .export-btn {
      background: rgba(12,12,16,0.85);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.7);
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .export-btn:hover {
      background: rgba(24,24,30,0.9);
      color: rgba(255,255,255,0.95);
      border-color: rgba(255,255,255,0.15);
    }
    .export-btn svg {
      width: 14px;
      height: 14px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .export-menu {
      margin-top: 6px;
      background: rgba(12,12,16,0.95);
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 10px;
      padding: 6px;
      display: none;
      min-width: 200px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    .export-menu.open {
      display: block;
    }
    .export-menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 7px;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: 'Inter', sans-serif;
      color: rgba(255,255,255,0.7);
    }
    .export-menu-item:hover {
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.95);
    }
    .export-menu-item:disabled {
      opacity: 0.3;
      cursor: default;
      pointer-events: none;
    }
    .export-menu-item .emi-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .export-menu-item .emi-icon svg {
      width: 14px;
      height: 14px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .export-menu-item .emi-text {
      display: flex;
      flex-direction: column;
    }
    .export-menu-item .emi-label {
      font-size: 12px;
      font-weight: 500;
    }
    .export-menu-item .emi-desc {
      font-size: 10px;
      color: rgba(255,255,255,0.3);
      margin-top: 1px;
    }
    .export-progress-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(10,10,10,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      z-index: 500;
      font-family: 'Inter', sans-serif;
    }
    .export-progress-text {
      font-size: 14px;
      color: rgba(255,255,255,0.7);
      margin-top: 16px;
    }
    .export-progress-bar-outer {
      width: 240px;
      height: 4px;
      background: rgba(255,255,255,0.08);
      border-radius: 2px;
      margin-top: 12px;
      overflow: hidden;
    }
    .export-progress-bar-inner {
      height: 100%;
      width: 0%;
      background: #e8465a;
      border-radius: 2px;
      transition: width 0.15s ease;
    }
    .export-cancel-btn {
      margin-top: 18px;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.5);
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      padding: 6px 18px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .export-cancel-btn:hover {
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.8);
    }
    /* Export Settings Modal */
    .export-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 400;
      font-family: 'Inter', sans-serif;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .export-modal {
      background: rgba(18,18,22,0.98);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 28px 32px 24px;
      width: 380px;
      max-width: 90vw;
      box-shadow: 0 24px 80px rgba(0,0,0,0.6);
    }
    .export-modal h2 {
      font-size: 16px;
      font-weight: 600;
      color: rgba(255,255,255,0.9);
      margin: 0 0 6px 0;
      letter-spacing: -0.01em;
    }
    .export-modal .modal-subtitle {
      font-size: 12px;
      color: rgba(255,255,255,0.35);
      margin: 0 0 22px 0;
    }
    .export-modal-group {
      margin-bottom: 16px;
    }
    .export-modal-group label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 7px;
    }
    .export-modal-group select,
    .export-modal-group input[type="number"] {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: rgba(255,255,255,0.85);
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      padding: 9px 12px;
      outline: none;
      transition: border-color 0.15s ease;
      -webkit-appearance: none;
      appearance: none;
    }
    .export-modal-group select {
      background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 32px;
    }
    .export-modal-group select:focus,
    .export-modal-group input[type="number"]:focus {
      border-color: rgba(255,255,255,0.25);
    }
    .export-modal-group select option {
      background: #1a1a20;
      color: #fff;
    }
    .export-modal-row {
      display: flex;
      gap: 12px;
    }
    .export-modal-row .export-modal-group {
      flex: 1;
    }
    .export-modal-info {
      font-size: 11px;
      color: rgba(255,255,255,0.25);
      margin-top: 4px;
    }
    .export-modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
    }
    .export-modal-btn {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
      padding: 9px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
    }
    .export-modal-btn.cancel {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.5);
    }
    .export-modal-btn.cancel:hover {
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.8);
    }
    .export-modal-btn.primary {
      background: #e8465a;
      color: #fff;
    }
    .export-modal-btn.primary:hover {
      background: #d63a4d;
    }
    .export-modal-btn.primary:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .export-modal-divider {
      height: 1px;
      background: rgba(255,255,255,0.06);
      margin: 20px 0;
    }
    /* Viewport Mode */
    .viewport-active body,
    body.viewport-active {
      overflow: hidden;
    }
    .canvas-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
      z-index: 0;
    }
    .canvas-wrapper canvas {
      display: block;
    }
    .canvas-wrapper.viewport-mode {
      /* Canvas gets centered above timeline */
      top: 0;
      left: 0;
      right: 0;
      bottom: 152px; /* timeline height + gap */
      height: auto;
      background: #000000;
    }
    .canvas-wrapper.viewport-mode canvas {
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.5), 0 8px 40px rgba(0,0,0,0.6);
    }
    .viewport-size-bar {
      position: fixed;
      bottom: 168px;
      right: 20px;
      display: none;
      align-items: center;
      gap: 8px;
      background: rgba(12,12,16,0.85);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 8px;
      padding: 6px 12px;
      pointer-events: auto;
      z-index: 55;
      font-family: 'Inter', sans-serif;
    }
    .viewport-size-bar.visible {
      display: flex;
    }
    .viewport-size-bar .vp-label {
      font-size: 11px;
      font-weight: 500;
      color: rgba(255,255,255,0.5);
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
    }
    .viewport-size-bar .vp-dim {
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.85);
      font-variant-numeric: tabular-nums;
    }
    .viewport-size-bar .vp-ratio {
      font-size: 10px;
      font-weight: 500;
      color: rgba(232,70,90,0.8);
      margin-left: 2px;
    }
    .vp-divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.08);
    }
    .vp-preset-btn {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.45);
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 500;
      padding: 3px 8px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .vp-preset-btn:hover {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.85);
      border-color: rgba(255,255,255,0.15);
    }
    .vp-preset-btn.active {
      background: rgba(232,70,90,0.15);
      border-color: rgba(232,70,90,0.3);
      color: rgba(232,70,90,0.9);
    }
    .upload-toast {
      position: fixed;
      bottom: 208px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      backdrop-filter: blur(12px);
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 12px;
      color: rgba(255,255,255,0.7);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .upload-toast.show {
      opacity: 1;
    }
    /* Media Library */
    .media-library {
      position: fixed;
      right: 24px;
      top: 64px;
      bottom: 168px;
      width: 92px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: flex-end;
      pointer-events: auto;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 4px 0;
    }
    .media-library::-webkit-scrollbar { display: none; }
    .media-thumb {
      position: relative;
      width: 56px;
      height: 56px;
      border-radius: 10px;
      overflow: visible;
      cursor: pointer;
      border: 2px solid rgba(255,255,255,0.08);
      background: rgba(12,12,16,0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .media-thumb img,
    .media-thumb video {
      border-radius: 8px;
    }
    .media-thumb:hover {
      border-color: rgba(255,255,255,0.25);
      transform: scale(1.06);
    }
    .media-thumb.active {
      border-color: #e8465a;
      box-shadow: 0 0 12px rgba(232,70,90,0.3);
    }
    .media-thumb img,
    .media-thumb video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      pointer-events: none;
    }
    .media-thumb .thumb-remove {
      position: absolute;
      top: 50%;
      left: -20px;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      border-radius: 4px;
      background: rgba(255,255,255,0.06);
      border: none;
      color: rgba(255,255,255,0.35);
      font-size: 10px;
      line-height: 16px;
      text-align: center;
      cursor: pointer;
      opacity: 0;
      transition: all 0.15s ease;
      padding: 0;
      font-family: 'Inter', sans-serif;
    }
    .media-thumb:hover .thumb-remove {
      opacity: 1;
    }
    .media-thumb .thumb-remove:hover {
      background: rgba(232,70,90,0.8);
      color: #fff;
    }
    .media-thumb .thumb-type-badge {
      position: absolute;
      bottom: 2px;
      left: 2px;
      font-size: 7px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: rgba(255,255,255,0.7);
      background: rgba(0,0,0,0.6);
      padding: 1px 4px;
      border-radius: 3px;
      pointer-events: none;
    }
  </style>
  <div class="viewer-ui">
    <div class="title-bar">
      <h1>iPhone 17</h1>
      <p>3D Model Viewer</p>
    </div>

    <div class="export-dropdown" id="exportDropdown">
      <button class="export-btn" id="exportBtn">
        <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export
      </button>
      <div class="export-menu" id="exportMenu">
        <button class="export-menu-item" id="exportFrame" onclick="exportCurrentFrame()">
          <div class="emi-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <div class="emi-text"><span class="emi-label">Current Frame</span><span class="emi-desc">Export as PNG image</span></div>
        </button>
        <button class="export-menu-item" id="exportVideo" onclick="exportTimelineVideo()">
          <div class="emi-icon"><svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></div>
          <div class="emi-text"><span class="emi-label">Timeline Video</span><span class="emi-desc">Export animation as WebM</span></div>
        </button>
      </div>
    </div>
    <div class="loader-overlay" id="loader">
      <div class="spinner"></div>
      <div class="loader-text">Loading model…</div>
    </div>
    <div class="timeline-container" id="timelineContainer">
      <div class="timeline-tabs-bar" id="timelineTabsBar"></div>
      <div class="timeline-header">
        <div class="timeline-left">
          <span class="timeline-label">Timeline</span>
          <span class="timeline-time" id="timelineTimeDisplay">0.0 / 5.0s</span>
        </div>
        <div class="timeline-actions">
          <button class="tl-btn play" id="btnPlay" onclick="togglePlayback()" disabled>▶</button>
          <div class="tl-divider"></div>
          <button class="tl-btn" id="btnAddKf" onclick="addKeyframe()">+ Key</button>
          <button class="tl-btn" id="btnDeleteKf" onclick="deleteSelectedKeyframe()" disabled>− Del</button>
          <div class="tl-divider"></div>
          <button class="tl-btn" id="btnClearKf" onclick="clearAllKeyframes()" disabled>Clear</button>
        </div>
      </div>
      <div class="timeline-ruler-bar" id="timelineRulerBar"></div>
      <div class="timeline-track-area" id="timelineTrackArea" onclick="handleTrackClick(event)">
        <div class="timeline-ruler" id="timelineRuler"></div>
        <div class="timeline-track"></div>
        <div class="timeline-track-fill" id="trackFill"></div>
        <div class="timeline-playhead-group" id="playheadGroup">
          <div class="timeline-playhead-line"></div>
          <div class="timeline-playhead-badge" id="playheadBadge">0.00</div>
        </div>
      </div>
    </div>
    <div class="controls-bar">
      <button class="ctrl-btn" id="btnUpload" onclick="document.getElementById('mediaInput').click()">Upload Media</button>
      <button class="ctrl-btn" id="btnClear" onclick="clearScreen()" style="display:none;">Clear Screen</button>
      <button class="ctrl-btn" id="btnReset" onclick="resetCamera()">Reset View</button>

    </div>
    <div class="viewport-size-bar" id="viewportSizeBar">
      <span class="vp-dim" id="vpDimLabel">1920 × 1080</span>
      <div class="vp-divider"></div>
      <button class="vp-preset-btn" data-vp="flexible">Responsive</button>
      <button class="vp-preset-btn active" data-vp="1920x1080">16:9</button>
      <button class="vp-preset-btn" data-vp="1440x1080">4:3</button>
      <button class="vp-preset-btn" data-vp="1080x1080">1:1</button>
      <button class="vp-preset-btn" data-vp="1080x1440">3:4</button>
      <button class="vp-preset-btn" data-vp="1080x1920">9:16</button>
    </div>
    <input type="file" id="mediaInput" accept="image/*,video/mp4,video/webm,video/ogg" style="display:none;" onchange="handleMediaUpload(event)" />
    <div class="media-library" id="mediaLibrary"></div>
    <div class="upload-toast" id="uploadToast">
      <span id="toastMsg"></span>
    </div>
    </div>
  </div>
`;
document.body.appendChild(ui);

// State
let modelRef = null;
let wireframeOn = false;
let originalMaterials = [];
let screenMesh = null;
let screenTexture = null;
let videoElement = null;
let videoTexture = null;
let originalScreenMaterial = null;
const MEDIA_STORAGE_KEY = 'iphoneViewer_screenMedia';
const MEDIA_LIBRARY_KEY = 'iphoneViewer_mediaLibrary';

// Media library state
let mediaLibrary = []; // { id, dataUrl, type, name, thumbUrl }
let activeMediaId = null;

// Load iPhone model
const modelData = window.UPLOADED_3D_MODELS?.find(m => m.name === 'iphone 17_4.glb') ||
                  window.UPLOADED_3D_MODELS?.[0];

// Safety timeout — hide loader after 8s no matter what
setTimeout(() => {
  const loaderEl = document.getElementById('loader');
  if (loaderEl && !loaderEl.classList.contains('hidden')) {
    loaderEl.classList.add('hidden');
  }
}, 8000);

if (modelData) {
  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  const loader = new THREE.GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(modelData.dataUrl, (gltf) => {
    const model = gltf.scene;
    model.name = 'iphoneModel';

    // Center and scale
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) model.scale.multiplyScalar(2.2 / maxDim);
    box.setFromObject(model);
    box.getCenter(center);
    model.position.sub(center);

    // Enable shadows, fix z-fighting, and store materials
    let triCount = 0;
    let meshCount = 0;
    model.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.geometry) {
          const idx = child.geometry.index;
          triCount += idx ? idx.count / 3 : (child.geometry.attributes.position?.count || 0) / 3;
        }
        // Fix z-fighting on coplanar surfaces (e.g. screen)
        if (Array.isArray(child.material)) {
          child.material.forEach((m, i) => {
            m.polygonOffset = true;
            m.polygonOffsetFactor = i;
            m.polygonOffsetUnits = i;
            m.depthWrite = true;
          });
        } else {
          child.material.polygonOffset = true;
          child.material.polygonOffsetFactor = 1;
          child.material.polygonOffsetUnits = 1;
        }
        child.renderOrder = meshCount;
        originalMaterials.push({ mesh: child, material: child.material });

        // Detect the screen mesh (usually the largest flat face or named 'screen')
        const name = (child.name || '').toLowerCase();
        const matName = child.material && !Array.isArray(child.material) ? (child.material.name || '').toLowerCase() : '';
        if (name.includes('screen') || name.includes('display') || name.includes('lcd') ||
            matName.includes('screen') || matName.includes('display') || matName.includes('emission') || matName.includes('emissive')) {
          screenMesh = child;
          originalScreenMaterial = child.material.clone ? child.material.clone() : child.material;
        }
      }
    });

    scene.add(model);
    modelRef = model;

    // Directly target the known screen mesh by name
    model.traverse((child) => {
      if (child.isMesh && child.name === 'defaultMaterial012') {
        screenMesh = child;
        originalScreenMaterial = child.material.clone ? child.material.clone() : child.material;
        console.log('Screen mesh found: defaultMaterial012');
      }
      // Ensure defaultMaterial004 always renders above the screen
      if (child.isMesh && child.name === 'defaultMaterial004') {
        child.renderOrder = 10000;
        if (Array.isArray(child.material)) {
          child.material.forEach(m => {
            m.depthTest = true;
            m.depthWrite = true;
            m.polygonOffset = true;
            m.polygonOffsetFactor = -2;
            m.polygonOffsetUnits = -2;
          });
        } else {
          child.material.depthTest = true;
          child.material.depthWrite = true;
          child.material.polygonOffset = true;
          child.material.polygonOffsetFactor = -2;
          child.material.polygonOffsetUnits = -2;
        }
        console.log('defaultMaterial004 set to render above screen');
      }
    });



    // Hide loader
    setTimeout(() => document.getElementById('loader').classList.add('hidden'), 300);
  }, undefined, (err) => {
    console.error('Model load error:', err);
    document.querySelector('.loader-text').textContent = 'Failed to load model';
    setTimeout(() => document.getElementById('loader').classList.add('hidden'), 1500);
  });
} else {
  // No model data found — hide loader immediately
  console.warn('No 3D model data found in UPLOADED_3D_MODELS');
  document.querySelector('.loader-text').textContent = 'No model found';
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 1000);
}

window.resetCamera = () => {
  const target = { x: 0, y: 0.5, z: 5.2 };
  const start = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  const duration = 800;
  const startTime = performance.now();
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function animateReset() {
    const elapsed = performance.now() - startTime;
    const t = ease(Math.min(elapsed / duration, 1));
    camera.position.set(
      start.x + (target.x - start.x) * t,
      start.y + (target.y - start.y) * t,
      start.z + (target.z - start.z) * t
    );
    controls.target.lerp(new THREE.Vector3(0, 0, 0), t);
    if (elapsed < duration) requestAnimationFrame(animateReset);
  }
  animateReset();
};

// Media upload handler
window.handleMediaUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!screenMesh) {
    showToast('No screen surface detected on model');
    event.target.value = '';
    return;
  }

  const isVideo = file.type.startsWith('video/');

  // Read file as data URL for library storage + application
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;

    // Generate thumbnail
    if (isVideo) {
      generateVideoThumb(dataUrl, (thumbUrl) => {
        addToMediaLibrary(dataUrl, 'video', file.name, thumbUrl);
      });
    } else {
      generateImageThumb(dataUrl, (thumbUrl) => {
        addToMediaLibrary(dataUrl, 'image', file.name, thumbUrl);
      });
    }
  };
  reader.readAsDataURL(file);

  event.target.value = '';
};

function generateImageThumb(dataUrl, cb) {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = 112; c.height = 112;
    const ctx = c.getContext('2d');
    const s = Math.min(img.width, img.height);
    const sx = (img.width - s) / 2;
    const sy = (img.height - s) / 2;
    ctx.drawImage(img, sx, sy, s, s, 0, 0, 112, 112);
    cb(c.toDataURL('image/jpeg', 0.7));
  };
  img.src = dataUrl;
}

function generateVideoThumb(dataUrl, cb) {
  const vid = document.createElement('video');
  vid.muted = true;
  vid.playsInline = true;
  vid.preload = 'auto';
  vid.src = dataUrl;
  vid.addEventListener('loadeddata', () => {
    vid.currentTime = Math.min(0.5, vid.duration / 2);
  });
  vid.addEventListener('seeked', () => {
    const c = document.createElement('canvas');
    c.width = 112; c.height = 112;
    const ctx = c.getContext('2d');
    const s = Math.min(vid.videoWidth, vid.videoHeight);
    const sx = (vid.videoWidth - s) / 2;
    const sy = (vid.videoHeight - s) / 2;
    ctx.drawImage(vid, sx, sy, s, s, 0, 0, 112, 112);
    cb(c.toDataURL('image/jpeg', 0.7));
    vid.src = '';
  });
}

function addToMediaLibrary(dataUrl, type, name, thumbUrl) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const item = { id, dataUrl, type, name, thumbUrl };
  mediaLibrary.push(item);
  saveMediaLibrary();
  applyMediaItem(item);
  renderMediaLibrary();
  showToast((type === 'video' ? 'Video' : 'Image') + ' added to library');
}

function applyMediaItem(item) {
  if (!screenMesh) return;

  // Clean up previous
  cleanupMedia();
  activeMediaId = item.id;

  if (item.type === 'video') {
    videoElement = document.createElement('video');
    videoElement.src = item.dataUrl;
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.crossOrigin = 'anonymous';
    videoElement.addEventListener('loadeddata', () => {
      videoTexture = new THREE.VideoTexture(videoElement);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBAFormat;
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      applyTextureToScreen(videoTexture);
      videoElement.play();
    });
  } else {
    const img = new Image();
    img.onload = () => {
      screenTexture = new THREE.Texture(img);
      screenTexture.needsUpdate = true;
      screenTexture.colorSpace = THREE.SRGBColorSpace;
      screenTexture.minFilter = THREE.LinearFilter;
      screenTexture.magFilter = THREE.LinearFilter;
      applyTextureToScreen(screenTexture);
    };
    img.src = item.dataUrl;
  }

  document.getElementById('btnClear').style.display = '';
  renderMediaLibrary();
}

function removeFromMediaLibrary(id) {
  const idx = mediaLibrary.findIndex(m => m.id === id);
  if (idx < 0) return;
  mediaLibrary.splice(idx, 1);

  if (activeMediaId === id) {
    // If there are other items, apply the last one; otherwise clear
    if (mediaLibrary.length > 0) {
      applyMediaItem(mediaLibrary[mediaLibrary.length - 1]);
    } else {
      window.clearScreen();
      activeMediaId = null;
    }
  }

  saveMediaLibrary();
  renderMediaLibrary();
  showToast('Removed from library');
}

function renderMediaLibrary() {
  const container = document.getElementById('mediaLibrary');
  if (!container) return;
  container.innerHTML = '';

  mediaLibrary.forEach(item => {
    const thumb = document.createElement('div');
    thumb.className = 'media-thumb' + (item.id === activeMediaId ? ' active' : '');

    if (item.type === 'video') {
      const img = document.createElement('img');
      img.src = item.thumbUrl || '';
      img.alt = item.name;
      thumb.appendChild(img);
    } else {
      const img = document.createElement('img');
      img.src = item.thumbUrl || item.dataUrl;
      img.alt = item.name;
      thumb.appendChild(img);
    }

    // Type badge
    const badge = document.createElement('span');
    badge.className = 'thumb-type-badge';
    badge.textContent = item.type === 'video' ? 'VID' : 'IMG';
    thumb.appendChild(badge);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'thumb-remove';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFromMediaLibrary(item.id);
    });
    thumb.appendChild(removeBtn);

    // Click to apply
    thumb.addEventListener('click', () => {
      applyMediaItem(item);
    });

    container.appendChild(thumb);
  });
}

function saveMediaLibrary() {
  try {
    // Save only thumbnails + metadata to avoid localStorage size limits
    // Full dataUrls are stored for the session; thumbs persist across reloads
    const saveable = mediaLibrary.map(m => ({
      id: m.id,
      dataUrl: m.dataUrl,
      type: m.type,
      name: m.name,
      thumbUrl: m.thumbUrl
    }));
    localStorage.setItem(MEDIA_LIBRARY_KEY, JSON.stringify(saveable));
  } catch (e) {
    console.warn('Could not save media library (storage full?):', e);
    // If full dataUrls won't fit, save thumbs only so UI still renders
    try {
      const thumbsOnly = mediaLibrary.map(m => ({
        id: m.id,
        type: m.type,
        name: m.name,
        thumbUrl: m.thumbUrl
      }));
      localStorage.setItem(MEDIA_LIBRARY_KEY, JSON.stringify(thumbsOnly));
    } catch (e2) {
      console.warn('Could not save even thumbnails:', e2);
    }
  }
}

function loadMediaLibrary() {
  try {
    const raw = localStorage.getItem(MEDIA_LIBRARY_KEY);
    if (!raw) return;
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return;
    mediaLibrary = items;
    renderMediaLibrary();

    // If any items have dataUrls, apply the last one to restore the screen
    const withData = mediaLibrary.filter(m => m.dataUrl);
    if (withData.length > 0) {
      // Wait for screenMesh
      const waitForScreen = setInterval(() => {
        if (!screenMesh) return;
        clearInterval(waitForScreen);
        applyMediaItem(withData[withData.length - 1]);
      }, 200);
      setTimeout(() => clearInterval(waitForScreen), 10000);
    }
  } catch (e) {
    console.warn('Could not load media library:', e);
  }
}

function applyTextureToScreen(texture) {
  if (!screenMesh) return;

  // Ensure the mesh has UVs; if not, generate planar UVs
  const geo = screenMesh.geometry;
  if (!geo.attributes.uv) {
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const size = new THREE.Vector3();
    bb.getSize(size);
    const pos = geo.attributes.position;
    const uvs = new Float32Array(pos.count * 2);

    // Determine which two axes to use for UV (skip the thinnest axis)
    const dims = [
      { axis: 0, size: size.x },
      { axis: 1, size: size.y },
      { axis: 2, size: size.z }
    ].sort((a, b) => a.size - b.size);
    const uAxis = dims[2].axis; // largest
    const vAxis = dims[1].axis; // second largest
    const minU = [bb.min.x, bb.min.y, bb.min.z][uAxis];
    const minV = [bb.min.x, bb.min.y, bb.min.z][vAxis];
    const sizeU = dims[2].size || 1;
    const sizeV = dims[1].size || 1;

    for (let i = 0; i < pos.count; i++) {
      const coords = [pos.getX(i), pos.getY(i), pos.getZ(i)];
      uvs[i * 2] = (coords[uAxis] - minU) / sizeU;
      uvs[i * 2 + 1] = (coords[vAxis] - minV) / sizeV;
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  }

  // Reset any previous texture transforms
  texture.center.set(0, 0);
  texture.rotation = 0;
  texture.repeat.set(1, 1);
  texture.offset.set(0, 0);

  // Remap UVs to orient and fit the texture properly on the screen mesh
  const uvAttr = geo.attributes.uv;
  geo.computeBoundingBox();
  const bb2 = geo.boundingBox;
  const pos2 = geo.attributes.position;

  // Find the two dominant axes of the screen mesh (skip thinnest)
  const bSize = new THREE.Vector3();
  bb2.getSize(bSize);
  const axisSizes = [
    { axis: 0, size: bSize.x },
    { axis: 1, size: bSize.y },
    { axis: 2, size: bSize.z }
  ].sort((a, b) => b.size - a.size);
  const majorAxis = axisSizes[0].axis; // longest = height of phone
  const minorAxis = axisSizes[1].axis; // second = width of phone
  const meshH = axisSizes[0].size || 1;
  const meshW = axisSizes[1].size || 1;
  const meshAspect = meshH / meshW;

  const majorMin = [bb2.min.x, bb2.min.y, bb2.min.z][majorAxis];
  const minorMin = [bb2.min.x, bb2.min.y, bb2.min.z][minorAxis];

  // Get texture source aspect
  let texW = 1, texH = 1;
  if (texture.image) {
    texW = texture.image.videoWidth || texture.image.width || 1;
    texH = texture.image.videoHeight || texture.image.height || 1;
  }
  const texAspect = texW / texH;

  // Compute contain-fit scale (show entire texture, may letterbox)
  let scaleU = 1, scaleV = 1;
  if (texAspect > 1 / meshAspect) {
    // Texture is wider relative to mesh — fit width, letterbox top/bottom
    scaleU = 1;
    scaleV = meshW / (texAspect * meshH);
  } else {
    // Texture is taller relative to mesh — fit height, pillarbox sides
    scaleV = 1;
    scaleU = (texAspect * meshH) / meshW;
  }

  // Rewrite UVs: major axis → V (bottom-to-top), minor axis → U (left-to-right)
  const newUvs = new Float32Array(pos2.count * 2);
  for (let i = 0; i < pos2.count; i++) {
    const coords = [pos2.getX(i), pos2.getY(i), pos2.getZ(i)];
    // Normalized 0-1 across mesh
    const u = (coords[minorAxis] - minorMin) / meshW;
    const v = (coords[majorAxis] - majorMin) / meshH;
    // Apply cover-fit: scale from center and clamp
    newUvs[i * 2]     = 0.5 + (u - 0.5) / scaleU;
    newUvs[i * 2 + 1] = 0.5 + (v - 0.5) / scaleV;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(newUvs, 2));
  geo.attributes.uv.needsUpdate = true;

  texture.needsUpdate = true;

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  screenMesh.material = mat;
  screenMesh.renderOrder = 9999;
}

function cleanupMedia() {
  if (videoElement) {
    videoElement.pause();
    videoElement.src = '';
    videoElement = null;
  }
  if (videoTexture) {
    videoTexture.dispose();
    videoTexture = null;
  }
  if (screenTexture) {
    screenTexture.dispose();
    screenTexture = null;
  }
}

window.clearScreen = () => {
  if (!screenMesh || !originalScreenMaterial) return;
  cleanupMedia();
  activeMediaId = null;
  screenMesh.material = originalScreenMaterial;
  screenMesh.renderOrder = 0;
  document.getElementById('btnClear').style.display = 'none';
  renderMediaLibrary();
  showToast('Screen restored to original');
};

function showToast(msg) {
  const toast = document.getElementById('uploadToast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}



// ── Multi-Timeline Keyframe System ──
const LOCALSTORAGE_KEY = 'iphoneViewer_timelines';
const TIMELINE_DURATION = 5; // seconds

// Each timeline: { id, name, keyframes: [], segmentEasings: [] }
let timelines = [];
let activeTimelineId = null;

// Active timeline accessors
function getActiveTimeline() {
  return timelines.find(tl => tl.id === activeTimelineId) || null;
}
function getKeyframes() {
  const tl = getActiveTimeline();
  return tl ? tl.keyframes : [];
}
function getSegmentEasings() {
  const tl = getActiveTimeline();
  return tl ? tl.segmentEasings : [];
}

// Convenience aliases used throughout the code
// (these are getter-based so they always reflect the active timeline)
let selectedKfIndex = -1;
let openEasingSegment = -1;
let isPlaying = false;
let playbackTime = 0;
let playbackRAF = null;
let isDraggingPlayhead = false;
let isDraggingKeyframe = false;
let isEditingKeyframe = false;
let editingKfIndex = -1;
let editGraceFrames = 0;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createTimeline(name) {
  const tl = {
    id: generateId(),
    name: name || ('Timeline ' + (timelines.length + 1)),
    keyframes: [],
    segmentEasings: []
  };
  timelines.push(tl);
  return tl;
}

function switchToTimeline(id) {
  if (isPlaying) stopPlayback();
  selectedKfIndex = -1;
  openEasingSegment = -1;
  isEditingKeyframe = false;
  editingKfIndex = -1;
  activeTimelineId = id;
  playbackTime = 0;
  prevCamPos.copy(camera.position);
  prevCamTarget.copy(controls.target);
  prevCamFov = camera.fov;
  updatePlayhead(0);
  renderKeyframes();
  updateTimelineButtons();
  renderTimelineTabs();
  saveAllToStorage();
}

function deleteTimeline(id) {
  if (timelines.length <= 1) {
    showToast('Cannot delete the only timeline');
    return;
  }
  if (isPlaying) stopPlayback();
  const idx = timelines.findIndex(tl => tl.id === id);
  if (idx < 0) return;
  timelines.splice(idx, 1);
  if (activeTimelineId === id) {
    activeTimelineId = timelines[0].id;
    selectedKfIndex = -1;
    openEasingSegment = -1;
    isEditingKeyframe = false;
    editingKfIndex = -1;
    playbackTime = 0;
    updatePlayhead(0);
  }
  renderKeyframes();
  updateTimelineButtons();
  renderTimelineTabs();
  saveAllToStorage();
  showToast('Timeline deleted');
}

function renameTimeline(id, newName) {
  const tl = timelines.find(t => t.id === id);
  if (tl) {
    tl.name = newName.trim() || tl.name;
    saveAllToStorage();
  }
}

function renderTimelineTabs() {
  const bar = document.getElementById('timelineTabsBar');
  if (!bar) return;
  bar.innerHTML = '';

  timelines.forEach(tl => {
    const tab = document.createElement('div');
    tab.className = 'timeline-tab' + (tl.id === activeTimelineId ? ' active' : '');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'timeline-tab-name';
    nameSpan.textContent = tl.name;
    tab.appendChild(nameSpan);

    const kfCount = document.createElement('span');
    kfCount.style.cssText = 'font-size:9px;color:rgba(255,255,255,0.2);margin-left:2px;';
    kfCount.textContent = tl.keyframes.length > 0 ? `(${tl.keyframes.length})` : '';
    tab.appendChild(kfCount);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTimeline(tl.id);
    });
    tab.appendChild(closeBtn);

    // Click to switch
    tab.addEventListener('click', (e) => {
      if (e.target.closest('.tab-close')) return;
      if (nameSpan.getAttribute('contenteditable') === 'true') return;
      switchToTimeline(tl.id);
    });

    // Double-click to rename
    tab.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      nameSpan.setAttribute('contenteditable', 'true');
      nameSpan.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(nameSpan);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      const finish = () => {
        nameSpan.removeAttribute('contenteditable');
        renameTimeline(tl.id, nameSpan.textContent);
        renderTimelineTabs();
      };
      nameSpan.addEventListener('blur', finish, { once: true });
      nameSpan.addEventListener('keydown', (ke) => {
        if (ke.key === 'Enter') {
          ke.preventDefault();
          nameSpan.blur();
        }
      });
    });

    bar.appendChild(tab);
  });

  // Add button
  const addBtn = document.createElement('button');
  addBtn.className = 'tab-add-btn';
  addBtn.textContent = '+';
  addBtn.title = 'New timeline';
  addBtn.addEventListener('click', () => {
    const tl = createTimeline();
    switchToTimeline(tl.id);
    showToast('Created ' + tl.name);
  });
  bar.appendChild(addBtn);
}

// Easing functions library
const EASING_TYPES = {
  linear:    { label: 'Linear',     fn: t => t,                                                    path: 'M2,22 L22,2' },
  easeInOut: { label: 'Ease In/Out',fn: t => t * t * (3 - 2 * t),                                 path: 'M2,22 C8,22 16,2 22,2' },
  easeIn:    { label: 'Ease In',    fn: t => t * t * t,                                            path: 'M2,22 C12,22 18,8 22,2' },
  easeOut:   { label: 'Ease Out',   fn: t => 1 - Math.pow(1 - t, 3),                              path: 'M2,22 C6,16 12,2 22,2' },
  easeInQuad:{ label: 'In Quad',    fn: t => t * t,                                                path: 'M2,22 C10,22 16,10 22,2' },
  easeOutQuad:{label: 'Out Quad',   fn: t => 1 - (1 - t) * (1 - t),                               path: 'M2,22 C8,14 14,2 22,2' },
  easeInOutQuint:{ label: 'In/Out 5',fn: t => t < 0.5 ? 16*t*t*t*t*t : 1-Math.pow(-2*t+2,5)/2,   path: 'M2,22 C4,22 20,2 22,2' },
  bounce:    { label: 'Bounce',     fn: t => {
    const n1=7.5625,d1=2.75;
    if(t<1/d1) return n1*t*t;
    else if(t<2/d1) return n1*(t-=1.5/d1)*t+0.75;
    else if(t<2.5/d1) return n1*(t-=2.25/d1)*t+0.9375;
    else return n1*(t-=2.625/d1)*t+0.984375;
  }, path: 'M2,22 C6,2 8,18 12,12 C14,8 16,10 18,6 C19,4 20,4 22,2' }
};

function getEasingForSegment(segIndex) {
  return getSegmentEasings()[segIndex] || 'easeInOut';
}

function setEasingForSegment(segIndex, type) {
  getSegmentEasings()[segIndex] = type;
  saveAllToStorage();
  renderKeyframes();
}

// Connector icon SVG path for the easing type
function getConnectorIconPath(type) {
  return EASING_TYPES[type]?.path || EASING_TYPES.easeInOut.path;
}

// Save all timelines to localStorage
function saveAllToStorage() {
  const data = timelines.map(tl => ({
    id: tl.id,
    name: tl.name,
    keyframes: tl.keyframes.map(kf => ({
      time: kf.time,
      position: { x: kf.position.x, y: kf.position.y, z: kf.position.z },
      target: { x: kf.target.x, y: kf.target.y, z: kf.target.z },
      fov: kf.fov
    })),
    segmentEasings: [...tl.segmentEasings]
  }));
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify({ timelines: data, activeId: activeTimelineId }));
  } catch (e) {
    console.warn('Could not save timelines:', e);
  }
}

// Load timelines from localStorage (with migration from old single-timeline format)
function loadTimelinesFromStorage() {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!raw) return false;
    let parsed = JSON.parse(raw);

    // Migrate old single-timeline format
    if (parsed.keyframes || Array.isArray(parsed)) {
      let oldKfs, oldEasings;
      if (Array.isArray(parsed)) {
        oldKfs = parsed;
        oldEasings = [];
      } else {
        oldKfs = parsed.keyframes || [];
        oldEasings = parsed.easings || [];
      }
      const tl = createTimeline('Timeline 1');
      oldKfs.forEach(kf => {
        tl.keyframes.push({
          time: kf.time,
          position: new THREE.Vector3(kf.position.x, kf.position.y, kf.position.z),
          target: new THREE.Vector3(kf.target.x, kf.target.y, kf.target.z),
          fov: kf.fov
        });
      });
      oldEasings.forEach((e, i) => { tl.segmentEasings[i] = e; });
      tl.keyframes.sort((a, b) => a.time - b.time);
      activeTimelineId = tl.id;
      return true;
    }

    // New multi-timeline format
    if (parsed.timelines && Array.isArray(parsed.timelines)) {
      parsed.timelines.forEach(tlData => {
        const tl = {
          id: tlData.id || generateId(),
          name: tlData.name || 'Timeline',
          keyframes: [],
          segmentEasings: tlData.segmentEasings || []
        };
        (tlData.keyframes || []).forEach(kf => {
          tl.keyframes.push({
            time: kf.time,
            position: new THREE.Vector3(kf.position.x, kf.position.y, kf.position.z),
            target: new THREE.Vector3(kf.target.x, kf.target.y, kf.target.z),
            fov: kf.fov
          });
        });
        tl.keyframes.sort((a, b) => a.time - b.time);
        timelines.push(tl);
      });
      activeTimelineId = parsed.activeId || (timelines[0] && timelines[0].id);
      return true;
    }
  } catch (e) {
    console.warn('Could not load timelines:', e);
  }
  return false;
}

// Restore on startup
const didLoad = loadTimelinesFromStorage();
if (!didLoad) {
  // Create a default timeline with a pre-built orbit animation
  const defaultTl = createTimeline('Orbit Demo');
  activeTimelineId = defaultTl.id;

  // Pre-populate with a smooth orbit around the model
  const orbitRadius = 5.2;
  const orbitY = 0.5;
  const targetY = 0;
  const fov = 40;
  const angles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5, Math.PI * 2];
  const times = [0, 0.25, 0.5, 0.75, 1.0];

  angles.forEach((angle, i) => {
    defaultTl.keyframes.push({
      time: times[i],
      position: new THREE.Vector3(
        Math.sin(angle) * orbitRadius,
        orbitY,
        Math.cos(angle) * orbitRadius
      ),
      target: new THREE.Vector3(0, targetY, 0),
      fov: fov
    });
    if (i < angles.length - 1) {
      defaultTl.segmentEasings[i] = 'easeInOut';
    }
  });

  // Create a second pre-built timeline — Zoom Reveal
  const zoomTl = createTimeline('Zoom Reveal');

  const zoomKeyframes = [
    { time: 0.0,  pos: [0, 0.5, 5.2],   tgt: [0, 0, 0],     fov: 40 },   // start: full view
    { time: 0.2,  pos: [0.3, 1.2, 2.0],  tgt: [0, 1.0, 0],   fov: 30 },   // zoom into top
    { time: 0.4,  pos: [0.3, 1.1, 1.6],  tgt: [0, 0.95, 0],  fov: 26 },   // close-up top
    { time: 0.6,  pos: [0.3, -0.4, 1.6], tgt: [0, -0.5, 0],  fov: 26 },   // pan down to bottom close-up
    { time: 0.8,  pos: [0.3, -0.3, 2.0], tgt: [0, -0.4, 0],  fov: 30 },   // ease out slightly
    { time: 1.0,  pos: [0, 0.5, 5.2],    tgt: [0, 0, 0],     fov: 40 },   // zoom out to full view
  ];

  zoomKeyframes.forEach((kf, i) => {
    zoomTl.keyframes.push({
      time: kf.time,
      position: new THREE.Vector3(...kf.pos),
      target: new THREE.Vector3(...kf.tgt),
      fov: kf.fov
    });
    if (i < zoomKeyframes.length - 1) {
      // Smooth ease for zoom in/out, linear for the pan down the phone
      zoomTl.segmentEasings[i] = (i === 2 || i === 3) ? 'easeInOut' : 'easeInOut';
    }
  });
}
renderTimelineTabs();
renderKeyframes();
updateTimelineButtons();
if (getKeyframes().length > 0) {
  const total = timelines.reduce((s, tl) => s + tl.keyframes.length, 0);
  if (didLoad) {
    showToast(`Restored ${total} keyframe${total > 1 ? 's' : ''} across ${timelines.length} timeline${timelines.length > 1 ? 's' : ''}`);
  } else {
    showToast('Demo timeline ready — press ▶ to preview');
  }
}

// Restore media library on startup
loadMediaLibrary();

window.addKeyframe = () => {
  const keyframes = getKeyframes();
  if (!keyframes) return;
  controls.update();

  // If a keyframe is selected or being edited, update it instead of adding a new one
  const editIdx = (isEditingKeyframe && editingKfIndex >= 0) ? editingKfIndex : selectedKfIndex;
  if (editIdx >= 0 && editIdx < keyframes.length) {
    const kf = keyframes[editIdx];
    kf.position.copy(camera.position);
    kf.target.copy(controls.target);
    kf.fov = camera.fov;
    // Sync prev values so editing detection doesn't re-trigger
    prevCamPos.copy(camera.position);
    prevCamTarget.copy(controls.target);
    prevCamFov = camera.fov;
    renderKeyframes();
    saveAllToStorage();
    showToast(`Keyframe at ${(kf.time * TIMELINE_DURATION).toFixed(1)}s updated`);
    return;
  }

  const t = playbackTime / TIMELINE_DURATION;
  const kf = {
    time: t,
    position: camera.position.clone(),
    target: controls.target.clone(),
    fov: camera.fov
  };
  keyframes.push(kf);
  keyframes.sort((a, b) => a.time - b.time);
  selectedKfIndex = keyframes.indexOf(kf);
  renderKeyframes();
  updateTimelineButtons();
  renderTimelineTabs();
  saveAllToStorage();
  showToast(`Keyframe added at ${(t * TIMELINE_DURATION).toFixed(1)}s`);
};

window.deleteSelectedKeyframe = () => {
  const keyframes = getKeyframes();
  if (selectedKfIndex < 0 || selectedKfIndex >= keyframes.length) return;
  keyframes.splice(selectedKfIndex, 1);
  selectedKfIndex = -1;
  renderKeyframes();
  updateTimelineButtons();
  renderTimelineTabs();
  saveAllToStorage();
  showToast('Keyframe deleted');
};

window.clearAllKeyframes = () => {
  const tl = getActiveTimeline();
  if (!tl) return;
  tl.keyframes.length = 0;
  tl.segmentEasings.length = 0;
  selectedKfIndex = -1;
  openEasingSegment = -1;
  stopPlayback();
  renderKeyframes();
  updateTimelineButtons();
  renderTimelineTabs();
  saveAllToStorage();
  showToast('All keyframes cleared');
};

window.togglePlayback = () => {
  if (isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
};

function startPlayback() {
  if (getKeyframes().length < 2) {
    showToast('Add at least 2 keyframes to play');
    return;
  }
  isPlaying = true;
  controls.enabled = false;
  playbackTime = 0;
  updatePlayhead(0);

  // Restart video from beginning if one is playing on screen
  if (videoElement) {
    videoElement.currentTime = 0;
    videoElement.play();
  }
  document.getElementById('btnPlay').textContent = '⏸';
  const startT = performance.now();
  const startOffset = 0;

  function tick() {
    if (!isPlaying) return;
    const elapsed = (performance.now() - startT) / 1000;
    playbackTime = startOffset + elapsed;
    if (playbackTime >= TIMELINE_DURATION) {
      playbackTime = 0;
      stopPlayback();
      return;
    }
    const normalT = playbackTime / TIMELINE_DURATION;
    updatePlayhead(normalT);
    interpolateCamera(normalT);
    camera.lookAt(controls.target);
    renderer.render(scene, camera);
    playbackRAF = requestAnimationFrame(tick);
  }
  playbackRAF = requestAnimationFrame(tick);
}

function stopPlayback() {
  isPlaying = false;
  // Sync OrbitControls internal state to the current camera pose
  // so it doesn't snap/drift when damping resumes
  controls.target.copy(controls.target); // already set by interpolation
  controls.enabled = true;
  // Reset damping by forcing an internal update at current position
  controls.update();
document.getElementById('btnPlay').textContent = '▶';
    if (playbackRAF) cancelAnimationFrame(playbackRAF);
  playbackRAF = null;
}

function interpolateCamera(t) {
  const keyframes = getKeyframes();
  if (keyframes.length === 0) return;
  if (keyframes.length === 1) {
    camera.position.copy(keyframes[0].position);
    controls.target.copy(keyframes[0].target);
    return;
  }
  // Find surrounding keyframes
  let i1 = 0, i2 = 1;
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (t >= keyframes[i].time && t <= keyframes[i + 1].time) {
      i1 = i;
      i2 = i + 1;
      break;
    }
    if (t > keyframes[i + 1].time) {
      i1 = i + 1;
      i2 = i + 1;
    }
  }
  if (i1 === i2) {
    camera.position.copy(keyframes[i1].position);
    controls.target.copy(keyframes[i1].target);
    camera.fov = keyframes[i1].fov;
    camera.updateProjectionMatrix();
    camera.lookAt(controls.target);
    return;
  }
  const kfA = keyframes[i1];
  const kfB = keyframes[i2];
  const segLen = kfB.time - kfA.time;
  const localT = segLen > 0 ? (t - kfA.time) / segLen : 0;
  // Apply per-segment easing
  const easingType = getEasingForSegment(i1);
  const easingFn = EASING_TYPES[easingType]?.fn || EASING_TYPES.easeInOut.fn;
  const s = easingFn(localT);

  camera.position.lerpVectors(kfA.position, kfB.position, s);
  const tgt = new THREE.Vector3().lerpVectors(kfA.target, kfB.target, s);
  controls.target.copy(tgt);
  camera.fov = kfA.fov + (kfB.fov - kfA.fov) * s;
  camera.updateProjectionMatrix();
  camera.lookAt(tgt);
}

function updatePlayhead(t) {
  const pct = (t * 100) + '%';
  document.getElementById('playheadGroup').style.left = pct;
  document.getElementById('trackFill').style.width = pct;
  const badge = document.getElementById('playheadBadge');
  badge.textContent = (t * TIMELINE_DURATION).toFixed(2);
  document.getElementById('timelineTimeDisplay').textContent =
    (t * TIMELINE_DURATION).toFixed(1) + ' / ' + TIMELINE_DURATION.toFixed(1) + 's';
  // Update badge color based on editing state
  if (isEditingKeyframe) {
    badge.classList.add('editing');
  } else {
    badge.classList.remove('editing');
  }
}

function scrubToPosition(clientX) {
  const rect = document.getElementById('timelineTrackArea').getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  playbackTime = x * TIMELINE_DURATION;
  updatePlayhead(x);
  // Exit editing mode if scrubbing away from the keyframe
  checkPlayheadOnKeyframe();
  if (getKeyframes().length >= 2) {
    interpolateCamera(x);
    // Sync prev camera values so editing detection doesn't fire from interpolation
    prevCamPos.copy(camera.position);
    prevCamTarget.copy(controls.target);
    prevCamFov = camera.fov;
    renderer.render(scene, camera);
  }
}

// Snap threshold in normalized time (0-1) — ~0.5% of timeline
const KF_SNAP_THRESHOLD = 0.005;

function checkPlayheadOnKeyframe() {
  // Only enter editing mode when user explicitly clicks a keyframe diamond,
  // not during scrubbing. This function now only EXIT editing mode when
  // the playhead moves away from the editing keyframe.
  if (!isEditingKeyframe) return;

  const keyframes = getKeyframes();
  const normalT = playbackTime / TIMELINE_DURATION;

  // If we're editing a keyframe, check if we've moved away from it
  if (editingKfIndex >= 0 && editingKfIndex < keyframes.length) {
    const dist = Math.abs(keyframes[editingKfIndex].time - normalT);
    if (dist > KF_SNAP_THRESHOLD) {
      isEditingKeyframe = false;
      editingKfIndex = -1;
      prevCamPos.copy(camera.position);
      prevCamTarget.copy(controls.target);
      prevCamFov = camera.fov;
      renderKeyframes();
      updateTimelineButtons();
    }
  }
}

function updateEditingKeyframeFromCamera() {
  if (!isEditingKeyframe || editingKfIndex < 0) return;
  const keyframes = getKeyframes();
  if (editingKfIndex >= keyframes.length) return;
  const kf = keyframes[editingKfIndex];
  kf.position.copy(camera.position);
  kf.target.copy(controls.target);
  kf.fov = camera.fov;
  saveAllToStorage();
}

window.handleTrackClick = (e) => {
  // Don't handle if clicking on a keyframe diamond
  if (e.target.closest('.timeline-keyframe')) return;
  // Clicking on the track exits editing mode
  if (isEditingKeyframe) {
    isEditingKeyframe = false;
    editingKfIndex = -1;
    renderKeyframes();
    updateTimelineButtons();
  }
  scrubToPosition(e.clientX);
};

function startPlayheadDrag(e) {
  if (isDraggingKeyframe) return;
  isDraggingPlayhead = true;
  if (isPlaying) stopPlayback();

  // Deselect any selected/editing keyframe when dragging the playhead
  if (selectedKfIndex >= 0 || isEditingKeyframe) {
    selectedKfIndex = -1;
    isEditingKeyframe = false;
    editingKfIndex = -1;
    prevCamPos.copy(camera.position);
    prevCamTarget.copy(controls.target);
    prevCamFov = camera.fov;
    renderKeyframes();
    updateTimelineButtons();
  }

  scrubToPosition(e.clientX);

  const onMove = (me) => {
    if (!isDraggingPlayhead) return;
    me.preventDefault();
    scrubToPosition(me.clientX);
  };
  const onUp = () => {
    isDraggingPlayhead = false;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

document.getElementById('timelineTrackArea').addEventListener('mousedown', (e) => {
  if (e.target.closest('.timeline-keyframe')) return;
  startPlayheadDrag(e);
});

// Make the playhead group itself draggable
const playheadGroupEl = document.getElementById('playheadGroup');
playheadGroupEl.style.pointerEvents = 'auto';
playheadGroupEl.style.cursor = 'grab';
playheadGroupEl.addEventListener('mousedown', (e) => {
  e.stopPropagation();
  playheadGroupEl.style.cursor = 'grabbing';
  startPlayheadDrag(e);
  const restoreCursor = () => {
    playheadGroupEl.style.cursor = 'grab';
    window.removeEventListener('mouseup', restoreCursor);
  };
  window.addEventListener('mouseup', restoreCursor);
});

function closeEasingPanel() {
  openEasingSegment = -1;
  document.querySelectorAll('.easing-panel').forEach(el => el.remove());
  document.querySelectorAll('.easing-connector').forEach(el => el.classList.remove('active'));
}

function openEasingPanelFor(segIndex, connectorEl) {
  // Toggle off if already open
  if (openEasingSegment === segIndex) {
    closeEasingPanel();
    return;
  }
  closeEasingPanel();
  openEasingSegment = segIndex;
  connectorEl.classList.add('active');

  const panel = document.createElement('div');
  panel.className = 'easing-panel';

  const title = document.createElement('div');
  title.className = 'easing-panel-title';
  title.textContent = 'Segment Easing';
  panel.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'easing-options';

  const currentEasing = getEasingForSegment(segIndex);

  Object.entries(EASING_TYPES).forEach(([key, val]) => {
    const opt = document.createElement('div');
    opt.className = 'easing-option' + (key === currentEasing ? ' selected' : '');
    opt.innerHTML = `
      <div class="easing-option-curve">
        <svg viewBox="0 0 24 24"><path d="${val.path}"/></svg>
      </div>
      <span class="easing-option-label">${val.label}</span>
    `;
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      setEasingForSegment(segIndex, key);
      closeEasingPanel();
      showToast(`Easing: ${val.label}`);
    });
    grid.appendChild(opt);
  });

  panel.appendChild(grid);

  // Stop clicks inside panel from propagating to track
  panel.addEventListener('mousedown', e => e.stopPropagation());
  panel.addEventListener('click', e => e.stopPropagation());

  connectorEl.appendChild(panel);
}

// Close easing panel when clicking elsewhere + deselect keyframe when clicking outside
document.addEventListener('mousedown', (e) => {
  if (openEasingSegment >= 0 && !e.target.closest('.easing-panel') && !e.target.closest('.easing-connector')) {
    closeEasingPanel();
  }

    // Deselect keyframe when clicking outside timeline keyframes/track
    if (selectedKfIndex >= 0 || isEditingKeyframe) {
      const isOnKeyframe = e.target.closest('.timeline-keyframe');
      const isOnEasing = e.target.closest('.easing-connector') || e.target.closest('.easing-panel');
      const isOnTimelineBtn = e.target.closest('.tl-btn');
      const isOnCanvas = e.target === renderer.domElement;
      const isOnControlsBar = e.target.closest('.controls-bar');
      const isOnPlayheadBadge = e.target.closest('.timeline-playhead-badge');
      // Keep selected when interacting with: canvas (for camera editing), keyframes, easing, buttons, playhead
      if (!isOnKeyframe && !isOnEasing && !isOnTimelineBtn && !isOnCanvas && !isOnControlsBar && !isOnPlayheadBadge) {
        selectedKfIndex = -1;
        isEditingKeyframe = false;
        editingKfIndex = -1;
        prevCamPos.copy(camera.position);
        prevCamTarget.copy(controls.target);
        prevCamFov = camera.fov;
        renderKeyframes();
        updateTimelineButtons();
      }
    }
});

// Delete selected keyframe with Backspace or Delete key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace' || e.key === 'Delete') {
    // Don't trigger if user is typing in an input/contenteditable
    const tag = document.activeElement?.tagName?.toLowerCase();
    const isEditable = document.activeElement?.getAttribute('contenteditable') === 'true';
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || isEditable) return;

    if (selectedKfIndex >= 0 && selectedKfIndex < getKeyframes().length) {
      e.preventDefault();
      window.deleteSelectedKeyframe();
    }
  }
});

function renderKeyframes() {
  const keyframes = getKeyframes();
  const area = document.getElementById('timelineTrackArea');
  area.querySelectorAll('.timeline-keyframe').forEach(el => el.remove());
  area.querySelectorAll('.easing-connector').forEach(el => el.remove());

  // Render easing connector buttons between keyframes
  for (let i = 0; i < keyframes.length - 1; i++) {
    const kfA = keyframes[i];
    const kfB = keyframes[i + 1];
    const midPct = ((kfA.time + kfB.time) / 2) * 100;

    const conn = document.createElement('div');
    conn.className = 'easing-connector' + (openEasingSegment === i ? ' active' : '');
    conn.style.left = midPct + '%';

    const easingType = getEasingForSegment(i);
    const iconPath = getConnectorIconPath(easingType);
    conn.innerHTML = `<svg viewBox="0 0 24 24"><path d="${iconPath}"/></svg>`;

    const segIdx = i;
    conn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEasingPanelFor(segIdx, conn);
    });
    conn.addEventListener('mousedown', (e) => e.stopPropagation());
    area.appendChild(conn);
  }

  const kfList = keyframes;
  kfList.forEach((kf, i) => {
    const diamond = document.createElement('div');
    const isEditing = isEditingKeyframe && i === editingKfIndex;
    diamond.className = 'timeline-keyframe' + (isEditing ? ' editing' : (i === selectedKfIndex ? ' active' : ''));
    diamond.style.left = (kf.time * 100) + '%';
    diamond.innerHTML = `<span class="kf-time">${(kf.time * TIMELINE_DURATION).toFixed(1)}s</span>`;
    diamond.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedKfIndex = i;
      // Jump camera to this keyframe and enter editing mode
      if (!isPlaying) {
        // Exit any previous editing state first
        isEditingKeyframe = false;
        editingKfIndex = -1;

        camera.position.copy(kf.position);
        controls.target.copy(kf.target);
        camera.fov = kf.fov;
        camera.updateProjectionMatrix();
        camera.lookAt(kf.target);

        // Fully reset OrbitControls internal state to prevent damping drift
        controls.enableDamping = false;
        controls.update();
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;

        playbackTime = kf.time * TIMELINE_DURATION;
        updatePlayhead(kf.time);

        // Now enter editing mode for this keyframe
        editingKfIndex = i;
        isEditingKeyframe = true;
        // Sync prev values AFTER controls settle so we don't trigger false edits
        prevCamPos.copy(camera.position);
        prevCamTarget.copy(controls.target);
        prevCamFov = camera.fov;
        // Mark a grace frame to ignore initial damping settle
        editGraceFrames = 3;
      }
      renderKeyframes();
      updateTimelineButtons();
    });
    // Allow dragging keyframes with real-time camera interpolation
    let dragging = false;
    diamond.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      dragging = true;
      isDraggingKeyframe = true;
      if (isPlaying) stopPlayback();
      selectedKfIndex = i;
      area.querySelectorAll('.timeline-keyframe').forEach(el => el.classList.remove('active'));
      diamond.classList.add('active');
      diamond.classList.add('dragging');
      controls.enabled = false;
      updateTimelineButtons();
      playbackTime = kf.time * TIMELINE_DURATION;
      updatePlayhead(kf.time);
      camera.position.copy(kf.position);
      controls.target.copy(kf.target);
      camera.fov = kf.fov;
      camera.updateProjectionMatrix();
      camera.lookAt(kf.target);
      const onMove = (me) => {
        if (!dragging) return;
        me.preventDefault();
        const rect = area.getBoundingClientRect();
        const nx = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
        kf.time = nx;
        diamond.style.left = (nx * 100) + '%';
        diamond.querySelector('.kf-time').textContent = (nx * TIMELINE_DURATION).toFixed(1) + 's';
        const connectors = area.querySelectorAll('.easing-connector');
        const sortedKfs = [...getKeyframes()].sort((a, b) => a.time - b.time);
        connectors.forEach((conn, ci) => {
          if (ci < sortedKfs.length - 1) {
            const midPct = ((sortedKfs[ci].time + sortedKfs[ci + 1].time) / 2) * 100;
            conn.style.left = midPct + '%';
          }
        });
        playbackTime = nx * TIMELINE_DURATION;
        updatePlayhead(nx);
        if (getKeyframes().length >= 2) {
          interpolateCamera(nx);
          renderer.render(scene, camera);
        }
      };
      const onUp = () => {
        dragging = false;
        isDraggingKeyframe = false;
        diamond.classList.remove('dragging');
        controls.enabled = true;
        controls.update();
        const kfs = getKeyframes();
        kfs.sort((a, b) => a.time - b.time);
        selectedKfIndex = kfs.indexOf(kf);
        renderKeyframes();
        saveAllToStorage();
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });
    area.appendChild(diamond);
  });
}

function updateTimelineButtons() {
  const keyframes = getKeyframes();
  document.getElementById('btnDeleteKf').disabled = selectedKfIndex < 0;
  document.getElementById('btnPlay').disabled = keyframes.length < 2;
  document.getElementById('btnClearKf').disabled = keyframes.length === 0;
}

// Build ruler ticks
function buildRuler() {
  const bar = document.getElementById('timelineRulerBar');
  bar.innerHTML = '';
  const totalTicks = TIMELINE_DURATION * 4; // 4 subdivisions per second
  for (let i = 0; i <= totalTicks; i++) {
    const pct = (i / totalTicks) * 100;
    const isSecond = (i % 4 === 0);
    if (isSecond) {
      const label = document.createElement('span');
      label.className = 'ruler-tick-label';
      label.style.left = pct + '%';
      label.textContent = (i / 4) + 's';
      bar.appendChild(label);
    } else {
      const dot = document.createElement('span');
      dot.className = 'ruler-dot';
      dot.style.left = pct + '%';
      bar.appendChild(dot);
    }
  }
}
buildRuler();

// Make ruler bar clickable for scrubbing — shares the same horizontal range as the track area
document.getElementById('timelineRulerBar').addEventListener('mousedown', (e) => {
  if (isPlaying) stopPlayback();
  isDraggingPlayhead = true;
  // Use the track area rect for consistent left/width mapping
  const trackRect = document.getElementById('timelineTrackArea').getBoundingClientRect();
  const rulerRect = document.getElementById('timelineRulerBar').getBoundingClientRect();
  // Ruler and track share the same left margin, so map clientX against trackRect
  const x = Math.max(0, Math.min(1, (e.clientX - trackRect.left) / trackRect.width));
  playbackTime = x * TIMELINE_DURATION;
  updatePlayhead(x);
  if (getKeyframes().length >= 2) {
    interpolateCamera(x);
    renderer.render(scene, camera);
  }

  const onMove = (me) => {
    if (!isDraggingPlayhead) return;
    me.preventDefault();
    scrubToPosition(me.clientX);
  };
  const onUp = () => {
    isDraggingPlayhead = false;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
});

// Extend the playhead line up through the ruler bar
// but leave room for the badge to sit just above the ruler
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .timeline-playhead-group {
      top: -20px !important;
    }
  `;
  document.head.appendChild(style);
})();

// ── Export Functions ──
let exportCancelled = false;

// Toggle export dropdown
document.getElementById('exportBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  const menu = document.getElementById('exportMenu');
  menu.classList.toggle('open');
  // Disable video export if < 2 keyframes
  document.getElementById('exportVideo').disabled = getKeyframes().length < 2;
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.export-dropdown')) {
    document.getElementById('exportMenu').classList.remove('open');
  }
});

window.exportCurrentFrame = () => {
  document.getElementById('exportMenu').classList.remove('open');

  // Render one frame at full resolution with preserveDrawingBuffer
  const w = renderer.domElement.width;
  const h = renderer.domElement.height;

  // Create a temporary renderer with preserveDrawingBuffer
  const tmpRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  tmpRenderer.setSize(window.innerWidth, window.innerHeight);
  tmpRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  tmpRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  tmpRenderer.toneMappingExposure = 1.2;
  tmpRenderer.shadowMap.enabled = true;
  tmpRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  tmpRenderer.logarithmicDepthBuffer = true;
  tmpRenderer.render(scene, camera);

  const dataUrl = tmpRenderer.domElement.toDataURL('image/png');
  tmpRenderer.dispose();

  const link = document.createElement('a');
  link.download = 'frame_' + new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-') + '.png';
  link.href = dataUrl;
  link.click();

  showToast('Frame exported as PNG');
};

window.exportTimelineVideo = async () => {
  const keyframes = getKeyframes();
  if (keyframes.length < 2) {
    showToast('Need at least 2 keyframes');
    return;
  }

  document.getElementById('exportMenu').classList.remove('open');
  if (isPlaying) stopPlayback();

  // Show settings modal
  const settings = await showExportSettingsModal();
  if (!settings) return; // user cancelled

  controls.enabled = false;
  exportCancelled = false;

  // Show progress overlay
  const overlay = document.createElement('div');
  overlay.className = 'export-progress-overlay';
  overlay.id = 'exportOverlay';
  overlay.innerHTML = `
    <div class="spinner"></div>
    <div class="export-progress-text" id="exportProgressText">Preparing video export…</div>
    <div class="export-progress-bar-outer"><div class="export-progress-bar-inner" id="exportProgressBar"></div></div>
    <button class="export-cancel-btn" id="exportCancelBtn">Cancel</button>
  `;
  document.body.appendChild(overlay);

  document.getElementById('exportCancelBtn').addEventListener('click', () => {
    exportCancelled = true;
  });

  const fps = settings.fps;
  const totalFrames = Math.ceil(TIMELINE_DURATION * fps);

  // Create offscreen renderer with preserveDrawingBuffer
  const exportW = settings.width;
  const exportH = settings.height;

  const offRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  offRenderer.setSize(exportW, exportH, false);
  offRenderer.setPixelRatio(1);
  offRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  offRenderer.toneMappingExposure = 1.2;
  offRenderer.shadowMap.enabled = true;
  offRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  offRenderer.logarithmicDepthBuffer = true;

  const exportCamera = camera.clone();
  exportCamera.aspect = exportW / exportH;
  exportCamera.updateProjectionMatrix();

  // Use canvas.captureStream + MediaRecorder
  const stream = offRenderer.domElement.captureStream(0); // 0 = manual frame capture
  const chunks = [];

  // Codec selection based on settings
  let mimeType;
  if (settings.codec === 'vp9') {
    mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8';
  } else if (settings.codec === 'vp8') {
    mimeType = 'video/webm;codecs=vp8';
  } else {
    mimeType = 'video/webm';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

  const recorder = new MediaRecorder(stream, {
    mimeType: mimeType,
    videoBitsPerSecond: settings.bitrate * 1000000
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const recorderReady = new Promise((resolve) => {
    recorder.onstop = () => resolve();
  });

  recorder.start();

  const progressBar = document.getElementById('exportProgressBar');
  const progressText = document.getElementById('exportProgressText');

  // Render each frame at exact real-time pacing so the recorder
  // produces a video whose duration matches TIMELINE_DURATION.
  const frameDuration = 1000 / fps; // ms per frame

  for (let frame = 0; frame <= totalFrames; frame++) {
    if (exportCancelled) break;

    const t = frame / totalFrames; // 0..1
    const progress = ((frame / totalFrames) * 100).toFixed(0);

    progressText.textContent = `Rendering frame ${frame}/${totalFrames} (${progress}%)`;
    progressBar.style.width = progress + '%';

    // Interpolate camera for this frame
    interpolateCameraForExport(t, exportCamera);

    offRenderer.render(scene, exportCamera);

    // Request frame from stream
    const track = stream.getVideoTracks()[0];
    if (track.requestFrame) {
      track.requestFrame();
    }

    // Wait exactly one frame duration in real-time so that the
    // MediaRecorder timestamps each frame correctly.
    await new Promise(r => setTimeout(r, frameDuration));
  }

  // Give the recorder a moment to flush the last frames
  await new Promise(r => setTimeout(r, 300));

  progressText.textContent = 'Finalizing video…';
  progressBar.style.width = '100%';

  recorder.stop();
  await recorderReady;

  offRenderer.dispose();

  // Remove overlay
  const ov = document.getElementById('exportOverlay');
  if (ov) ov.remove();

  controls.enabled = true;

  if (exportCancelled) {
    showToast('Export cancelled');
    return;
  }

  // Download the video
  const blob = new Blob(chunks, { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'timeline_' + new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-') + '.webm';
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  const sizeMB = (blob.size / (1024 * 1024)).toFixed(1);
  showToast(`Video exported (${exportW}×${exportH}, ${fps}fps, ${sizeMB}MB)`);
};

function showExportSettingsModal() {
  return new Promise((resolve) => {
    const PRESETS = {
      '1080p': { w: 1920, h: 1080 },
      '720p':  { w: 1280, h: 720 },
      '480p':  { w: 854, h: 480 },
      '4K':    { w: 3840, h: 2160 },
      'Square 1080': { w: 1080, h: 1080 },
      'Vertical 1080': { w: 1080, h: 1920 },
      'Current viewport': { w: Math.round(window.innerWidth * Math.min(window.devicePixelRatio, 2)), h: Math.round(window.innerHeight * Math.min(window.devicePixelRatio, 2)) },
      'Custom': { w: 1920, h: 1080 }
    };

    const overlay = document.createElement('div');
    overlay.className = 'export-modal-overlay';

    overlay.innerHTML = `
      <div class="export-modal">
        <h2>Export Video</h2>
        <p class="modal-subtitle">Configure render settings before exporting</p>

        <div class="export-modal-group">
          <label>Resolution</label>
          <select id="expResolution">
          </select>
        </div>
        <div class="export-modal-info" id="expResInfo"></div>
        <input type="hidden" id="expWidth" value="1920" />
        <input type="hidden" id="expHeight" value="1080" />

        <div class="export-modal-divider"></div>

        <div class="export-modal-row">
          <div class="export-modal-group">
            <label>Frame Rate</label>
            <select id="expFps">
              <option value="24">24 fps</option>
              <option value="30" selected>30 fps</option>
              <option value="60">60 fps</option>
            </select>
          </div>
          <div class="export-modal-group">
            <label>Codec</label>
            <select id="expCodec">
              <option value="vp9" selected>VP9 (better quality)</option>
              <option value="vp8">VP8 (wider support)</option>
            </select>
          </div>
        </div>

        <div class="export-modal-group">
          <label>Bitrate (Mbps)</label>
          <select id="expBitrate">
            <option value="4">4 Mbps (small file)</option>
            <option value="8" selected>8 Mbps (balanced)</option>
            <option value="16">16 Mbps (high quality)</option>
            <option value="32">32 Mbps (maximum)</option>
          </select>
        </div>

        <div class="export-modal-info" id="expEstimate">Estimated: ~150 frames · ~${TIMELINE_DURATION.toFixed(1)}s duration</div>

        <div class="export-modal-actions">
          <button class="export-modal-btn cancel" id="expCancel">Cancel</button>
          <button class="export-modal-btn primary" id="expStart">Export Video</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const resSel = overlay.querySelector('#expResolution');
    const resInfo = overlay.querySelector('#expResInfo');
    const widthInput = overlay.querySelector('#expWidth');
    const heightInput = overlay.querySelector('#expHeight');
    const fpsSel = overlay.querySelector('#expFps');
    const estimateEl = overlay.querySelector('#expEstimate');

    // Build resolution options based on current viewport aspect ratio
    const vpAspect = vpSize.w / vpSize.h;
    const baseHeights = [2160, 1440, 1080, 720, 480];
    const resOptions = baseHeights.map(h => {
      const w = Math.round(h * vpAspect);
      // Ensure even dimensions for video encoding
      return { w: w % 2 === 0 ? w : w + 1, h: h % 2 === 0 ? h : h + 1 };
    });
    // Add current viewport native size
    const nativeW = vpSize.w % 2 === 0 ? vpSize.w : vpSize.w + 1;
    const nativeH = vpSize.h % 2 === 0 ? vpSize.h : vpSize.h + 1;
    const hasNative = resOptions.some(r => r.w === nativeW && r.h === nativeH);
    if (!hasNative) {
      resOptions.push({ w: nativeW, h: nativeH });
      resOptions.sort((a, b) => b.h - a.h);
    }

    // Compute aspect ratio label
    const g = gcd(vpSize.w, vpSize.h);
    let ratioLabel = `${vpSize.w / g}:${vpSize.h / g}`;
    if (Math.abs(vpAspect - 16/9) < 0.02) ratioLabel = '16:9';
    else if (Math.abs(vpAspect - 9/16) < 0.02) ratioLabel = '9:16';
    else if (Math.abs(vpAspect - 4/3) < 0.02) ratioLabel = '4:3';
    else if (Math.abs(vpAspect - 3/4) < 0.02) ratioLabel = '3:4';
    else if (Math.abs(vpAspect - 1) < 0.02) ratioLabel = '1:1';

    resInfo.textContent = `Aspect ratio: ${ratioLabel} (from viewport)`;

    let defaultIdx = resOptions.findIndex(r => r.h === 1080);
    if (defaultIdx < 0) defaultIdx = resOptions.findIndex(r => r.w === nativeW && r.h === nativeH);
    if (defaultIdx < 0) defaultIdx = 0;

    resSel.innerHTML = '';
    resOptions.forEach((r, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      const isNative = r.w === nativeW && r.h === nativeH;
      const label = r.h >= 2160 ? '4K' : r.h >= 1440 ? 'QHD' : r.h >= 1080 ? 'Full HD' : r.h >= 720 ? 'HD' : 'SD';
      opt.textContent = `${r.w} × ${r.h}` + (isNative ? ' (native)' : ` (${label})`);
      if (idx === defaultIdx) opt.selected = true;
      resSel.appendChild(opt);
    });

    widthInput.value = resOptions[defaultIdx].w;
    heightInput.value = resOptions[defaultIdx].h;

    function updateEstimate() {
      const fps = parseInt(fpsSel.value);
      const frames = Math.ceil(TIMELINE_DURATION * fps);
      const selIdx = parseInt(resSel.value);
      const r = resOptions[selIdx];
      estimateEl.textContent = `Estimated: ~${frames} frames · ${TIMELINE_DURATION.toFixed(1)}s duration · ${r.w}×${r.h}`;
    }

    resSel.addEventListener('change', () => {
      const selIdx = parseInt(resSel.value);
      const r = resOptions[selIdx];
      widthInput.value = r.w;
      heightInput.value = r.h;
      updateEstimate();
    });

    fpsSel.addEventListener('change', updateEstimate);
    updateEstimate();

    // Close on overlay background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(null);
      }
    });

    overlay.querySelector('#expCancel').addEventListener('click', () => {
      overlay.remove();
      resolve(null);
    });

    overlay.querySelector('#expStart').addEventListener('click', () => {
      const w = Math.max(320, Math.min(7680, parseInt(widthInput.value) || 1920));
      const h = Math.max(240, Math.min(4320, parseInt(heightInput.value) || 1080));
      const fps = parseInt(fpsSel.value) || 30;
      const codec = overlay.querySelector('#expCodec').value;
      const bitrate = parseFloat(overlay.querySelector('#expBitrate').value) || 8;
      overlay.remove();
      resolve({ width: w, height: h, fps, codec, bitrate });
    });

    // Escape key to close
    const onKey = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        resolve(null);
        window.removeEventListener('keydown', onKey);
      }
    };
    window.addEventListener('keydown', onKey);
  });
}

function interpolateCameraForExport(t, cam) {
  const keyframes = getKeyframes();
  if (keyframes.length === 0) return;
  if (keyframes.length === 1) {
    cam.position.copy(keyframes[0].position);
    cam.fov = keyframes[0].fov;
    cam.updateProjectionMatrix();
    cam.lookAt(keyframes[0].target);
    return;
  }
  let i1 = 0, i2 = 1;
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (t >= keyframes[i].time && t <= keyframes[i + 1].time) {
      i1 = i;
      i2 = i + 1;
      break;
    }
    if (t > keyframes[i + 1].time) {
      i1 = i + 1;
      i2 = i + 1;
    }
  }
  if (i1 === i2) {
    cam.position.copy(keyframes[i1].position);
    cam.fov = keyframes[i1].fov;
    cam.updateProjectionMatrix();
    cam.lookAt(keyframes[i1].target);
    return;
  }
  const kfA = keyframes[i1];
  const kfB = keyframes[i2];
  const segLen = kfB.time - kfA.time;
  const localT = segLen > 0 ? (t - kfA.time) / segLen : 0;
  const easingType = getEasingForSegment(i1);
  const easingFn = EASING_TYPES[easingType]?.fn || EASING_TYPES.easeInOut.fn;
  const s = easingFn(localT);

  cam.position.lerpVectors(kfA.position, kfB.position, s);
  const tgt = new THREE.Vector3().lerpVectors(kfA.target, kfB.target, s);
  cam.fov = kfA.fov + (kfB.fov - kfA.fov) * s;
  cam.updateProjectionMatrix();
  cam.lookAt(tgt);
}

// Animation loop
const clock = new THREE.Clock();
let prevCamPos = new THREE.Vector3();
let prevCamTarget = new THREE.Vector3();
let prevCamFov = 0;

function animate() {
  requestAnimationFrame(animate);
  if (!isPlaying) {
    controls.update();

    // Detect if camera moved while editing a keyframe — update it live
    if (isEditingKeyframe && editingKfIndex >= 0 && editingKfIndex < getKeyframes().length) {
      // Skip grace frames after snapping to avoid damping false positives
      if (editGraceFrames > 0) {
        editGraceFrames--;
        prevCamPos.copy(camera.position);
        prevCamTarget.copy(controls.target);
        prevCamFov = camera.fov;
      } else {
        const posDist = camera.position.distanceTo(prevCamPos);
        const tgtDist = controls.target.distanceTo(prevCamTarget);
        const fovDelta = Math.abs(camera.fov - prevCamFov);
        // Use a small threshold to ignore floating-point drift from damping
        const camMoved = posDist > 0.0005 || tgtDist > 0.0005 || fovDelta > 0.01;
        if (camMoved) {
          const kf = getKeyframes()[editingKfIndex];
          kf.position.copy(camera.position);
          kf.target.copy(controls.target);
          kf.fov = camera.fov;
          saveAllToStorage();
        }
      }
    }

    prevCamPos.copy(camera.position);
    prevCamTarget.copy(controls.target);
    prevCamFov = camera.fov;

    renderer.render(scene, camera);
  }
}
animate();

// ── Viewport Mode ──
let viewportModeActive = true;
let vpSize = { w: 1920, h: 1080 };
let canvasWrapper = null;

function gcd(a, b) {
  a = Math.round(a); b = Math.round(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function initCanvasWrapper() {
  // Wrap the renderer canvas in a container div
  canvasWrapper = document.createElement('div');
  canvasWrapper.className = 'canvas-wrapper';
  canvasWrapper.id = 'canvasWrapper';
  renderer.domElement.parentNode.insertBefore(canvasWrapper, renderer.domElement);
  canvasWrapper.appendChild(renderer.domElement);
}

function applyViewportSize() {
  if (!viewportModeActive) return;

  const timelineH = 152; // timeline container height + margin
  const sizeBarH = 40;
  const availW = window.innerWidth;
  const availH = window.innerHeight - timelineH - sizeBarH - 20;

  // Fit vpSize into available area while maintaining aspect ratio
  const aspect = vpSize.w / vpSize.h;
  let renderW, renderH;

  if (availW / availH > aspect) {
    // Constrained by height
    renderH = Math.min(availH, vpSize.h);
    renderW = Math.round(renderH * aspect);
  } else {
    // Constrained by width
    renderW = Math.min(availW - 40, vpSize.w);
    renderH = Math.round(renderW / aspect);
  }

  // Ensure minimum size
  renderW = Math.max(200, renderW);
  renderH = Math.max(120, renderH);

  renderer.setSize(renderW, renderH);
  renderer.domElement.style.borderRadius = '8px';
  renderer.domElement.style.boxShadow = '0 4px 32px rgba(0,0,0,0.5)';

  camera.aspect = renderW / renderH;
  camera.updateProjectionMatrix();

  // Update labels
  const dimLabel = document.getElementById('vpDimLabel');
  const ratioLabel = document.getElementById('vpRatioLabel');
  if (dimLabel) dimLabel.textContent = `${vpSize.w} × ${vpSize.h}`;
  if (ratioLabel) {
    const r = vpSize.w / vpSize.h;
    let ratioStr = '';
    if (Math.abs(r - 16/9) < 0.02) ratioStr = '16:9';
    else if (Math.abs(r - 9/16) < 0.02) ratioStr = '9:16';
    else if (Math.abs(r - 4/3) < 0.02) ratioStr = '4:3';
    else if (Math.abs(r - 3/4) < 0.02) ratioStr = '3:4';
    else if (Math.abs(r - 1) < 0.02) ratioStr = '1:1';
    else if (Math.abs(r - 21/9) < 0.03) ratioStr = '21:9';
    else {
      const g = gcd(vpSize.w, vpSize.h);
      ratioStr = `${vpSize.w/g}:${vpSize.h/g}`;
    }
    ratioLabel.textContent = ratioStr;
  }
}

function enterViewportMode() {
  viewportModeActive = true;
  document.body.classList.add('viewport-active');
  canvasWrapper.classList.add('viewport-mode');
  document.getElementById('viewportSizeBar').classList.add('visible');
  applyViewportSize();
}





// Viewport preset buttons
document.querySelectorAll('.vp-preset-btn[data-vp]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.vp-preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (btn.dataset.vp === 'flexible') {
      // Flexible mode: fill available space, no fixed aspect ratio
      viewportModeActive = false;
      canvasWrapper.classList.remove('viewport-mode');
      renderer.domElement.style.borderRadius = '';
      renderer.domElement.style.boxShadow = '';
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const dimLabel = document.getElementById('vpDimLabel');
      const ratioLabel = document.getElementById('vpRatioLabel');
      if (dimLabel) dimLabel.textContent = `${window.innerWidth} × ${window.innerHeight}`;
      if (ratioLabel) ratioLabel.textContent = 'Flexible';
      return;
    }

    const [w, h] = btn.dataset.vp.split('x').map(Number);
    vpSize.w = w;
    vpSize.h = h;
    // Re-enter viewport mode if coming from flexible
    if (!viewportModeActive) {
      viewportModeActive = true;
      canvasWrapper.classList.add('viewport-mode');
    }
    applyViewportSize();
  });
});

// Init wrapper on startup
initCanvasWrapper();
// Always start in viewport mode
enterViewportMode();

// Handle resize
window.addEventListener('resize', () => {
  if (viewportModeActive) {
    applyViewportSize();
  } else {
    // Flexible mode — fill window
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    const dimLabel = document.getElementById('vpDimLabel');
    if (dimLabel) dimLabel.textContent = `${window.innerWidth} × ${window.innerHeight}`;
  }
});