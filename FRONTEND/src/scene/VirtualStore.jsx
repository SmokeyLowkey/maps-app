import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import LoadingBar from "../components/LoadingBar";

const VirtualStore = () => {
  const mountRef = useRef(null);
  const [glbUrl, setGlbUrl] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [modelAvailable, setModelAvailable] = useState(true);
  const navigate = useNavigate();

  const branchCode = window.location.pathname.split("/").pop();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    let isMounted = true;
    fetch(`${baseUrl}/api/get-signed-url/${branchCode}/`)
      .then((response) => response.json())
      .then((data) => {
        if (isMounted) {
          if (data.url) {
            setGlbUrl(data.url);
          } else {
            setModelAvailable(false);
            setLoadingFinished(true);
          }
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("Error fetching the URL:", error);
          setModelAvailable(false);
          setLoadingFinished(true);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [branchCode, baseUrl]);

  useEffect(() => {
    if (!glbUrl) return;

    let isMounted = true;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    const loader = new GLTFLoader();

    loader.load(
      glbUrl,
      (gltf) => {
        if (!isMounted) return;
        // console.log("Model loaded:", gltf);
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.geometry.computeBoundingBox();
          }
        });
        scene.add(gltf.scene);
        setLoadingProgress(100);
        setLoadingFinished(true);

        // Extract and use the camera from the GLTF file
        const gltfCamera = gltf.cameras[0];
        scene.add(gltfCamera);

        // Adjust camera position and orientation
        gltfCamera.position.set(-15.896516691597187, 9.525770031757578, 26.519444689087567);
        gltfCamera.lookAt(new THREE.Vector3(0, 0, 0));

        const mixer = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });

        const clock = new THREE.Clock();

        // Initialize orbit controls
        const controls = new OrbitControls(gltfCamera, renderer.domElement);
        controls.enableRotate = false; // Disable rotation
        controls.enableZoom = true; // Enable zoom
        controls.enablePan = true; // Enable pan
        controls.update();

        const animate = () => {
          if (!isMounted) return;
          requestAnimationFrame(animate);
          mixer.update(clock.getDelta());
          controls.update();
          renderer.render(scene, gltfCamera);
          // Log the camera position
          // console.log(
            // `Camera Position: x=${gltfCamera.position.x}, y=${gltfCamera.position.y}, z=${gltfCamera.position.z}`
            // `camera lookat: x=${gltfCamera.lookAt.x},y=${gltfCamera.lookAt.y},z=${gltfCamera.lookAt.z} `
          // );
        };

        animate();
      },
      (xhr) => {
        setLoadingProgress((xhr.loaded / xhr.total) * 100);
        // console.log(`Loading progress: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
        console.error("Error loading GLTF model:", error);
        setModelAvailable(false);
        setLoadingFinished(true);
      }
    );

    function onWindowResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (gltfCamera) {
        gltfCamera.aspect = window.innerWidth / window.innerHeight;
        gltfCamera.updateProjectionMatrix();
      }
    }

    window.addEventListener("resize", onWindowResize, false);

    return () => {
      isMounted = false;
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener("resize", onWindowResize);
    };
  }, [glbUrl]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    >
      <button
        onClick={() => navigate("/")}
        style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1 }}
      >
        Back
      </button>
      {!loadingFinished && <LoadingBar progress={loadingProgress} />}
      {loadingFinished && !modelAvailable && (
        <div className="coming-soon-banner">Coming Soon</div>
      )}
    </div>
  );
};

export default VirtualStore;
