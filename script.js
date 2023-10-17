const c = document.getElementById("canvas");
const vsSource = document.getElementById("vs").textContent;
const fsSource = document.getElementById("fs").textContent;
const renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true });
renderer.setSize(800, 450);
renderer.setPixelRatio(1);
const camera = new THREE.PerspectiveCamera(45, c.width / c.height);
camera.position.set(0, 0, 5);
//const controls = new THREE.OrbitControls(camera, c);
//controls.enableDamping = true;
//controls.dampingFactor = 0.1;
//controls.enablePan = false;
const sceneRT = new THREE.WebGLRenderTarget(c.width, c.height);
const backFaceRT = new THREE.WebGLRenderTarget(c.width, c.height);
const scene = new THREE.Scene();
// const backFaceScene = new THREE.Scene();

const texLoader = new THREE.TextureLoader();
const texture = texLoader.load("images/mv_bg.png");
texture.wrapS = THREE.ClampToBorderWrapping;
texture.wrapT = THREE.ClampToBorderWrapping;

const uniforms = {
    u_image: { type: "t", value: texture },
    resolution: { type: "v2", value: new THREE.Vector2(c.width, c.height) }
};

const modelLoader = new THREE.GLTFLoader();
modelLoader.load("models/drop_lowPoly_ICO.glb", function (gltf) {
    gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            setmeshs(child);
        }
    });
});

function setmeshs(child) {

    // for (let i = 0; i < 5; i++) {
    //     for (let j = 0; j < 5; j++) {
    //         const geometry = new THREE.SphereGeometry(0.25, 16, 8);
    //         const material = new THREE.MeshNormalMaterial();
    //         const mesh = new THREE.Mesh(geometry, material);
    //         mesh.position.set(i * 2 - 4.5, j * 2 - 4.5, -10);
    //         scene.add(mesh);
    //     }
    // }
    const pg = new THREE.PlaneGeometry(16, 16);
    const pm = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(pg, pm);
    plane.position.z = -15;
    scene.add(plane)


    const geometry = child.geometry;
    console.log(geometry.attributes.position);
    // const geometry = new THREE.SphereGeometry(1, 64, 32);
    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        side: THREE.FrontSide,
        vertexShader: vsSource,
        fragmentShader: fsSource
    });
    // material.flatShading = true;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.z = -20 * Math.PI / 180;
    scene.add(mesh);
    setControls(mesh);

    let t = 0;
    (function render() {
        mesh.visible = false;
        renderer.setRenderTarget(sceneRT);
        renderer.render(scene, camera);

        mesh.material.uniforms.u_image.value = sceneRT.texture;
        mesh.material.side = THREE.BackSide;
        mesh.visible = true;
        renderer.setRenderTarget(backFaceRT);
        renderer.render(scene, camera);

        mesh.material.uniforms.u_image.value = backFaceRT.texture;
        mesh.material.side = THREE.FrontSide;
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);

        // mesh.rotation.x += 1 * Math.PI / 180;
        // mesh.rotation.y += 1 * Math.PI / 180;
        // mesh.rotation.z += 1 * Math.PI / 180;

        //controls.update();
        t++;
        requestAnimationFrame(render);
    })()
}

renderer.setClearColor(0x000000, 1.0);
// scene.background = texture;

function setControls(obj) {
    let mouseDown = false;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let event = [null, 0];
    // let scale = 1.0;

    function onMouseDown(e, isMouse) {
        e.preventDefault();
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function onMouseMove(e, isMouse) {
        if (!mouseDown) { return; }
        e.preventDefault();
        let ForceX = e.clientX - mouseX;
        let ForceY = e.clientY - mouseY;
        mouseX = e.clientX;
        mouseY = e.clientY;
        obj.rotation.x += ForceY / 100;
        obj.rotation.y += ForceX / 100;
    }

    function onMouseUp(e) {
        e.preventDefault();
        mouseDown = false;
    }

    c.addEventListener("mousemove", function (e) {
        onMouseMove(e, true);
    });
    c.addEventListener("mousedown", function (e) {
        onMouseDown(e, true);
    });
    c.addEventListener("mouseup", function (e) {
        onMouseUp(e);
    });
    c.addEventListener("touchmove", function (e) {
        onMouseMove(e, false);
    });
    c.addEventListener("touchdown", function (e) {
        onMouseDown(e, false);
    });
    c.addEventListener("touchup", function (e) {
        onMouseUp(e);
    });
}