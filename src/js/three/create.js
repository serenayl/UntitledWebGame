// const container = $("#three-container");
var camera, orbitControls, scene, renderer, dirLight, dirLightHeper, hemiLight, hemiLightHelper;
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
	}
};

(function() {


	init();
	animate();

	function init() {

		var container = document.getElementById('three-container');

		camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000);
		camera.position.set(0, 0, 250);
		camera.up = new THREE.Vector3(0, 0, 1);


		orbitControls = new THREE.OrbitControls(camera);

		scene = new THREE.Scene();
		scene.background = new THREE.Color().setHSL(0.6, 0, 1);
		scene.fog = new THREE.Fog(scene.background, 1, 5000);
		//
		// LIGHTS

		hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
		hemiLight.color.setHSL(0.6, 1, 0.6);
		hemiLight.groundColor.setHSL(0.095, 1, 0.75);
		hemiLight.position.set(0, 50, 0);
		scene.add(hemiLight);

		hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
		scene.add(hemiLightHelper);

		// //
		//
		// dirLight = new THREE.DirectionalLight(0xffffff, 1);
		// dirLight.color.setHSL(0.1, 1, 0.95);
		// dirLight.position.set(-1, 1.75, 1);
		// dirLight.position.multiplyScalar(30);
		// scene.add(dirLight);
		//
		// dirLight.castShadow = true;
		//
		// dirLight.shadow.mapSize.width = 2048;
		// dirLight.shadow.mapSize.height = 2048;
		//
		// var d = 50;
		//
		// dirLight.shadow.camera.left = -d;
		// dirLight.shadow.camera.right = d;
		// dirLight.shadow.camera.top = d;
		// dirLight.shadow.camera.bottom = -d;
		//
		// dirLight.shadow.camera.far = 3500;
		// dirLight.shadow.bias = -0.0001;
		//
		// dirLightHeper = new THREE.DirectionalLightHelper(dirLight, 10);
		// scene.add(dirLightHeper);
		//
		// // GROUND
		//
		// var groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
		// var groundMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x050505 });
		// groundMat.color.setHSL(0.095, 1, 0.75);
		//
		// var ground = new THREE.Mesh(groundGeo, groundMat);
		// ground.rotation.x = -Math.PI / 2;
		// ground.position.y = -33;
		// scene.add(ground);

		// ground.receiveShadow = true;
		//
		// // SKYDOME
		//
		// var vertexShader = document.getElementById('vertexShader').textContent;
		// var fragmentShader = document.getElementById('fragmentShader').textContent;
		// var uniforms = {
		// 	topColor: { value: new THREE.Color(0x0077ff) },
		// 	bottomColor: { value: new THREE.Color(0xffffff) },
		// 	offset: { value: 33 },
		// 	exponent: { value: 0.6 }
		// };
		// uniforms.topColor.value.copy(hemiLight.color);

		// scene.fog.color.copy(uniforms.bottomColor.value);

		// var skyGeo = new THREE.SphereBufferGeometry(4000, 32, 15);
		// var skyMat = new THREE.ShaderMaterial({ vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide });
		//
		// var sky = new THREE.Mesh(skyGeo, skyMat);
		// scene.add(sky);

		// RENDERER

		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		// renderer.gammaInput = true;
		// renderer.gammaOutput = true;
		//
		// renderer.shadowMap.enabled = true;

		/*
		// STATS

		stats = new Stats();
		container.appendChild( stats.dom );
		*/

		//

		window.addEventListener('resize', onWindowResize, false);
		document.addEventListener('keydown', onKeyDown, false);

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}

	function onKeyDown(event) {

		switch (event.keyCode) {

			case 72: // h

				hemiLight.visible = !hemiLight.visible;
				hemiLightHelper.visible = !hemiLightHelper.visible;
				break;

			case 68: // d

				dirLight.visible = !dirLight.visible;
				dirLightHeper.visible = !dirLightHeper.visible;
				break;

		}

	}

	//

	function animate() {

		requestAnimationFrame(animate);
		orbitControls.update();

		render();
		// stats.update();

	}

	function render() {

		var delta = clock.getDelta();

		/*
        for ( var i = 0; i < mixers.length; i ++ ) {

            mixers[ i ].update( delta );

        }
*/
		renderer.render(scene, camera);

	}
})();
