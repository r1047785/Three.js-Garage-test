import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import kawasakiUrl from "./assets/kawasaki_ninja_zx-6r.glb?url";
import helmetUrl from "./assets/motorcycle_helmet_-_racing_helmet.glb?url";
import yenteOpDeMotorUrl from "./assets/yentefotomotorr.png";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1b2a); // avondlucht
scene.fog = new THREE.Fog(0x0d1b2a, 8, 26);

// zwak maanlicht, zodat de scène niet pikzwart is buiten het lamplicht
const nightAmbient = new THREE.HemisphereLight(0x223355, 0x05050a, 0.35);
scene.add(nightAmbient);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(8, 6, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 1 }),
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const width = 6;
const depth = 6;
const wallHeight = 3;
const wallThickness = 0.2;
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x555b61,
  roughness: 1,
});

const backWall = new THREE.Mesh(
  new THREE.BoxGeometry(width, wallHeight, wallThickness),
  wallMaterial,
);
backWall.position.set(0, wallHeight / 2, -depth / 2);
scene.add(backWall);

const photoTexture = new THREE.TextureLoader().load(yenteOpDeMotorUrl);
const photoFrame = new THREE.Mesh(
  new THREE.PlaneGeometry(2.6, 2.6 * (941 / 1672)),
  new THREE.MeshBasicMaterial({ map: photoTexture }),
);
photoFrame.position.set(0, 1.6, -depth / 2 + wallThickness / 2 + 0.01);
scene.add(photoFrame);

const leftWall = new THREE.Mesh(
  new THREE.BoxGeometry(wallThickness, wallHeight, depth),
  wallMaterial,
);
leftWall.position.set(-width / 2, wallHeight / 2, 0);
scene.add(leftWall);

const rightWall = new THREE.Mesh(
  new THREE.BoxGeometry(wallThickness, wallHeight, depth),
  wallMaterial,
);
rightWall.position.set(width / 2, wallHeight / 2, 0);
scene.add(rightWall);

const pillarWidth = 0.3;
const doorHeight = 2.2;
const doorWidth = (width - pillarWidth * 3) / 2;

const frontLeftPillar = new THREE.Mesh(
  new THREE.BoxGeometry(pillarWidth, doorHeight, wallThickness),
  wallMaterial,
);
frontLeftPillar.position.set(
  -width / 2 + pillarWidth / 2,
  doorHeight / 2,
  depth / 2,
);
scene.add(frontLeftPillar);

const frontCenterPillar = new THREE.Mesh(
  new THREE.BoxGeometry(pillarWidth, doorHeight, wallThickness),
  wallMaterial,
);
frontCenterPillar.position.set(0, doorHeight / 2, depth / 2);
scene.add(frontCenterPillar);

const frontRightPillar = new THREE.Mesh(
  new THREE.BoxGeometry(pillarWidth, doorHeight, wallThickness),
  wallMaterial,
);
frontRightPillar.position.set(
  width / 2 - pillarWidth / 2,
  doorHeight / 2,
  depth / 2,
);
scene.add(frontRightPillar);

const frontTopBand = new THREE.Mesh(
  new THREE.BoxGeometry(width, wallHeight - doorHeight, wallThickness),
  wallMaterial,
);
frontTopBand.position.set(
  0,
  doorHeight + (wallHeight - doorHeight) / 2,
  depth / 2,
);
scene.add(frontTopBand);

const roofOverhang = 0.4;
const roofRise = 1.5;
const roofThickness = 0.15;
const roofMaterial = new THREE.MeshStandardMaterial({
  color: 0x2f3a44,
  roughness: 1,
});

const halfSpan = width / 2 + roofOverhang;
const slopeLength = Math.sqrt(halfSpan * halfSpan + roofRise * roofRise);
const slopeAngle = Math.atan2(roofRise, halfSpan);

const roofRight = new THREE.Mesh(
  new THREE.BoxGeometry(slopeLength, roofThickness, depth + roofOverhang * 2),
  roofMaterial,
);
roofRight.position.set(halfSpan / 2, wallHeight + roofRise / 2, 0);
roofRight.rotation.z = -slopeAngle;
scene.add(roofRight);

const roofLeft = new THREE.Mesh(
  new THREE.BoxGeometry(slopeLength, roofThickness, depth + roofOverhang * 2),
  roofMaterial,
);
roofLeft.position.set(-halfSpan / 2, wallHeight + roofRise / 2, 0);
roofLeft.rotation.z = slopeAngle;
scene.add(roofLeft);

const gltfLoader = new GLTFLoader();

function placeOnFloor(object, x, z) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  object.position.set(x - center.x, size.y / 2 - center.y, z - center.z);
}

gltfLoader.load(kawasakiUrl, (gltf) => {
  const bike = gltf.scene;
  bike.rotation.y = -Math.PI / 2;

  const bikeBox = new THREE.Box3().setFromObject(bike);
  const bikeSize = bikeBox.getSize(new THREE.Vector3());
  const wallFaceX = -width / 2 + wallThickness / 2;
  const bikeX = wallFaceX + bikeSize.x / 2 + 0.02;
  placeOnFloor(bike, bikeX, 0);
  scene.add(bike);

  const mat = new THREE.Mesh(
    new THREE.PlaneGeometry(bikeSize.x + 0.4, bikeSize.z + 0.4),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
  );
  mat.rotation.x = -Math.PI / 2;
  mat.position.set(bikeX, 0.01, 0);
  scene.add(mat);

  gltfLoader.load(helmetUrl, (helmetGltf) => {
    const helmet = helmetGltf.scene;

    const naturalBox = new THREE.Box3().setFromObject(helmet);
    const naturalSize = naturalBox.getSize(new THREE.Vector3());
    const targetHeight = 0.3;
    helmet.scale.setScalar(targetHeight / naturalSize.y);

    helmet.rotation.x = Math.PI / 2;
    helmet.rotation.y = 0.6;

    placeOnFloor(helmet, bikeX, bikeSize.z / 2 + 0.4);
    scene.add(helmet);
  });

  const spotlight = new THREE.PointLight(0xffc98a, 90, 12, 2);
  spotlight.position.set(bikeX, wallHeight + roofRise - 0.3, bikeSize.z / 4);
  scene.add(spotlight);
});

function animate() {
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
