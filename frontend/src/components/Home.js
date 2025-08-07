import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Home.css';

/**
 * A full-screen, immersive homepage component featuring a "Matrix" style
 * digital rain effect and a 3D scene with interactive elements using Three.js.
 */
const Home = ({ onNavigate }) => {
  // Refs for DOM elements to mount canvas and renderer
  const matrixCanvasRef = useRef(null);
  const threeContainerRef = useRef(null);

  // Refs to store animation frame IDs for cleanup
  const matrixAnimationId = useRef(null);
  const threeAnimationId = useRef(null);

  // useEffect hook to set up and clean up the entire animation scene
  useEffect(() => {
    // --- SCENE SETUP ---
    let scene, camera, renderer, sphereButton;
    const pillars = []; // Array to hold the pillar objects for animation
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // --- MATRIX RAIN EFFECT ---
    const matrixCanvas = matrixCanvasRef.current;
    const matrixCtx = matrixCanvas.getContext('2d');
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;

    const alphabet = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const fontSize = 16;
    const columns = matrixCanvas.width / fontSize;
    const rainDrops = Array.from({ length: columns }).fill(1);

    const drawMatrix = () => {
      matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      matrixCtx.fillStyle = '#0F0'; // Matrix Green
      matrixCtx.font = `${fontSize}px monospace`;

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        matrixCtx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
        if (rainDrops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
      matrixAnimationId.current = window.requestAnimationFrame(drawMatrix);
    };

    // --- THREE.JS 3D SCENE ---
    const initThree = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 15;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      threeContainerRef.current.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0x00d9e1, 1.5, 100);
      pointLight.position.set(0, 5, 10);
      scene.add(pointLight);

      createPillars();
      createSphereButton();
    };

    const createPillars = () => {
        const geometry = new THREE.CylinderGeometry(1, 1, 12, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00d9e1,
            emissive: 0x00ff00,
            emissiveIntensity: 0.3,
            wireframe: true,
        });
        const pillar1 = new THREE.Mesh(geometry, material);
        pillar1.position.x = -8;
        scene.add(pillar1);
        pillars.push(pillar1); // Add pillar to the array

        const pillar2 = new THREE.Mesh(geometry, material);
        pillar2.position.x = 8;
        scene.add(pillar2);
        pillars.push(pillar2); // Add pillar to the array
    };

    const createSphereButton = () => {
        const geometry = new THREE.SphereGeometry(1.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00d9e1,
            emissive: 0x39ff14,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2,
        });
        sphereButton = new THREE.Mesh(geometry, material);
        sphereButton.name = "enter_button";
        sphereButton.position.y = -2;
        scene.add(sphereButton);
    };
    
    const animateThree = () => {
      threeAnimationId.current = requestAnimationFrame(animateThree);
      
      // Animate pillars and sphere individually
      pillars.forEach(p => { p.rotation.y += 0.005; });
      if(sphereButton) {
        sphereButton.rotation.x += 0.01;
        sphereButton.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
    };

    // --- EVENT HANDLERS ---
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
    };

    const onMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.find(intersect => intersect.object.name === "enter_button")) {
        // Navigate to the recipe builder when the sphere is clicked
        onNavigate('food');
      }
    };

    // --- INITIALIZATION and CLEANUP ---
    initThree();
    animateThree();
    drawMatrix();
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);

    // Cleanup function to run when the component unmounts
    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('click', onMouseClick);
      cancelAnimationFrame(threeAnimationId.current);
      cancelAnimationFrame(matrixAnimationId.current);
      if (renderer && renderer.domElement && threeContainerRef.current) {
        threeContainerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onNavigate]); // Re-run effect if onNavigate changes

  return (
    <div className="home-container">
      <canvas ref={matrixCanvasRef} id="matrix-canvas" />
      <div ref={threeContainerRef} id="three-container" />
      <div className="home-content">
        <h1 className="main-title">CLOCKWORK</h1>
        <p className="subtitle">Click the orb to enter</p>
      </div>
    </div>
  );
};

export default Home;
