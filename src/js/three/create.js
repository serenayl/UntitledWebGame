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
				alpha: 0.25,
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
			water.material.uniforms.size.value = 0.001;

			sunLightHeper = new THREE.DirectionalLightHelper(sunLight, 10);
			scene.add(sunLightHeper);

			cubeCamera.update(renderer, scene);

		}

		THREE_CONTROLLER.updateSun = updateSun;

		updateSun();




		scene.fog = new THREE.Fog(scene.background, ROUGH_SCENE_SIZE/200, ROUGH_SCENE_SIZE/10);
		// // scene.fog = new THREE.Fog(0xffffff, 0.015, 10000);
		//
		// // LIGHTS
		//
		// hemiLight = new THREE.HemisphereLight(0x111111, 0x330033, 0.6);
		// // hemiLight.color.setHSL(0.6, 1, 0.6);
		// // hemiLight.groundColor.setHSL(0.095, 1, 0.75);
		// hemiLight.position.set(0, 0, 0);
		// scene.add(hemiLight);
		//
		// hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
		// scene.add(hemiLightHelper);
		//
		// //
		//
		// sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
		// // sunLight.color.setHSL(0.1, 1, 0.95);
		// sunLight.position.set(0, 0, ROUGH_SCENE_SIZE);
		// // sunLight.position.multiplyScalar(30);
		// scene.add(sunLight);
		//
		// sunLight.castShadow = true;
		//
		// sunLight.shadow.mapSize.width = 2048;
		// sunLight.shadow.mapSize.height = 2048;
		//
		// var d = ROUGH_SCENE_SIZE;
		//
		// sunLight.shadow.camera.left = -d;
		// sunLight.shadow.camera.right = d;
		// sunLight.shadow.camera.top = d;
		// sunLight.shadow.camera.bottom = -d;
		//
		// sunLight.shadow.camera.far = ROUGH_SCENE_SIZE;
		// sunLight.shadow.bias = -0.0001;
		//
		//
		//
		// // GROUND
		//
		// var groundGeo = new THREE.PlaneBufferGeometry(ROUGH_SCENE_SIZE, ROUGH_SCENE_SIZE);
		// var groundMat = GROUND_MATERIAL;
		//
		// var ground = new THREE.Mesh(groundGeo, groundMat);
		// // ground.rotation.x = -Math.PI / 2;
		// ground.position.z = -1000;
		// scene.add(ground);
		//
		// ground.receiveShadow = true;
		//
		// // // Skybox
		// //
		// // sky = new THREE.Sky();
		// // sky.scale.setScalar(ROUGH_SCENE_SIZE);
		// // scene.add(sky);
		// //
		// // var uniforms = sky.material.uniforms;
		// //
		// // uniforms.turbidity.value = 10;
		// // uniforms.rayleigh.value = 2;
		// // uniforms.luminance.value = 1;
		// // uniforms.mieCoefficient.value = 0.005;
		// // uniforms.mieDirectionalG.value = 0.8;
		// //
		// // sunParameters = {
		// // 	distance: ROUGH_SCENE_SIZE,
		// // 	inclination: 0.49,
		// // 	azimuth: 0.205
		// // };
		// //
		// // cubeCamera = new THREE.CubeCamera(1, 20000, 256);
		// // cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
		//
		// // // skybox
		// // var cubeTextureLoader = new THREE.CubeTextureLoader();
		// // cubeTextureLoader.setPath('textures/cube/skybox/');
		// // var cubeTexture = cubeTextureLoader.load([
		// // 	'px.jpg', 'nx.jpg',
		// // 	'py.jpg', 'ny.jpg',
		// // 	'pz.jpg', 'nz.jpg',
		// // ]);
		// // var cubeShader = THREE.ShaderLib['cube'];
		// // cubeShader.uniforms['tCube'].value = cubeTexture;
		// // var skyBoxMaterial = new THREE.ShaderMaterial({
		// // 	fragmentShader: cubeShader.fragmentShader,
		// // 	vertexShader: cubeShader.vertexShader,
		// // 	uniforms: cubeShader.uniforms,
		// // 	side: THREE.BackSide
		// // });
		// // var skyBox = new THREE.Mesh(new THREE.BoxBufferGeometry(ROUGH_SCENE_SIZE, ROUGH_SCENE_SIZE, ROUGH_SCENE_SIZE), skyBoxMaterial);
		// // scene.add(skyBox);
		//
		// // light
		// var ambientLight = new THREE.AmbientLight(0x111111, 0.4);
		// scene.add(ambientLight);
		//
		//
		// // // SKYDOME
		// //
		// // var vertexShader = document.getElementById('vertexShader').textContent;
		// // var fragmentShader = document.getElementById('fragmentShader').textContent;
		// // var uniforms = {
		// // 	topColor: { value: new THREE.Color(0x0077ff) },
		// // 	bottomColor: { value: new THREE.Color(0xffffff) },
		// // 	// offset: { value: 33 },
		// // 	// exponent: { value: 0.6 }
		// // };
		// // uniforms.topColor.value.copy(hemiLight.color);
		// //
		// // // scene.fog.color.copy(uniforms.bottomColor.value);
		// //
		// // var skyGeo = new THREE.SphereBufferGeometry(100000, 32, 15);
		// // var skyMat = new THREE.ShaderMaterial({ vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide });
		// //
		// // var sky = new THREE.Mesh(skyGeo, skyMat);
		// // scene.add(sky);
		//

		//
		// renderer.gammaInput = true;
		// renderer.gammaOutput = true;
		//
		// renderer.shadowMap.enabled = true;
		//
		// /*
		// // STATS
		//
		// stats = new Stats();
		// container.appendChild( stats.dom );
		// */
		//
		// //

		window.addEventListener('resize', onWindowResize, false);
		// document.addEventListener('keydown', onKeyDown, false);

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}

	// function onKeyDown(event) {
	//
	// 	switch (event.keyCode) {
	//
	// 		case 72: // h
	//
	// 			hemiLight.visible = !hemiLight.visible;
	// 			hemiLightHelper.visible = !hemiLightHelper.visible;
	// 			break;
	//
	// 		case 68: // d
	//
	// 			sunLight.visible = !sunLight.visible;
	// 			sunLightHeper.visible = !sunLightHeper.visible;
	// 			break;
	//
	// 	}
	//
	// }

	function animate() {
		requestAnimationFrame(animate);
		orbitControls.update();
		render();
	}

	function render() {

		var time = performance.now() * 0.001;

		// sphere.position.y = Math.sin( time ) * 20 + 5;
		// sphere.rotation.x = time * 0.5;
		// sphere.rotation.z = time * 0.51;

		water.material.uniforms.time.value += 0.1 / 60.0;

		renderer.render(scene, camera);


		// var delta = clock.getDelta();
		// renderer.render(scene, camera);

	}
})();
