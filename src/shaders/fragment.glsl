precision mediump float;

// uniform sampler2D tDiffuse;
// uniform float noiseIntensity;
// uniform float contrast;

// varying vec2 vUv;

// void main() {
//     vec4 texel = texture(tDiffuse, vUv);
//     vec3 color = texel.rgb;

//     // Conversión a tonos verdosos
//     color = vec3(0.0, color.g * 1.5, 0.0);

//     // Ruido (grano)
//     float noise = (rand(vUv * time) - 0.5) * noiseIntensity;
//     color += noise;

//     // Bajo rango dinámico (contraste)
//     color = (color - 0.5) * contrast + 0.5;

//     // Salida final
//     gl_FragColor = vec4(color, texel.a);
// }

// // Función de ruido pseudoaleatorio (puedes usar una mejor si lo deseas)
// float rand(vec2 co) {
//     return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
// }

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D tDiffuse;
uniform float noiseIntensity;
uniform float contrast;

void main() {
    vec4 color = texture(tDiffuse, vUv);
    float noise = (fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * noiseIntensity;
    color.rgb += noise;
    color.rgb = mix(vec3(0.0), color.rgb, contrast);
    fragColor = color;
}