precision highp float;

// Varyings de entrada
in vec3 position;
in vec3 a_color;
in float a_lifeTime;
in vec3 a_velocity;

// Uniforms
uniform float u_time;
uniform vec3 u_gravity;
uniform float u_particleSize;
uniform float u_lifeTime;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// Varyings de salida
out vec3 v_color;
out float v_opacity;

void main() {
    // Tiempo de vida de la partícula
    float timeLived = mod(u_time, u_lifeTime);
    float lifeRatio = timeLived / a_lifeTime;

    // Posición
    vec3 newPosition = position + a_velocity * timeLived + 0.5 * u_gravity * timeLived * timeLived;

    // Color (desvanecer a negro)
    v_color = mix(a_color, vec3(0.0), lifeRatio);

    // Opacidad
    v_opacity = 1.0 - lifeRatio;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = u_particleSize;
}