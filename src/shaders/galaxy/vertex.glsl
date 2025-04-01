precision highp float;

// Varyings de entrada
in vec3 position;
in float a_time;

// Uniforms
uniform float u_time;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float u_spiralFactor;
uniform float u_radiusScale; 
uniform float u_particleSize;

// Varyings de salida
out vec3 v_position;
out float v_alpha;

void main() {
    
    float angle = atan(position.y, position.x); // Calcula el ángulo
    float radius = length(position.xy) * u_radiusScale; // Escala el radio
    float spiralFactor = u_spiralFactor * radius; // Calcula la espiral
    float timeFactor = u_time * 0.1;

    vec3 newPosition = vec3(
        radius * cos(angle + spiralFactor + timeFactor),
        radius * sin(angle + spiralFactor + timeFactor),
        position.z * 0.1
    );

    v_position = newPosition;
    v_alpha = 1.0 - smoothstep(0.0, 5.0, radius);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = u_particleSize + u_particleSize * (1.0 - radius / 5.0);
}