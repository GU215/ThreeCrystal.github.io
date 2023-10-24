const c = document.getElementById("canvas");
const vsSource = document.getElementById("vs").textContent;
const fsSource = document.getElementById("fs").textContent;
const renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const camera = new THREE.PerspectiveCamera(45, c.width / c.height);
camera.position.set(0, 0, 5);
const sceneRT = new THREE.WebGLRenderTarget(c.width, c.height);
const backFaceRT = new THREE.WebGLRenderTarget(c.width, c.height);
const scene = new THREE.Scene();

const texLoader = new THREE.TextureLoader();
const texture = texLoader.load(backGroundTextureData);
texture.wrapS = THREE.ClampToBorderWrapping;
texture.wrapT = THREE.ClampToBorderWrapping;

const uniforms = {
    u_image: { type: "t", value: texture },
    resolution: { type: "v2", value: new THREE.Vector2(c.width, c.height) }
};

const pg = new THREE.PlaneGeometry(16, 16);
const pm = new THREE.MeshBasicMaterial({ map: texture });
const plane = new THREE.Mesh(pg, pm);
plane.position.z = -15;
scene.add(plane)

const geometry = new THREE.BufferGeometry();
geometry.setIndex(modelIndex);
geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(modelPosition), 3));
geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(modelNormal), 3));
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
mesh.position.y = -0.25;
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

    mesh.rotation.y += 0.5 * Math.PI / 180;

    // controls.update();
    t++;
    requestAnimationFrame(render);
})()

renderer.setClearColor(0x000000, 1.0);
// scene.background = texture;

function setControls(mesh) {
    let mouseDown = false;
    let mouseX = 0.5;
    let mouseY = 0.5;
    // let scale = 1.0;

    function onMouseDown(e, isMouse) {
        let m;
        if (isMouse) {
            m = e;
            m.preventDefault();
        } else {
            m = e.changedTouches[0];
        }
        mouseDown = true;
        mouseX = m.clientX;
        mouseY = m.clientY + c.height;
    }

    function onMouseMove(e, isMouse) {
        let m;
        if (isMouse) {
            m = e;
            if (!mouseDown) { return; }
            m.preventDefault();
        } else {
            m = e.changedTouches[0];
        }
        let ForceX = m.clientX - mouseX;
        let ForceY = (m.clientY - mouseY) + c.height;
        mouseX = m.clientX;
        mouseY = m.clientY + c.height;
        mesh.rotation.x += ForceY / 100;
        mesh.rotation.y += ForceX / 100;
    }

    function onMouseUp(e) {
        e.preventDefault();
        mouseDown = false;
    }

    // function onWheel(e) {
    //     e.preventDefault();
    //     scale += e.ForceY / -1000;
    // }

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
    // c.addEventListener("wheel", function(e) {
    //     onWheel(e);
    // }, {passive: true});
}
