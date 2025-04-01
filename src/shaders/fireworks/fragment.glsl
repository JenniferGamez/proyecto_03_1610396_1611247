precision highp float;

// Varyings de entrada
in vec3 v_color;
in float v_opacity;

// Varyings de salida
out vec4 FragColor;

void main() {
    FragColor = vec4(v_color, v_opacity);
}