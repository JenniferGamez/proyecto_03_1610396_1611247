precision highp float;

// Varyings de entrada
in vec3 v_position;  
in float v_alpha;  

// Varyings de salida
out vec4 FragColor;  

void main() {
  // Hacer la partícula circular
  vec2 coord = gl_PointCoord - vec2(0.5);
  float distance = length(coord);
  float angle = atan(v_position.y, v_position.x);  
  float radius = length(v_position.xy);  

  // Generar la espiral
  float spiral = sin(angle * 10.0 + radius * 5.0);

  // Colores de la galaxia
  vec3 purple = vec3(1.5, 0, 1.5);
  vec3 blue = vec3(0.5, 0, 1.0);
  vec3 white = vec3(1.0, 1.0, 1.0);

  // Mezclar los colores en función de la espiral
  vec3 color = mix(purple, blue, smoothstep(-0.5, 1.0, spiral));  
  color = mix(color, white, pow(radius, 0.3));

  // Ajustar la intensidad del color basado en la distancia al centro
  float brightness = 2.0 - radius * 0.5;  
  color *= brightness * 1.2;

  float alpha = smoothstep(0.5, 0.0, distance) * v_alpha * brightness;  

  FragColor = vec4(color, alpha);
}
