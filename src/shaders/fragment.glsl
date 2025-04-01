precision mediump float;

// Uniforms
uniform sampler2D tDiffuse;
uniform float u_amount;

// Varyings de entrada
in vec2 vUv;

// Salida
out vec4 fragColor;

void main() {
    vec2 uv = vUv;
    float amount = u_amount * 0.01;
    float r = texture2D(tDiffuse, vec2(uv.x + amount, uv.y)).r;
    float g = texture2D(tDiffuse, uv).g;
    float b = texture2D(tDiffuse, vec2(uv.x - amount, uv.y)).b;
    fragColor = vec4(r, g, b, 1.0);
}