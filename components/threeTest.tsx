import { useEffect, useMemo, memo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Text, Billboard } from "@react-three/drei";
import _ from "lodash";

const Taurus = memo(function Taurus() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[5, 0.01, 16, 100]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
});

const CameraController = memo(function CameraController() {
  const { camera, gl } = useThree();
  useEffect(() => {
    camera.position.set(3, 3, 7);
    const controls = new OrbitControls(camera, gl.domElement);
    controls.minDistance = 5;
    controls.maxDistance = 20;

    return () => {
      controls.dispose();
    };
  }, [camera, gl]);

  return null;
});

const ThreeTest = memo(function ThreeTest(props: {
  data: { value: number; word: string; id: string }[];
}) {
  const { data } = props;

  const sortedData = useMemo(() => {
    return _.sortBy(data, "id");
  }, [data]);

  const spheres = useMemo(
    function Spheres() {
      return sortedData.map(({ word, value: scale }, index) => {
        const angle = (index / sortedData.length) * 2 * Math.PI;
        const x = 5 * Math.cos(angle);
        const z = 5 * Math.sin(angle);
        return (
          <group key={index} position={[x, 0, z]}>
            <mesh key={index} position={[0, 0, 0]}>
              <sphereGeometry args={[scale, 15, 15]} />
              <meshStandardMaterial color="#3B82F6" />
            </mesh>
            <Billboard>
              <Text
                position={[0, scale + 0.5, 0]}
                fontSize={0.5}
                color="black"
                anchorX="center"
                anchorY="middle"
              >
                {word}
              </Text>
            </Billboard>
          </group>
        );
      });
    },
    [data]
  );

  return (
    <div
      className="window grid grid-rows-[1fr_auto]"
      style={{ width: "300px", height: "200px" }}
    >
      <div className="title-bar">
        <div className="title-bar-text">Classement.exe</div>
      </div>
      <div className="w-full h-full">
        <Canvas>
          <CameraController />
          <ambientLight intensity={5} />
          <pointLight position={[10, 10, 10]} />
          {spheres}
          <Taurus />
        </Canvas>
      </div>
    </div>
  );
});
export default ThreeTest;
