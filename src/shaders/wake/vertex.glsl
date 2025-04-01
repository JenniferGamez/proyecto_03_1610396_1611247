precision highp float;

// Varyings de entrada
in vec3 position;
in vec3 a_color;
in float a_opacity;

// Uniforms
uniform float u_time;
uniform float u_particleSize;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// Varyings de salida
out vec3 v_color;
out float v_opacity;


void main() {
    v_color = a_color;
    v_opacity = a_opacity;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = u_particleSize;
}