import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import { gsap } from 'gsap'

export function initGame(canvas, scrollViewport, screenContainer, callbacks, options = {}) {
  const { onScoreChange, onDepthChange, onShowTerminal } = callbacks;
  const { initialSkin = '/clown_fish_low_poly_animated.glb' } = options;

  let score = 0;
  let isFeeding = false;
  let scrollPercent = 0;
  let isSpawning = false;
  let activePellets = [];
  let companions = [];

  let fish = null;
  let mixer = null;
  let swimAction = null;
  let biteAction = null;
  let idleAction = null;
  let currentAction = null;
  let fishAnimations = null;
  let currentSkinPath = initialSkin;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.set(0, 0, 30);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
  scene.add(ambientLight);

  const topLight = new THREE.DirectionalLight(0xffffff, 5);
  topLight.position.set(20, 20, 20);
  scene.add(topLight);

  const chestLight = new THREE.PointLight(0x00e5ff, 0, 15);
  chestLight.position.set(0, -66, 2);
  scene.add(chestLight);

  function changeAnimation(newAction) {
    if (!newAction || currentAction === newAction) return;
    if (currentAction) {
      currentAction.fadeOut(0.3);
    }
    newAction.reset();
    newAction.setEffectiveTimeScale(1);
    newAction.setEffectiveWeight(1);
    newAction.fadeIn(0.3);
    newAction.play();
    currentAction = newAction;
  }

  function createAction(originalClip, name, startFrame, endFrame) {
    const cleanClip = THREE.AnimationUtils.subclip(originalClip, name, startFrame, endFrame, 30);
    return mixer.clipAction(cleanClip);
  }

  const loader = new GLTFLoader();

  function recreateCompanions() {
    if (!fish || companions.length === 0) return;
    const oldStates = companions.map(comp => {
      const pos = comp.mesh.position.clone();
      const rot = comp.mesh.rotation.clone();
      scene.remove(comp.mesh);
      return { pos, rot };
    });
    companions = [];
    oldStates.forEach(state => {
      const baby = SkeletonUtils.clone(fish);
      baby.scale.copy(fish.scale).multiplyScalar(0.5);
      baby.position.copy(state.pos);
      baby.rotation.copy(state.rot);
      scene.add(baby);

      const babyMixer = new THREE.AnimationMixer(baby);
      let babySwimAction = null;
      if (fishAnimations && fishAnimations.length >= 3) {
        const swimClip = THREE.AnimationUtils.subclip(fishAnimations[0], 'babySwim', 171, 212, 30);
        babySwimAction = babyMixer.clipAction(swimClip);
      } else if (fishAnimations && fishAnimations.length > 0) {
        babySwimAction = babyMixer.clipAction(fishAnimations[0]);
      }
      if (babySwimAction) {
        babySwimAction.play();
      }
      companions.push({
        mesh: baby,
        mixer: babyMixer,
        swimAction: babySwimAction
      });
    });
  }

  function loadFishModel(modelPath, callback = null) {
    loader.load(modelPath,
      (gltf) => {
        let prevPos = new THREE.Vector3(0, 0, 0);
        let prevRot = new THREE.Euler(0, 0, 0);
        if (fish) {
          prevPos.copy(fish.position);
          prevRot.copy(fish.rotation);
          scene.remove(fish);
        }

        fish = gltf.scene;
        fishAnimations = gltf.animations;

        const box = new THREE.Box3().setFromObject(fish);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 5.5;
        const scaleFactor = targetSize / (maxDim || 1);
        fish.scale.setScalar(scaleFactor);

        fish.position.copy(prevPos);
        fish.rotation.copy(prevRot);
        scene.add(fish);

        mixer = new THREE.AnimationMixer(fish);
        if (gltf.animations.length >= 3) {
          swimAction = createAction(gltf.animations[0], 'swim', 171, 212);
          biteAction = createAction(gltf.animations[2], 'bite', 619, 668);
          idleAction = createAction(gltf.animations[1], 'idle', 10, 170);
        } else if (gltf.animations.length > 0) {
          const clip = gltf.animations[0];
          swimAction = mixer.clipAction(clip);
          biteAction = mixer.clipAction(clip);
          idleAction = mixer.clipAction(clip);
        } else {
          swimAction = null;
          biteAction = null;
          idleAction = null;
        }

        if (swimAction) {
          swimAction.play();
          currentAction = swimAction;
        }

        currentSkinPath = modelPath;
        recreateCompanions();
        if (callback) callback();
      },
      undefined,
      (error) => {
        console.error('Error loading fish model:', error);
      }
    );
  }

  loadFishModel(initialSkin);

  const chestGroup = new THREE.Group();
  const chestBaseGroup = new THREE.Group();
  const chestLidGroup = new THREE.Group();

  const woodMaterial = new THREE.MeshLambertMaterial({ color: 0x5c3a21 });
  const goldMaterial = new THREE.MeshPhongMaterial({ color: 0xd4af37, shininess: 80 });
  const steelMaterial = new THREE.MeshPhongMaterial({ color: 0x8c969e, shininess: 50 });

  const baseBox = new THREE.Mesh(new THREE.BoxGeometry(6, 3.5, 4.5), woodMaterial);
  chestBaseGroup.add(baseBox);

  const baseBandLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.6, 4.6), goldMaterial);
  baseBandLeft.position.x = -2.2;
  const baseBandRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.6, 4.6), goldMaterial);
  baseBandRight.position.x = 2.2;
  chestBaseGroup.add(baseBandLeft, baseBandRight);

  const lockPlate = new THREE.Mesh(new THREE.BoxGeometry(1, 1.2, 0.3), steelMaterial);
  lockPlate.position.set(0, 0.5, 2.3);
  chestBaseGroup.add(lockPlate);

  const lidBox = new THREE.Mesh(new THREE.BoxGeometry(6, 1.8, 4.5), woodMaterial);
  lidBox.position.set(0, 0.9, 2.25);
  chestLidGroup.add(lidBox);

  const lidBandLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.9, 4.6), goldMaterial);
  lidBandLeft.position.set(-2.2, 0.9, 2.25);
  const lidBandRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.9, 4.6), goldMaterial);
  lidBandRight.position.set(2.2, 0.9, 2.25);
  chestLidGroup.add(lidBandLeft, lidBandRight);

  const lockLatch = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.4), goldMaterial);
  lockLatch.position.set(0, -0.1, 4.5);
  chestLidGroup.add(lockLatch);

  chestLidGroup.position.set(0, 1.75, -2.25);
  chestGroup.add(chestBaseGroup);
  chestGroup.add(chestLidGroup);

  chestGroup.position.set(0, -68, -2);
  chestGroup.rotation.y = Math.PI / 8;
  scene.add(chestGroup);

  function updateScrollMetrics() {
    const scrollHeight = scrollViewport.scrollHeight - scrollViewport.clientHeight;
    if (scrollHeight <= 0) return;

    scrollPercent = scrollViewport.scrollTop / scrollHeight;

    camera.position.y = -68 * scrollPercent;

    const ambientIntensity = 1.3 - 1.1 * scrollPercent;
    ambientLight.intensity = ambientIntensity;

    const topLightIntensity = 5 - 4.5 * scrollPercent;
    topLight.intensity = topLightIntensity;

    chestLight.intensity = scrollPercent > 0.8 ? (scrollPercent - 0.8) * 15 : 0;

    const depthVal = Math.round(4000 * scrollPercent);
    onDepthChange(depthVal, scrollPercent);
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const targetPoint = new THREE.Vector3();
  const dummy = new THREE.Object3D();

  function handleMouseMove(event) {
    const rect = screenContainer.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, targetPoint);

    if (targetPoint && !isFeeding) {
      moveFish(targetPoint.x, targetPoint.y);
    }
  }

  const moveFish = (target_x, target_y) => {
    if (!fish) return;

    const currentPos = fish.position.clone();
    const cursorPos = new THREE.Vector3(target_x, target_y, 0);
    const distance = currentPos.distanceTo(cursorPos);

    const stopDistance = 3;
    if (distance <= stopDistance + 0.1) {
      if (idleAction && currentAction !== idleAction && !isFeeding) {
        changeAnimation(idleAction);
      }
      return;
    }

    if (swimAction && currentAction !== swimAction && !isFeeding) {
      changeAnimation(swimAction);
    }

    const direction = new THREE.Vector3().subVectors(cursorPos, currentPos).normalize();
    const finalPos = cursorPos.clone().sub(direction.multiplyScalar(stopDistance));

    gsap.to(fish.position, { duration: 1.2, x: finalPos.x, y: finalPos.y, ease: "power1.out" });

    dummy.position.copy(fish.position);
    dummy.lookAt(cursorPos);

    gsap.to(fish.rotation, {
      duration: 0.6,
      x: dummy.rotation.x,
      y: dummy.rotation.y,
      z: dummy.rotation.z,
      ease: "power1.out"
    });
  }

  function addScore(amount) {
    const targetScore = score + amount;
    gsap.to({ val: score }, {
      val: targetScore,
      duration: 0.8,
      ease: "power1.out",
      onUpdate: function () {
        onScoreChange(Math.round(this.targets()[0].val));
      },
      onComplete: function () {
        score = targetScore;
        onScoreChange(score);
      }
    });
  }


  function spawnPelletsSequence() {
    if (isSpawning) return;
    isSpawning = true;

    gsap.to(chestLidGroup.rotation, { x: -Math.PI / 1.7, duration: 1, ease: "back.out(1.5)" });

    const pelletGeom = new THREE.DodecahedronGeometry(0.9);
    const pelletMat = new THREE.MeshPhongMaterial({ color: 0x39ff14, emissive: 0x24a60d, shininess: 100 });

    const pellet1 = new THREE.Mesh(pelletGeom, pelletMat);
    pellet1.position.set(0, -67.5, -1);
    const pellet2 = new THREE.Mesh(pelletGeom, pelletMat);
    pellet2.position.set(0.5, -67.5, -1);

    scene.add(pellet1, pellet2);
    activePellets.push(pellet1, pellet2);

    gsap.to(pellet1.position, { x: -3.5, y: -64, z: 1, duration: 1.2, ease: "power2.out" });
    gsap.to(pellet2.position, {
      x: 3.5, y: -61.5, z: 0.5, duration: 1.5, ease: "power2.out", onComplete: () => {
        gsap.to(chestLidGroup.rotation, { x: 0, duration: 0.8, ease: "power2.inOut" });
        isSpawning = false;
      }
    });
  }

  function eatPelletSequence(pellet) {
    if (!fish || isFeeding) return;
    isFeeding = true;

    changeAnimation(swimAction);

    dummy.position.copy(fish.position);
    dummy.lookAt(pellet.position);
    gsap.to(fish.rotation, { x: dummy.rotation.x, y: dummy.rotation.y, z: dummy.rotation.z, duration: 0.5 });

    gsap.to(fish.position, {
      x: pellet.position.x,
      y: pellet.position.y,
      z: pellet.position.z,
      duration: 1.4,
      ease: "power2.inOut",
      onComplete: () => {
        changeAnimation(biteAction);

        setTimeout(() => {
          scene.remove(pellet);
          activePellets = activePellets.filter(p => p !== pellet);
          addScore(500);
          changeAnimation(swimAction);
          isFeeding = false;

          if (fish && fishAnimations) {
            const baby = SkeletonUtils.clone(fish);
            baby.scale.copy(fish.scale).multiplyScalar(0.5);

            const offset = new THREE.Vector3(0, 0, -4).applyEuler(fish.rotation);
            baby.position.copy(fish.position).add(offset);
            baby.rotation.copy(fish.rotation);
            scene.add(baby);

            const babyMixer = new THREE.AnimationMixer(baby);
            let babySwimAction = null;
            if (fishAnimations.length >= 3) {
              const swimClip = THREE.AnimationUtils.subclip(fishAnimations[0], 'babySwim', 171, 212, 30);
              babySwimAction = babyMixer.clipAction(swimClip);
            } else if (fishAnimations.length > 0) {
              babySwimAction = babyMixer.clipAction(fishAnimations[0]);
            }
            if (babySwimAction) {
              babySwimAction.play();
            }

            companions.push({
              mesh: baby,
              mixer: babyMixer,
              swimAction: babySwimAction
            });
          }

          if (activePellets.length === 0) {
            onShowTerminal();
          }
        }, 400);
      }
    });
  }

  function handleViewportClick(event) {
    const rect = screenContainer.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (activePellets.length > 0) {
      const intersectsPellets = raycaster.intersectObjects(activePellets, true);
      if (intersectsPellets.length > 0) {
        const clickedPellet = intersectsPellets[0].object;
        eatPelletSequence(clickedPellet);
        return;
      }
    }

    const intersectsChest = raycaster.intersectObjects(chestGroup.children, true);
    if (intersectsChest.length > 0) {
      spawnPelletsSequence();
    }
  }

  function handleResize() {
    const width = screenContainer.clientWidth;
    const height = screenContainer.clientHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  scrollViewport.addEventListener('scroll', updateScrollMetrics);
  screenContainer.addEventListener('mousemove', handleMouseMove);
  scrollViewport.addEventListener('click', handleViewportClick);
  window.addEventListener('resize', handleResize);

  handleResize();
  updateScrollMetrics();

  const clock = new THREE.Clock();
  let animationFrameId = null;

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) {
      mixer.update(delta);
    }

    if (chestGroup) {
      chestGroup.position.y = (-68) + Math.sin(clock.getElapsedTime() * 0.8) * 0.2;
    }

    if (activePellets.length > 0) {
      activePellets.forEach((pellet, index) => {
        pellet.rotation.y += 0.01;
        pellet.position.y += Math.sin(clock.getElapsedTime() * 1.5 + index) * 0.003;
      });
    }

    if (companions.length > 0 && fish) {
      let targetPos = fish.position.clone();
      companions.forEach((companion, idx) => {
        companion.mixer.update(delta);

        const dir = new THREE.Vector3().subVectors(targetPos, companion.mesh.position);
        const distance = dir.length();
        const followDist = 4.5;

        if (distance > followDist) {
          const targetFollowPos = targetPos.clone().sub(dir.clone().normalize().multiplyScalar(followDist));
          companion.mesh.position.lerp(targetFollowPos, 0.12);
        }

        dummy.position.copy(companion.mesh.position);
        dummy.lookAt(targetPos);
        companion.mesh.rotation.x += (dummy.rotation.x - companion.mesh.rotation.x) * 0.1;
        companion.mesh.rotation.y += (dummy.rotation.y - companion.mesh.rotation.y) * 0.1;
        companion.mesh.rotation.z += (dummy.rotation.z - companion.mesh.rotation.z) * 0.1;

        targetPos.copy(companion.mesh.position);
      });
    }

    renderer.render(scene, camera);
  }

  animate();

  const dpadNudge = { x: 0, y: 0 };

  return {
    setFishSkin(modelPath) {
      if (modelPath === currentSkinPath) return;
      loadFishModel(modelPath);
    },
    triggerBite() {
      if (biteAction && fish && !isFeeding) {
        changeAnimation(biteAction);
        setTimeout(() => {
          if (!isFeeding) changeAnimation(swimAction);
        }, 1000);
      }
    },
    triggerBarrelRoll() {
      if (fish && !isFeeding) {
        gsap.to(fish.rotation, { z: fish.rotation.z + Math.PI * 2, duration: 0.8, ease: "back.out(1.2)" });
      }
    },
    applyNudge(dir) {
      const nudgeAmount = 4;
      if (dir === 'up') dpadNudge.y += nudgeAmount;
      if (dir === 'down') dpadNudge.y -= nudgeAmount;
      if (dir === 'left') dpadNudge.x -= nudgeAmount;
      if (dir === 'right') dpadNudge.x += nudgeAmount;

      gsap.to(camera.position, {
        x: dpadNudge.x,
        y: (-68 * scrollPercent) + dpadNudge.y,
        duration: 0.3,
        onComplete: () => {
          dpadNudge.x = 0;
          dpadNudge.y = 0;
          gsap.to(camera.position, { x: 0, y: -68 * scrollPercent, duration: 0.4 });
        }
      });
    },
    resetGame() {
      score = 0;
      onScoreChange(0);
      isFeeding = false;
      isSpawning = false;

      activePellets.forEach(pel => scene.remove(pel));
      activePellets = [];

      companions.forEach(comp => scene.remove(comp.mesh));
      companions = [];

      if (fish) {
        fish.position.set(0, 0, 0);
        fish.rotation.set(0, 0, 0);
        if (swimAction) changeAnimation(swimAction);
      }
      gsap.to(chestLidGroup.rotation, { x: 0, duration: 0.8, ease: "power2.inOut" });
    },
    destroy() {
      scrollViewport.removeEventListener('scroll', updateScrollMetrics);
      screenContainer.removeEventListener('mousemove', handleMouseMove);
      scrollViewport.removeEventListener('click', handleViewportClick);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      companions.forEach(comp => scene.remove(comp.mesh));
      companions = [];
      renderer.dispose();
    }
  };
}

