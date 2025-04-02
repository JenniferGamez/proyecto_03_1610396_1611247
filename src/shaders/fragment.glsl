precision mediump float;

// Uniforms
// uniform sampler2D tDiffuse;
// uniform float u_amount;

// // Varyings de entrada
// in vec2 vUv;

// // Salida
// out vec4 fragColor;

// void main() {
//     vec2 uv = vUv;
//     float amount = u_amount * 0.01;
//     float r = texture2D(tDiffuse, vec2(uv.x + amount, uv.y)).r;
//     float g = texture2D(tDiffuse, uv).g;
//     float b = texture2D(tDiffuse, vec2(uv.x - amount, uv.y)).b;
//     fragColor = vec4(r, g, b, 1.0);
// }

uniform sampler2D tDiffuse;
uniform float uBloomStrength;
uniform float uBloomRadius;

in vec2 vUv;

out vec4 FragColor;

void main() {
    vec4 texel = texture(tDiffuse, vUv);
    vec3 bloom = vec3(0.0);

    for (float i = -uBloomRadius; i <= uBloomRadius; i += 1.0) {
        for (float j = -uBloomRadius; j <= uBloomRadius; j += 1.0) {
            vec2 offset = vec2(i, j) / textureSize(tDiffuse, 0);
            bloom += texture(tDiffuse, vUv + offset).rgb;
        }
    }

    bloom /= pow((uBloomRadius * 2.0 + 1.0), 2.0);
    FragColor = vec4(texel.rgb + bloom * uBloomStrength, texel.a);
}