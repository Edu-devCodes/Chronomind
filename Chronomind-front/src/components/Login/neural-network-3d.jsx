"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

export function NeuralNetwork3D() {
  const count = 500;
  const positions = new Float32Array(count * 3);

  // gera pontos aleatórios
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 8;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.65,
      }}
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
        <Points
          positions={positions}
          stride={3}
          frustumCulled
          rotation={[0, 0, 0]}
        >
          <PointMaterial
            transparent
            size={0.03}
            sizeAttenuation
            depthWrite={false}
            color="#ff0033"
          />
        </Points>
      </Canvas>
    </div>
  );
}
