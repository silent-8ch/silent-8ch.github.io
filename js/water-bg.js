// create a single procedural-background canvas inside .background-container (no iframe)
(function(){
  const container = document.querySelector('.background-container');
  if(!container) return;

  // three.js setup
  const scene = new THREE.Scene();
  const clock = new THREE.Clock();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.border = '0';
  renderer.domElement.style.pointerEvents = 'none';
  renderer.domElement.style.zIndex = '-1';
  container.appendChild(renderer.domElement);

  // camera & fullscreen plane
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 2, 5);
  camera.lookAt(0,0,0);

  const geom = new THREE.PlaneGeometry(1,1);
  const planeDistance = 1.0;
  const tmpDir = new THREE.Vector3();

  // shader material (copied from water.html)
  const mat = new THREE.ShaderMaterial({
    uniforms: { t: { value: 0.0 } },
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float t;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
      }

      float lfnoise(vec2 p) {
        float n = 0.0;
        float amp = 0.6;
        for(int i = 0; i < 4; i++) {
          n += amp * hash(p);
          p *= 2.0;
          amp *= 0.5;
        }
        return n;
      }

      float causticLayer(vec2 uv, float time, float scale, float baseDistort, float cellOffsetBase, float animSpeed) {
        float lf = lfnoise(uv * 0.6 + vec2(time * 0.02, -time * 0.015));
        float distortAmp = baseDistort + lf * 0.02;
        uv += vec2(sin(uv.y * 6.0 + time * 0.6 * animSpeed), cos(uv.x * 6.0 - time * 0.5 * animSpeed)) * distortAmp;

        uv *= scale;
        vec2 i = floor(uv);
        vec2 f = fract(uv);

        float minDist = 1.0;
        float secondMinDist = 1.0;

        for(int y = -1; y <= 1; y++) {
          for(int x = -1; x <= 1; x++) {
            vec2 p = vec2(x, y);
            vec2 seed = i + p;
            float cellNoise = hash(seed);
            float angle = cellNoise * 6.28318530718 + time * 0.45 + lf * 0.8;
            float offsetAmp = cellOffsetBase + cellNoise * 0.14;
            vec2 offset = vec2(cos(angle), sin(angle)) * offsetAmp;
            vec2 cell = p + offset;
            float dist = length(f - cell);
            if(dist < minDist) {
              secondMinDist = minDist;
              minDist = dist;
            } else if(dist < secondMinDist) {
              secondMinDist = dist;
            }
          }
        }

        float border = secondMinDist - minDist;
        float edge = 1.0 - smoothstep(0.005, 0.09, border);
        edge = clamp(pow(edge, 1.3) * 1.2, 0.0, 1.0);
        edge *= mix(0.6, 1.4, lf);
        return edge;
      }

      float caustics(vec2 uv, float time) {
        float sA = causticLayer(uv, time, 12.0, 0.008, 0.22, 1.0);
        float sB = causticLayer(uv, time, 30.0, 0.0025, 0.12, 0.9) * 0.20;
        float sC = causticLayer(uv, time, 6.0, 0.006, 0.20, 1.1) * 0.18;
        float combined = clamp(sA + sB + sC, 0.0, 1.2);

        float r = 0.006;
        float c0 = combined;
        float c1 = causticLayer(uv + vec2(r,0.0), time, 12.0, 0.008, 0.22, 1.0)
                 + causticLayer(uv + vec2(r,0.0), time, 30.0, 0.0025, 0.12, 0.9) * 0.20
                 + causticLayer(uv + vec2(r,0.0), time, 6.0, 0.006, 0.20, 1.1) * 0.18;
        float c2 = causticLayer(uv + vec2(-r,0.0), time, 12.0, 0.008, 0.22, 1.0)
                 + causticLayer(uv + vec2(-r,0.0), time, 30.0, 0.0025, 0.12, 0.9) * 0.20
                 + causticLayer(uv + vec2(-r,0.0), time, 6.0, 0.006, 0.20, 1.1) * 0.18;
        float c3 = causticLayer(uv + vec2(0.0,r), time, 12.0, 0.008, 0.22, 1.0)
                 + causticLayer(uv + vec2(0.0,r), time, 30.0, 0.0025, 0.12, 0.9) * 0.20
                 + causticLayer(uv + vec2(0.0,r), time, 6.0, 0.006, 0.20, 1.1) * 0.18;
        float c4 = causticLayer(uv + vec2(0.0,-r), time, 12.0, 0.008, 0.22, 1.0)
                 + causticLayer(uv + vec2(0.0,-r), time, 30.0, 0.0025, 0.12, 0.9) * 0.20
                 + causticLayer(uv + vec2(0.0,-r), time, 6.0, 0.006, 0.20, 1.1) * 0.18;

        float blurred = (c0 * 0.4 + (c1 + c2 + c3 + c4) * 0.15);
        return clamp(blurred, 0.0, 1.0);
      }

      void main() {
        vec2 uv = vUv;
        float c = caustics(uv, t);

        vec3 shallow = vec3(0.06, 0.12, 0.30);
        vec3 deep    = vec3(0.01, 0.03, 0.10);
        float g = smoothstep(0.0, 1.0, uv.y);
        vec3 base = mix(deep, shallow, g);
        vec3 caustic = vec3(1.00, 0.98, 0.85) * c * 1.4;

        vec3 color = base + caustic;
        color = color / (color + vec3(1.0));
        color = pow(color, vec3(0.92));
        gl_FragColor = vec4(color, 1.0);
      }`
  });

  const mesh = new THREE.Mesh(geom, mat);
  scene.add(mesh);

  function updateFullscreenPlane() {
    camera.updateMatrixWorld();
    camera.getWorldDirection(tmpDir);
    const height = 2 * planeDistance * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const width = height * camera.aspect;
    mesh.scale.set(width, height, 1);
    mesh.position.copy(camera.position).add(tmpDir.clone().multiplyScalar(planeDistance));
    mesh.quaternion.copy(camera.quaternion);
  }

  // initial resize + animate
  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    updateFullscreenPlane();
  }
  window.addEventListener('resize', resize, { passive: true });
  // call resize once to initialize sizes
  resize();

  (function animate(){
    requestAnimationFrame(animate);
    mat.uniforms.t.value = clock.getElapsedTime();
    updateFullscreenPlane();
    renderer.render(scene, camera);
  })();

})();