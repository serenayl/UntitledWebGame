begin();

function begin() {
	if (!Module.File3dm) return setTimeout(begin, 100);

	loadModel("/3dm/terrain.3dm").then((model) => {
		const meshes = getMeshesFromModel(model, GROUND_MATERIAL);
		meshes.forEach(m => {
			scene.add(m);
			THREE_CONTROLLER.zoomToObject(m);
		});
	});
}


/*
 █████  ███    ██  ██████  ███    ██
██   ██ ████   ██ ██    ██ ████   ██
███████ ██ ██  ██ ██    ██ ██ ██  ██
██   ██ ██  ██ ██ ██    ██ ██  ██ ██
██   ██ ██   ████  ██████  ██   ████
*/

function getMeshesFromModel(model, material) {
	let objectTable = model.objects();
	let meshes = [];
	for (let i = 0; i < objectTable.count; i++) {
		let brep = objectTable.get(i).geometry();
		// brep.rotate(0, [1, 0, 0], [0, 0, 0]);
		meshes.push(meshToThreejs(brep, material));
	}
	return meshes;
}

function meshToThreejs(mesh, material) {
	var geometry = new THREE.BufferGeometry();
	var vertices = mesh.vertices();
	var vertexbuffer = new Float32Array(3 * vertices.count);
	for (var i = 0; i < vertices.count; i++) {
		let pt = vertices.get(i);
		let threeVec = new THREE.Vector3(pt[0], pt[1], pt[2]);
		vertexbuffer[i * 3] = pt[0];
		vertexbuffer[i * 3 + 1] = pt[1];
		vertexbuffer[i * 3 + 2] = pt[2];
	}
	// itemSize = 3 because there are 3 values (components) per vertex
	geometry.addAttribute('position', new THREE.BufferAttribute(vertexbuffer, 3));

	let indices = [];
	var faces = mesh.faces();
	for (var i = 0; i < faces.count; i++) {
		let face = faces.get(i);
		indices.push(face[0], face[1], face[2]);
		if (face[2] != face[3]) {
			indices.push(face[2], face[3], face[0]);
		}
	}
	geometry.setIndex(indices);

	var normals = mesh.normals();
	var normalBuffer = new Float32Array(3 * normals.count);
	for (var i = 0; i < normals.count; i++) {
		let pt = normals.get(i);
		normalBuffer[i * 3] = pt[0];
		normalBuffer[i * 3 + 1] = pt[1];
		normalBuffer[i * 3 + 2] = pt[1];
	}
	geometry.addAttribute('normal', new THREE.BufferAttribute(normalBuffer, 3));
	let newmesh = new THREE.Mesh(geometry, material);
	return newmesh;

}

function loadModel(url) {
	return new Promise(function(resolve, reject) {
		fetch(url).then((data) => {
			data.arrayBuffer().then(buffer => {
				const arr = new Uint8Array(buffer);
				const model = Module.File3dm.fromByteArray(arr);
				resolve(model);
			});
		});

	});
}
