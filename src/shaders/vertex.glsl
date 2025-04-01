precision mediump float;

// Atributos de entrada
in vec3 position;
in vec2 uv;

// Uniforms
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

// Varyings de salida
out vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}