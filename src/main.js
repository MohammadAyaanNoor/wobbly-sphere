import GUI from 'lil-gui';
import * as THREE from 'three';
import { DRACOLoader, GLTFLoader, RGBELoader, ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import vertex from './Shaders/wobbleShader/vertex.vert'
import fragment from './Shaders/wobbleShader/fragment.frag'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const canvas = document.querySelector('.webgl');

const scene = new THREE.Scene();

const gui = new GUI();
const rgbeLoader = new RGBELoader();
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./static/models/draco/');
gltfLoader.setDRACOLoader(dracoLoader);


const textureLoader = new THREE.TextureLoader();
// const colorTexture = textureLoader.load('./static/models/LeePerrySmith/color.jpg')
// colorTexture.colorSpace = THREE.SRGBColorSpace
// const normalTexture = textureLoader.load('./static/models/LeePerrySmith/normal.jpg')



const directionalLight = new THREE.DirectionalLight('#ffffff',3);
directionalLight.position.set(1.395,-0.3260,6.804);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
scene.add(directionalLight);
// directionalLight.target.position.set(0,1,0)

// const directionalLigthCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLigthCameraHelper);
// directionalLight.target.updateMatrixWorld();

// directionalLight.shadow.bias = -0.002;


rgbeLoader.load(
  '/textures/teutonic_castle_moat_2k.hdr',
  (environmentMap) =>{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    environmentMap.colorSpace = THREE.SRGBColorSpace;
    scene.background = environmentMap;
    scene.environment = environmentMap;
    scene.environmentIntensity = 1;
  }

)


// const updateAllMaterials = ()=>{
//   scene.traverse((child)=>{
//     if(child.isMesh && child.material.isMeshStandardMaterial){
//       child.material.envMapIntensity = 1;
//       child.material.needsUpdate = true
//       child.castShadow = true;
//       child.receiveShadow = true;
//     }
//   })
// }
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(15,15,15),
  new THREE.MeshStandardMaterial()
)
plane .position.z = -5
plane.position.x = -2
plane.rotation.x = Math.PI * 2
plane.receiveShadow = true
// plane.rotation.y = Math.PI
scene.add(plane)

// Material
const debugObject = {}
debugObject.colorA = '#0000ff'
debugObject.colorB = '#ff0000'
const uniforms = {
  uTime : new THREE.Uniform(0),
  uPositionFrequency : new THREE.Uniform(0.5),
  uStrength : new THREE.Uniform(0.3),
  uTimeFrequency : new THREE.Uniform(0.4),

  uWarpPositionFrequency : new THREE.Uniform(0.38),
  uWarpStrength : new THREE.Uniform(1.7),
  uWarpTimeFrequency : new THREE.Uniform(0.12),

  uColorA : new THREE.Uniform(new THREE.Color(debugObject.colorA)),
  uColorB : new THREE.Uniform(new THREE.Color(debugObject.colorB))
}
const material = new CustomShaderMaterial({
  //csm
  baseMaterial : THREE.MeshPhysicalMaterial,
  vertexShader:vertex,
  fragmentShader:fragment,
  uniforms:uniforms,
  silent:true,

  //physical material properties
    metalness: 0,
    roughness: 0.5,
    color: '#ffffff',
    transmission: 0,
    ior: 1.5,
    thickness: 1.5,
    transparent: true,
    wireframe: false
})
const depthMaterial = new CustomShaderMaterial({
  //csm
  baseMaterial : THREE.MeshDepthMaterial,
  vertexShader:customVertexShader,
  uniforms:uniforms,
  silent:true,

  //depth material properties
  depthPacking: THREE.RGBADepthPacking
})
// Geometry
let geometry = new THREE.IcosahedronGeometry(2.5, 50)
geometry = mergeVertices(geometry)
geometry.computeTangents();
console.log(geometry.attributes)
//sphere
const wobble = new THREE.Mesh(geometry, material)
wobble.customDepthMaterial = depthMaterial
wobble.receiveShadow = true
wobble.castShadow = true
scene.add(wobble)

// Tweaks
gui.add(uniforms.uPositionFrequency,'value',0,2,0.001).name('uPositionFrequency')
gui.add(uniforms.uStrength,'value',0,2,0.001).name('uStrength')
gui.add(uniforms.uTimeFrequency,'value',0,2,0.001).name('uTimeFrequency')

gui.add(uniforms.uWarpPositionFrequency,'value',0,2,0.001).name('uWarpPositionFrequency')
gui.add(uniforms.uWarpStrength,'value',0,2,0.001).name('uWarpStrength')
gui.add(uniforms.uWarpTimeFrequency,'value',0,2,0.001).name('uWarpTimeFrequency')

gui.addColor(debugObject,'colorA').onChange(()=>{
  uniforms.uColorA.value.set(debugObject.colorA)
})
gui.addColor(debugObject,'colorB').onChange(()=>{
  uniforms.uColorB.value.set(debugObject.colorB)
})


gui.add(material, 'metalness', 0, 1, 0.001)
gui.add(material, 'roughness', 0, 1, 0.001)
gui.add(material, 'transmission', 0, 1, 0.001)
gui.add(material, 'ior', 0, 10, 0.001)
gui.add(material, 'thickness', 0, 10, 0.001)
gui.addColor(material, 'color')
gui.add(directionalLight,'intensity',0,10,0.001).name('lightIntensity');
gui.add(directionalLight.position,'x',-10,10,0.001).name('lightX');
gui.add(directionalLight.position,'y',-10,10,0.001).name('lightY');
gui.add(directionalLight.position,'z',-10,10,0.001).name('lightZ');
gui.add(directionalLight.shadow, 'bias',-0.05,0.05,0.001)
gui.add(directionalLight.shadow, 'normalBias',-0.05,0.05,0.001)
gui.add(directionalLight,'castShadow').name('castShadow');
gui.add(scene,'environmentIntensity',0,10,0.001)

// gltfLoader.load(
//   '../static/models/LeePerrySmith/LeePerrySmith.glb',
//   (gltf) =>{
//     // gltf.scene.scale.set(0.2, 0.2,0.2);
//     const mesh = gltf.scene.children[0];
//     mesh.material = material
//     mesh.customDepthMaterial = depthMaterial
//     gltf.scene.position.set(0, 0,0 );
//     scene.add(mesh);
//     updateAllMaterials();
//   }
// )


const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize',()=>{
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 7;
camera.position.y = 5;
// camera.lookAt(wobble.position); 
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias:true //if devicePixelRatio is more than 1, it will cause performance issues
})
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

const renderOptions = {
  NoToneMapping: THREE.NoToneMapping,
  LinearToneMapping: THREE.LinearToneMapping,
  ReinhardToneMapping: THREE.ReinhardToneMapping,
  CineonToneMapping: THREE.CineonToneMapping,
  ACESFilmicToneMapping: THREE.ACESFilmicToneMapping,
}
gui.add(renderer,'toneMapping',renderOptions).onChange((value)=>{
  renderer.toneMapping = value;
})
gui.add(renderer,'toneMappingExposure',0,10,0.001)



const clock = new THREE.Clock();

function tick(){
  const elapsedTime = clock.getElapsedTime()
  uniforms.uTime.value = elapsedTime
  
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick();