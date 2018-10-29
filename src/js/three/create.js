// const container = $("#three-container");
var camera, cubeCamera, orbitControls, scene, renderer, sunLight, sunLightHeper, hemiLight, hemiLightHelper, sunParameters, sky;
var clock = new THREE.Clock();

const THREE_CONTROLLER = {
	zoomToObject: function(obj) {
		obj.geometry.computeBoundingSphere();
		obj.geometry.computeBoundingBox();

		const boundingSphere = obj.geometry.boundingSphere;

		const offset = 1.25;

		const boundingBox = obj.geometry.boundingBox.clone();
		const center = boundingBox.getCenter();
		const size = boundingBox.getSize();

		// get the max side of the bounding box (fits to width OR height as needed )
		const maxDim = Math.max(size.x, size.y, size.z);
		const fov = camera.fov * (Math.PI / 180);
		let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));

		cameraZ *= offset; // zoom out a little so that objects don't fill the screen

		camera.position.z = cameraZ;

		const minZ = boundingBox.min.z;
		const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

		camera.far = cameraToFarEdge * 3;
		camera.updateProjectionMatrix();

		if (orbitControls) {
			// set camera to rotate around center of loaded object
			orbitControls.target = center;
			// prevent camera from zooming out far enough to create far plane cutoff
			orbitControls.maxDistance = cameraToFarEdge * 2;
			orbitControls.saveState();
		} else {
			camera.lookAt(center)
		}
	},
	updateSun: function() {}
};

(function() {

	var container, water;


	init();
	animate();

	function init() {

		container = document.getElementById('three-container');

		// RENDERER

		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		// Camera

		camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 100, ROUGH_SCENE_SIZE / 2);
		camera.position.set(ROUGH_SCENE_SIZE / 2, ROUGH_SCENE_SIZE / 2, ROUGH_SCENE_SIZE / 2);

		orbitControls = new THREE.OrbitControls(camera);

		scene = new THREE.Scene();
		scene.background = new THREE.Color(BACKGROUND_COLOR);

		// LIGHTS

		sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
		scene.add(sunLight);

		// Water

		var waterGeometry = new THREE.PlaneBufferGeometry(ROUGH_SCENE_SIZE, ROUGH_SCENE_SIZE);

		water = new THREE.Water(
			waterGeometry, {
				textureWidth: 1024,
				textureHeight: 1024,
				waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function(texture) {
					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				}),
				alpha: 0.7,
				sunDirection: sunLight.position.clone().normalize(),
				sunColor: 0xffffff,
				waterColor: 0xffffff,
				distortionScale: 50,
				fog: scene.fog !== undefined
			}
		);

		// water.rotation.x = -Math.PI / 2;

		scene.add(water);

		// Skybox

		var sky = new THREE.Sky();
		sky.scale.setScalar(ROUGH_SCENE_SIZE * 2);
		scene.add(sky);
		sky.material.opacity = 0.9;
		sky.material.transparent = true;

		console.log(sky);

		var uniforms = sky.material.uniforms;

		uniforms.turbidity.value = 10;
		uniforms.rayleigh.value = 2;
		uniforms.luminance.value = 1;
		uniforms.mieCoefficient.value = 0.005;
		uniforms.mieDirectionalG.value = 0.8;

		sunParameters = {
			distance: ROUGH_SCENE_SIZE,
			inclination: 0.3496,
			azimuth: 0.247
		};

		var cubeCamera = new THREE.CubeCamera(1, 20000, 256);
		cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;

		function updateSun() {

			var theta = Math.PI * (sunParameters.inclination - 0.5);
			var phi = 2 * Math.PI * (sunParameters.azimuth - 0.5);

			sunLight.position.z = ROUGH_SCENE_SIZE;

			sunLight.position.x = sunParameters.distance * Math.cos(phi);
			sunLight.position.y = sunParameters.distance * Math.sin(phi) * Math.sin(theta);
			// sunLight.position.z = sunParameters.distance * Math.sin(phi) * Math.cos(theta);

			sky.material.uniforms.sunPosition.value = sunLight.position.copy(sunLight.position);
			water.material.uniforms.sunDirection.value.copy(sunLight.position).normalize();
			water.material.uniforms.size.value = 0.0005;

			sunLightHeper = new THREE.DirectionalLightHelper(sunLight, 10);
			scene.add(sunLightHeper);

			cubeCamera.update(renderer, scene);

		}

		THREE_CONTROLLER.updateSun = updateSun;

		updateSun();

		scene.fog = new THREE.Fog(scene.background, ROUGH_SCENE_SIZE/200, ROUGH_SCENE_SIZE/10);

		window.addEventListener('resize', onWindowResize, false);
		// document.addEventListener('keydown', onKeyDown, false);

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}

	function animate() {
		requestAnimationFrame(animate);
		orbitControls.update();
		render();
	}

	function render() {

		var time = performance.now() * 0.001;

		water.material.uniforms.time.value += 0.1 / 60.0;

		renderer.render(scene, camera);


		// var delta = clock.getDelta();
		// renderer.render(scene, camera);

	}
})();
