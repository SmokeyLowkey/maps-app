import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import LoadingBar from "../components/LoadingBar"; // Import the LoadingBar component

const VirtualStore = () => {
  const mountRef = useRef(null);
  const [glbUrl, setGlbUrl] = useState("");
  const navigate = useNavigate(); // Initialize useHistory
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingFinished, setLoadingFinished] = useState(false);

  const branchCode = window.location.pathname.split("/").pop(); // Extract branch code from URL

  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    console.log("branch code selected: ", branchCode);
    fetch(`${baseUrl}/api/get-signed-url/${branchCode}/`)
      .then((response) => response.json())
      .then((data) => {
        setGlbUrl(data.url);
      })
      .catch((error) => console.error("Error fetching the URL:", error));
  }, [branchCode, baseUrl]);

  useEffect(() => {
    if (!glbUrl) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(-1.5, 1.4, -1.5);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const controls = new PointerLockControls(camera, renderer.domElement);
    // console.log("PointerLockControls initialized");

    // Ensure the Pointer Lock API is supported

    const handlePointerLock = () => {
      if (loadingFinished) {
        if (!("pointerLockElement" in document)) {
          console.error("Pointer Lock API is not supported by your browser.");
          return;
        }
        controls.lock();
      }
    };

    document.addEventListener("click", () => {
      if (document.body.contains(renderer.domElement)) {
        try {
          controls.lock();
        } catch (error) {
          console.error("Unable to lock pointer: ", error);
        }
      } else {
        console.error("renderer.domElement is not in the document.");
      }
    });

    controls.addEventListener("lock", () => {
      // console.log("Pointer locked");
    });

    controls.addEventListener("unlock", () => {
      // console.log("Pointer unlocked");
    });

    scene.add(controls.getObject());

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Ambient light with half intensity
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    const loader = new GLTFLoader();
    const objects = [];
    const collisionObjectsNames = [
      "store_shelves",
      "wire_shelves",
      "wire_shelves001",
      "wire_shelves002",
      "Cube053",
      "Cube053_1",
      "Cube054",
      "Cube054_1",
      "Cube055",
      "Cube055_1",
      "Walls001",
      "Walls002",
      "Walls003",
      "Walls004",
      "Walls005",
      "Walls006",
    ];

    loader.load(
      glbUrl,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.geometry.computeBoundingBox();
            child.userData.boundingBox = child.geometry.boundingBox.clone();
            objects.push(child);
          }
        });
        scene.add(gltf.scene);
        setLoadingProgress(100); // Set progress to 100% when loading is complete
        setLoadingFinished(true); // Mark loading as finished
      },
      (xhr) => {
        setLoadingProgress((xhr.loaded / xhr.total) * 100); // Update progress based on loaded assets
      },
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      render();
    }

    window.addEventListener("resize", onWindowResize, false);

    const keyState = {};

    const onKeyDown = (event) => {
      keyState[event.code] = true;
      // console.log("Key down: ", event.code);
    };

    const onKeyUp = (event) => {
      keyState[event.code] = false;
      // console.log("Key up: ", event.code);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    const moveSpeed = 0.1;

    const raycaster = new THREE.Raycaster();
    const directions = [
      new THREE.Vector3(0, 0, -1), // Forward
      new THREE.Vector3(0, 0, 1), // Backward
      new THREE.Vector3(-1, 0, 0), // Left
      new THREE.Vector3(1, 0, 0), // Right
      new THREE.Vector3(0, -1, 0), // Down
      new THREE.Vector3(0, 1, 0), // Up
    ];

    const checkCollisions = (newPosition) => {
      for (const direction of directions) {
        raycaster.set(newPosition, direction);
        const intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0 && intersects[0].distance < 0.55) {
          // console.log("Collision detected with: ", intersects[0].object);
          return true;
        }
      }
      return false;
    };

    function render() {
      renderer.render(scene, camera);
    }

    const animate = () => {
      requestAnimationFrame(animate);

      let moveForward = 0,
        moveRight = 0;

      if (keyState["KeyW"]) moveForward = moveSpeed;
      if (keyState["KeyS"]) moveForward = -moveSpeed;
      if (keyState["KeyA"]) moveRight = moveSpeed;
      if (keyState["KeyD"]) moveRight = -moveSpeed;

      if (moveForward !== 0 || moveRight !== 0) {
        const direction = new THREE.Vector3();
        controls.getDirection(direction);
        direction.y = 0; // Lock the camera's y-axis rotation

        const moveDirection = new THREE.Vector3();
        if (moveForward !== 0)
          moveDirection.add(direction.clone().multiplyScalar(moveForward));
        if (moveRight !== 0) {
          const right = new THREE.Vector3();
          right.crossVectors(camera.up, direction).normalize();
          moveDirection.add(right.multiplyScalar(moveRight));
        }

        const newPosition = controls
          .getObject()
          .position.clone()
          .add(moveDirection);

        if (!checkCollisions(newPosition)) {
          controls.getObject().position.copy(newPosition);
        } else {
          // console.log("Collision detected, movement blocked.");
        }
      }

      render();
    };

    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [glbUrl]);

  return (
    <div ref={mountRef}>
      <button
        onClick={() => navigate("/")}
        style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1 }}
      >
        Back
      </button>
      {!loadingFinished && <LoadingBar progress={loadingProgress} />}
    </div>
  );
};

export default VirtualStore;
