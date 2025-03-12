"use client";
import { useLayoutEffect, useRef } from "react";
import Image from "next/image";

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();

  if (!shaderProgram) {
    return null;
  }
  if (!vertexShader || !fragmentShader) {
    return null;
  }
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram,
      )}`,
    );
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export default function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext?.("webgl2");

    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader fills entire canvas
    const vsSource = /* glsl */ `
            attribute vec4 position;
            void main() {
                gl_Position = position;
            }
        `;

    // Fragment shader fills entire canvas with gradient
    const fsSource = /* glsl */ `
            precision highp float;

            uniform float time;
            uniform vec2 resolution;
            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                float t = mod(time *.5, 3.0); // Slow down the time for smoother transition

                vec3 color1 = vec3(0.114,0.306,0.847);
                vec3 color2 = vec3(0.031,0.569,0.698);
                vec3 color3 = vec3(0.078,0.784,0.616);

                vec3 color;
                float position = mod(uv.x + uv.y + t, 3.0); // top right to bottom left
                if (position < 1.0) {
                    color = mix(color1, color2, smoothstep(0.0, 1.0, position));
                } else if (position < 2.0) {
                    color = mix(color2, color3, smoothstep(1.0, 2.0, position));
                } else {
                    color = mix(color3, color1, smoothstep(2.0, 3.0, position));
                }

                gl_FragColor = vec4(color, 1.0);
            }
        `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) {
      return;
    }

    gl.useProgram(shaderProgram);
    // Vertex uniforms
    const position = gl.getAttribLocation(shaderProgram, "position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    // Fragment uniforms
    const resolution = gl.getUniformLocation(shaderProgram, "resolution");
    const timeHandle = gl.getUniformLocation(shaderProgram, "time");
    // Draw
    draw();

    function draw() {
      if (!gl || !shaderProgram) {
        return;
      }
      gl.useProgram(shaderProgram);
      // Set resolution
      gl.uniform2f(resolution, gl.canvas.width, gl.canvas.height);
      // Pass in time for funky effects
      gl.uniform1f(timeHandle, performance.now() / 1000);
      //Draw a triangle strip connecting vertices 0-4
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(draw);
    }
  }, []);
  return (
    <>
      <Image
        alt="gradient background"
        src="/fallback-gradient.png"
        fill={true}
        className="absolute top-0 left-0 -z-20 object-cover"
      />
      <canvas
        className="top-0 left-0 -z-10 w-[100vw] h-[100vh] absolute"
        ref={canvasRef}
      ></canvas>
    </>
  );
}
