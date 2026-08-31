import * as THREE from 'three'

/* ------------------------------------------------------------------ *
 *  Veined marble — procedural, so it costs no texture fetch and reads
 *  cleanly at any scale. Domain-warped FBM produces the vein structure.
 * ------------------------------------------------------------------ */
export const MarbleMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uLight: { value: new THREE.Vector3(0.6, 1.0, 0.8) },
    uBase: { value: new THREE.Color('#F2EFEA') },
    uVein: { value: new THREE.Color('#B9B2A6') },
    uDark: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vPos;
    varying vec3 vView;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPos = position;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vView = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    uniform float uTime;
    uniform vec3  uLight;
    uniform vec3  uBase;
    uniform vec3  uVein;
    uniform float uDark;
    varying vec3 vNormal;
    varying vec3 vPos;
    varying vec3 vView;

    vec3 hash3(vec3 p){
      p = vec3(dot(p,vec3(127.1,311.7,74.7)),
               dot(p,vec3(269.5,183.3,246.1)),
               dot(p,vec3(113.5,271.9,124.6)));
      return fract(sin(p)*43758.5453123)*2.0-1.0;
    }

    float noise(vec3 p){
      vec3 i = floor(p), f = fract(p);
      vec3 u = f*f*(3.0-2.0*f);
      return mix(mix(mix(dot(hash3(i+vec3(0,0,0)),f-vec3(0,0,0)),
                         dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),
                     mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)),
                         dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
                 mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)),
                         dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),
                     mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)),
                         dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z);
    }

    float fbm(vec3 p){
      float v = 0.0, a = 0.5;
      for(int i=0;i<4;i++){ v += a*noise(p); p *= 2.02; a *= 0.5; }
      return v;
    }

    void main(){
      // Domain warp — this is what makes veins meander instead of stripe.
      vec3 q = vPos * 1.6;
      vec3 w = vec3(fbm(q + vec3(0.0, uTime*0.02, 0.0)),
                    fbm(q + vec3(5.2, 1.3, uTime*0.015)),
                    fbm(q + vec3(1.7, 9.2, 0.0)));
      float v = fbm(q + 2.4*w);
      float vein = smoothstep(0.42, 0.62, abs(v));
      vein = pow(vein, 1.6);

      vec3 albedo = mix(uBase, uVein, vein * 0.85);

      vec3 N = normalize(vNormal);
      vec3 L = normalize(uLight);
      vec3 V = normalize(vView);
      float diff = clamp(dot(N,L)*0.5+0.5, 0.0, 1.0);
      float fres = pow(1.0 - clamp(dot(N,V),0.0,1.0), 3.0);
      float spec = pow(clamp(dot(reflect(-L,N),V),0.0,1.0), 48.0);

      vec3 col = albedo * (0.55 + 0.55*diff);
      col += vec3(0.9,0.88,0.84) * spec * 0.35;
      col += vec3(0.66,0.55,0.40) * fres * 0.18;

      // Cross-fade the whole stone toward the dark chapters.
      col = mix(col, col * 0.22 + vec3(0.05,0.05,0.055), uDark);

      gl_FragColor = vec4(col, 1.0);
    }
  `,
}

/* ------------------------------------------------------------------ *
 *  Unlacquered brass — anisotropic-ish sheen with a warm rim.
 * ------------------------------------------------------------------ */
export const BrassMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uDark: { value: 0 },
    uTint: { value: new THREE.Color('#A98D67') },
  },
  vertexShader: /* glsl */ `
    varying vec3 vNormal; varying vec3 vView; varying vec2 vUv;
    void main(){
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position,1.0);
      vView = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    uniform float uTime; uniform float uDark; uniform vec3 uTint;
    varying vec3 vNormal; varying vec3 vView; varying vec2 vUv;

    void main(){
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vView);
      float fres = pow(1.0 - clamp(dot(N,V),0.0,1.0), 2.2);

      // Two studio strip-lights rotating slowly around the ring.
      vec3 L1 = normalize(vec3(cos(uTime*0.15), 0.9, sin(uTime*0.15)));
      vec3 L2 = normalize(vec3(-0.7, -0.4, 0.6));
      float s1 = pow(clamp(dot(reflect(-L1,N),V),0.0,1.0), 90.0);
      float s2 = pow(clamp(dot(reflect(-L2,N),V),0.0,1.0), 24.0);
      float diff = clamp(dot(N,L1)*0.5+0.5,0.0,1.0);

      vec3 col = uTint * (0.30 + 0.70*diff);
      col += vec3(1.0,0.93,0.78) * s1 * 0.85;
      col += uTint * s2 * 0.45;
      col += uTint * fres * 0.55;

      col = mix(col, col*0.55, uDark*0.4);
      gl_FragColor = vec4(col,1.0);
    }
  `,
}

/* ------------------------------------------------------------------ *
 *  Low-iron glass plane — refractive tint + edge glow, additive.
 * ------------------------------------------------------------------ */
export const GlassMaterial = {
  transparent: true,
  uniforms: {
    uTime: { value: 0 },
    uOpacity: { value: 0.16 },
    uDark: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
    void main(){
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position,1.0);
      vView = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    uniform float uTime; uniform float uOpacity; uniform float uDark;
    varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;

    void main(){
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vView);
      float fres = pow(1.0 - abs(dot(N,V)), 2.6);

      // Polished edge — brighter within 3% of the border.
      vec2 d = min(vUv, 1.0-vUv);
      float edge = 1.0 - smoothstep(0.0, 0.035, min(d.x,d.y));

      vec3 tint = mix(vec3(0.78,0.83,0.82), vec3(0.90,0.86,0.80), fres);
      float a = uOpacity + fres*0.22 + edge*0.30;

      tint = mix(tint, vec3(0.55,0.60,0.62), uDark);
      gl_FragColor = vec4(tint, a);
    }
  `,
}

/* ------------------------------------------------------------------ *
 *  Blueprint wireframe — glowing cyan-white lines on dark, with a
 *  vertical "construction sweep" that reveals the villa as you scroll.
 * ------------------------------------------------------------------ */
export const BlueprintMaterial = {
  transparent: true,
  uniforms: {
    uTime: { value: 0 },
    uBuild: { value: 0 },
    uColor: { value: new THREE.Color('#9FD6E8') },
  },
  vertexShader: /* glsl */ `
    varying vec3 vPos;
    void main(){
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    uniform float uTime; uniform float uBuild; uniform vec3 uColor;
    varying vec3 vPos;
    void main(){
      // Reveal sweeps bottom-to-top as uBuild goes 0 → 1.
      float h = vPos.y * 0.5 + 0.5;
      float reveal = smoothstep(uBuild + 0.14, uBuild - 0.06, h);
      float pulse = 0.75 + 0.25 * sin(uTime*1.6 + vPos.y*4.0);
      float edge = smoothstep(0.10, 0.0, abs(h - uBuild)) * 1.6;
      float a = reveal * pulse * 0.55 + edge * reveal;
      if (a < 0.01) discard;
      gl_FragColor = vec4(uColor + edge*0.5, a);
    }
  `,
}
