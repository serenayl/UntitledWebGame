THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);

const GROUND_COLOR = "#bcafa0";
const SUN_COLOR = "0xffdd55";

const GROUND_MATERIAL = new THREE.MeshPhongMaterial({
	color: GROUND_COLOR,
	specular: 0x050505,
	flatShading: true
});

const SUN_MATERIAL = new THREE.MeshPhongMaterial({
	color: SUN_COLOR,
	specular: 0x050505,
	flatShading: true
});

const ROUGH_SCENE_SIZE = 1000000;

const BACKGROUND_COLOR = "#7c828c";
