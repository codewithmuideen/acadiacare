/** GLSL shared by the hero transition and the scroll world. */

// Ashima Arts 2D simplex noise (MIT), compact form
export const noise = /* glsl */ `
vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`

export const fullscreenVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const heroFragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex1;
uniform sampler2D uTex2;
uniform vec2 uRes;
uniform vec2 uImg1;
uniform vec2 uImg2;
uniform vec2 uPos1;   // object-position per image (0..1)
uniform vec2 uPos2;
uniform float uProgress;
uniform float uTime;
uniform float uHover;
uniform vec2 uMouse;
uniform vec2 uOrigin;
uniform vec3 uTint;
varying vec2 vUv;

${noise}

vec2 cover(vec2 uv, vec2 res, vec2 img, vec2 pos) {
  float rs = res.x / res.y;
  float ri = img.x / img.y;
  vec2 scale = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  vec2 offset = (1.0 - scale) * pos;
  return uv * scale + offset;
}

vec3 sampleRGB(sampler2D t, vec2 uv, float ca) {
  return vec3(texture2D(t, uv + vec2(ca, 0.0)).r, texture2D(t, uv).g, texture2D(t, uv - vec2(ca, 0.0)).b);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;

  // Cursor lens: gentle bulge around the pointer
  vec2 md = uv - uMouse; md.x *= aspect;
  float mdist = length(md);
  float lens = smoothstep(0.32, 0.0, mdist) * uHover;
  uv -= vec2(md.x / aspect, md.y) * lens * 0.18;

  // Liquid wavefront expanding from the origin, shaped by layered noise
  vec2 o = uv - uOrigin; o.x *= aspect;
  float r = length(o);
  float n = snoise(uv * 2.6 + uTime * 0.12) * 0.6 + snoise(uv * 7.5 - uTime * 0.08) * 0.25;
  float reach = length(vec2(aspect, 1.0)) + 0.5;
  float front = uProgress * (reach + 0.5) - 0.25;
  float m = smoothstep(front + 0.16, front - 0.16, r + n * 0.22);
  float edge = clamp(m * (1.0 - m) * 4.0, 0.0, 1.0);

  vec2 dir = normalize(vec2(o.x / aspect, o.y) + 1e-5);
  float breathe = sin(uTime * 0.25) * 0.006;

  // Outgoing image is pushed outward and slowly zooms; incoming settles in
  float z1 = 1.0 - 0.05 * uProgress + breathe;
  float z2 = 1.12 - 0.12 * smoothstep(0.0, 1.0, uProgress) + breathe;
  vec2 uv1 = (uv - 0.5) * z1 + 0.5 + dir * edge * 0.09 + n * 0.015 * edge;
  vec2 uv2 = (uv - 0.5) * z2 + 0.5 - dir * (1.0 - m) * 0.1;

  vec2 c1 = cover(uv1, uRes, uImg1, uPos1);
  vec2 c2 = cover(uv2, uRes, uImg2, uPos2);

  float ca = edge * 0.014 + lens * 0.004;
  vec3 col1 = sampleRGB(uTex1, c1, ca);
  vec3 col2 = sampleRGB(uTex2, c2, ca);
  vec3 col = mix(col1, col2, m);

  // Soft brand-coloured light at the wavefront
  col += uTint * edge * 0.28;
  col = mix(col, col * 1.06, lens);

  gl_FragColor = vec4(col, 1.0);
}
`

export const planeVertex = /* glsl */ `
varying vec2 vUv;
uniform float uBend;
void main() {
  vUv = uv;
  vec3 p = position;
  p.z += sin(uv.x * 3.14159) * uBend;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

export const planeFragment = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
uniform float uOpacity;
uniform float uSat;
uniform vec2 uSize;
uniform float uRadius;
varying vec2 vUv;
float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = sdRoundBox(p, uSize * 0.5, uRadius);
  float a = 1.0 - smoothstep(-0.004, 0.004, d);
  vec3 c = texture2D(uMap, vUv).rgb;
  float g = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(g) * vec3(1.02, 0.98, 0.96), c, uSat);
  gl_FragColor = vec4(c, a * uOpacity);
}
`