export function initTamagotchi(canvas, callbacks, options = {}) {
  const { onSkinChange } = callbacks;
  const { initialSkin = '/clown_fish_low_poly_animated.glb' } = options;

  let currentSkinPath = initialSkin;
  let tamagotchi = null;
  let tamagotchiPivot = null;
  let animationFrameId = null;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  camera.aspect = canvas.clientWidth / (canvas.clientHeight || 1);
  camera.updateProjectionMatrix();

  const ambientLight = new THREE.AmbientLight(0x222a30, 0.7);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x00e5ff, 1.4);
  dirLight1.position.set(-4, 5, 4);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xff8800, 0.9);
  dirLight2.position.set(5, -4, 3);
  scene.add(dirLight2);

  const loader = new GLTFLoader();
  loader.load('/tamagotchi_retro.glb',
    (gltf) => {
      tamagotchi = gltf.scene;

      const box = new THREE.Box3().setFromObject(tamagotchi);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 2.4;
      const scaleFactor = targetSize / (maxDim || 1);
      tamagotchi.scale.setScalar(scaleFactor);

      const loopNode = tamagotchi.getObjectByName('pTorus1');
      if (loopNode) {
        tamagotchi.updateMatrixWorld(true);
        const loopPos = new THREE.Vector3();
        loopNode.getWorldPosition(loopPos);
        loopPos.divideScalar(scaleFactor);
        tamagotchi.position.copy(loopPos.multiplyScalar(-scaleFactor));
      } else {
        tamagotchi.position.set(0, 0, 0);
      }

      tamagotchiPivot = new THREE.Group();
      tamagotchiPivot.add(tamagotchi);
      scene.add(tamagotchiPivot);
    },
    undefined,
    (error) => {
      console.error('Error loading Tamagotchi model:', error);
    }
  );

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (tamagotchi) {
      const intersects = raycaster.intersectObjects(tamagotchi.children, true);
      if (intersects.length > 0) {
        let clickedButtonNode = intersects[0].object;
        while (clickedButtonNode && clickedButtonNode !== tamagotchi) {
          if (['pCylinder2', 'pCylinder3', 'pCylinder4'].includes(clickedButtonNode.name)) {
            break;
          }
          clickedButtonNode = clickedButtonNode.parent;
        }

        if (clickedButtonNode && ['pCylinder2', 'pCylinder3', 'pCylinder4'].includes(clickedButtonNode.name)) {
          const originalY = clickedButtonNode.position.y;
          gsap.to(clickedButtonNode.position, {
            y: originalY - 0.15,
            duration: 0.08,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut"
          });

          let targetSkin = '';
          if (clickedButtonNode.name === 'pCylinder2') {
            targetSkin = '/clown_fish_low_poly_animated.glb';
          } else if (clickedButtonNode.name === 'pCylinder3') {
            targetSkin = '/fish2.glb';
          } else if (clickedButtonNode.name === 'pCylinder4') {
            targetSkin = '/fish_animated.glb';
          }

          if (targetSkin) {
            currentSkinPath = targetSkin;
            if (onSkinChange) {
              onSkinChange(targetSkin);
            }
          }
        }
      }
    }
  }

  canvas.addEventListener('click', handleClick);

  function handleResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', handleResize);

  const clock = new THREE.Clock();

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    if (tamagotchiPivot) {
      tamagotchiPivot.rotation.z = Math.sin(time * 1.5) * 0.15;
      tamagotchiPivot.rotation.y = Math.PI / 18 + Math.cos(time * 0.8) * 0.08;
      tamagotchiPivot.rotation.x = Math.sin(time * 0.5) * 0.05;
    }

    renderer.render(scene, camera);
  }

  animate();

  return {
    setSkinState(skinPath) {
      currentSkinPath = skinPath;
    },
    destroy() {
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      renderer.dispose();
    }
  };
}
