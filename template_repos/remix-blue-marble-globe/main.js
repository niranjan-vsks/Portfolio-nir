// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 50;



// Load real Earth textures from reliable CDN
const textureLoader = new THREE.TextureLoader();
const baseURL = 'https://unpkg.com/three-globe@2.34.0/example/img/';

const earthTexture = textureLoader.load(baseURL + 'earth-blue-marble.jpg');
const earthBumpMap = textureLoader.load(baseURL + 'earth-topology.png');
const earthSpecMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
const earthNightTexture = textureLoader.load(baseURL + 'earth-night.jpg');

// Subtle sunlight from behind/side for dramatic rim lighting
const sunLight = new THREE.DirectionalLight(0xffffff, 5.0);
sunLight.position.set(-20, 5, -15);
scene.add(sunLight);

// Very faint cool fill from front to see surface detail
const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight.position.set(10, 5, 20);
scene.add(fillLight);

// Subtle ambient to see dark side slightly
const ambientLight = new THREE.AmbientLight(0x111122, 0.5);
scene.add(ambientLight);



// Earth
const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
  bumpMap: earthBumpMap,
  bumpScale: 0.04,
  roughness: 1.0,
  metalness: 0.0,
  emissiveMap: earthNightTexture,
  emissive: new THREE.Color(0xffcc66),
  emissiveIntensity: 0.8,
});

// Remove green tint from the earth day texture
earthTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.colorSpace = THREE.SRGBColorSpace;

earthMaterial.onBeforeCompile = (shader) => {
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <map_fragment>',
    `
    #include <map_fragment>
    // Desaturate the texture
    float grey = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
    diffuseColor.rgb = mix(vec3(grey), diffuseColor.rgb, 0.35);
    // Cool blue-ish tint, suppress green, darken land
    diffuseColor.rgb *= vec3(0.6, 0.55, 0.85);
    diffuseColor.rgb = pow(diffuseColor.rgb, vec3(1.0, 1.2, 0.9));
    `
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <emissivemap_fragment>',
    `
    #include <emissivemap_fragment>
    // Warm city lights, suppress green
    totalEmissiveRadiance.g *= 0.55;
    totalEmissiveRadiance.b *= 0.4;
    totalEmissiveRadiance.r *= 1.2;
    `
  );
};
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.rotation.z = 0.0; // Remove tilt so planet appears centered
scene.add(earth);



// Atmosphere glow (shader)
const atmosphereGeometry = new THREE.SphereGeometry(2.15, 64, 64);
const atmosphereMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    uniform vec3 uSunDirection;
    void main() {
      float viewDot = dot(vNormal, vec3(0.0, 0.0, 1.0));
      float intensity = pow(0.7 - viewDot, 2.5);
      float sunFacing = max(0.0, dot(normalize(vNormal), uSunDirection));
      float rimSun = pow(max(0.0, dot(normalize(vNormal), -uSunDirection)), 1.5);
      vec3 atmosphereColor = mix(
        vec3(0.05, 0.12, 0.35),
        vec3(0.35, 0.6, 1.0),
        rimSun * 0.7 + sunFacing * 0.3
      );
      float alpha = intensity * (0.3 + rimSun * 0.8 + sunFacing * 0.2);
      gl_FragColor = vec4(atmosphereColor, alpha);
    }
  `,
  uniforms: {
    uSunDirection: { value: new THREE.Vector3() }
  },
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  transparent: true,
  depthWrite: false
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
earth.add(atmosphere);



// Camera position - slightly to the right, eye level
camera.position.set(2.28, 0, 6.893);
controls.target.set(0, 0, 0);
controls.update();

// Clock
const clock = new THREE.Clock();

// UI overlay
const uiDiv = document.createElement('div');
uiDiv.style.cssText = `
  position: fixed;
  top: 20px;
  left: 20px;
  color: rgba(255,255,255,0.8);
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 13px;
  pointer-events: none;
  z-index: 10;
  line-height: 1.6;
  letter-spacing: 0.3px;
`;
uiDiv.innerHTML = `
  <div style="font-size: 16px; font-weight: 600; margin-bottom: 6px; color: rgba(120,170,255,0.9);">🌍 Earth</div>
  <div style="color: rgba(255,255,255,0.35); font-size: 11px;">Drag to orbit · Scroll to zoom</div>
  <div id="info" style="margin-top: 10px; font-size: 11px; color: rgba(120,170,255,0.3);"></div>
`;
document.body.appendChild(uiDiv);

const infoEl = document.getElementById('info');

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Earth rotation - slow and dramatic
  earth.rotation.y = elapsed * 0.08;





  // Update atmosphere sun direction
  const sunDir = new THREE.Vector3().copy(sunLight.position).normalize();
  atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDir);





  // Update info
  const rotDeg = ((earth.rotation.y * 180 / Math.PI) % 360).toFixed(1);
  infoEl.textContent = `Rotation: ${rotDeg}° · Time: ${elapsed.toFixed(1)}s`;

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});