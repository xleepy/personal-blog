'use client'
import { Cloud, Clouds, Sky as SkyImpl } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, MeshLambertMaterial, Object3DEventMap, } from "three";

function Sky() {
  const cloud0 = useRef<Group<Object3DEventMap>>(null);
  const cloud1 = useRef<Group<Object3DEventMap>>(null);
  const cloud2 = useRef<Group<Object3DEventMap>>(null);
  const cloud3 = useRef<Group<Object3DEventMap>>(null);
  const cloud4 = useRef<Group<Object3DEventMap>>(null);
  const cloud5 = useRef<Group<Object3DEventMap>>(null);

  useFrame(() => {
    const clouds = [cloud0.current, cloud1.current, cloud2.current, cloud3.current, cloud4.current, cloud5.current].filter(Boolean) as Group<Object3DEventMap>[];
    clouds.forEach((cloud, index) => {
      const targetPosition = cloud.position.clone()
      targetPosition.x += (Math.sin(Date.now() / 1000 + index) * 0.01) + index * 0.01;
      cloud.position.lerp(targetPosition, 0.2);
    })
  })

  return (
    <>
      <SkyImpl />
      <group >
        <Clouds material={MeshLambertMaterial} limit={400} >
          <Cloud ref={cloud0} />
          <Cloud ref={cloud1} color="#eed0d0" seed={2} />
          <Cloud ref={cloud2} color="#d0e0d0" seed={3} />
          <Cloud ref={cloud3} color="#a0b0d0" seed={4} />
          <Cloud ref={cloud4} color="#c0c0dd" seed={5} />
          <Cloud ref={cloud5} concentrate="outside" growth={100} color="#ffccdd" opacity={1.25} seed={0.3} bounds={200} volume={200} />
        </Clouds>
      </group>
    </>
  )
}




export const AppCanvas = () => {
  return <div className="fixed inset-0 -z-10">
    <Canvas>
      <Sky />
      <ambientLight intensity={Math.PI / 1.5} />
      <spotLight position={[0, 40, 0]} decay={0} distance={45} penumbra={1} intensity={100} />
      <spotLight position={[-20, 0, 10]} color="red" angle={0.15} decay={0} penumbra={-1} intensity={30} />
      <spotLight position={[20, -10, 10]} color="red" angle={0.2} decay={0} penumbra={-1} intensity={20} />
    </Canvas>
  </div>
}