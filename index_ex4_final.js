import * as THREE from './modules/three.module.js';

main();

function main() {
    // create context
    const canvas = document.querySelector("#c");
    const gl = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    // create camera
    const angleOfView = 55;
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const nearPlane = 0.1;
    const farPlane = 100;
    const camera = new THREE.PerspectiveCamera(
        angleOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.set(0, 8, 30);

    // create the scene
    const scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();
    
    // Load the background image
    const backgroundTexture = textureLoader.load('textures/langit.jpg'); // Replace with your image path
    scene.background = backgroundTexture;  // Set the background to the loaded image

    const fog = new THREE.Fog("grey", 1,90);
    scene.fog = fog;

    // GEOMETRY
    // create the cube
    const cubeSize = 4;
    const cubeGeometry = new THREE.BoxGeometry(
        cubeSize,
        cubeSize,
        cubeSize
    );  

    // Create the Sphere
    const sphereRadius = 3;
    const sphereWidthSegments = 32;
    const sphereHeightSegments = 16;
    const sphereGeometry = new THREE.SphereGeometry(
        sphereRadius,
        sphereWidthSegments,
        sphereHeightSegments
    );

    // Create the upright plane
    const planeWidth = 256;
    const planeHeight =  128;
    const planeGeometry = new THREE.PlaneGeometry(
        planeWidth,
        planeHeight
    );

    // MATERIALS
    // Load texture for the cube and sphere
    const cubeTexture = textureLoader.load('textures/batu.jpg');  // Replace with your cube texture JPG
    const sphereTexture = textureLoader.load('textures/peta.jpg');  // Replace with your sphere texture JPG

    // Apply texture to the cube and sphere using MeshBasicMaterial
    const cubeMaterial = new THREE.MeshBasicMaterial({
        map: cubeTexture,
    });

    const sphereMaterial = new THREE.MeshBasicMaterial({
        map: sphereTexture,
    });

    const planeTextureMap = textureLoader.load('textures/rumput.jpg');
    planeTextureMap.wrapS = THREE.RepeatWrapping;
    planeTextureMap.wrapT = THREE.RepeatWrapping;
    planeTextureMap.repeat.set(16, 16);
    planeTextureMap.minFilter = THREE.NearestFilter;
    planeTextureMap.anisotropy = gl.getMaxAnisotropy();
    const planeNorm = textureLoader.load('textures/rumput.png');
    planeNorm.wrapS = THREE.RepeatWrapping;
    planeNorm.wrapT = THREE.RepeatWrapping;
    planeNorm.minFilter = THREE.NearestFilter;
    planeNorm.repeat.set(16, 16);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: planeTextureMap,
        side: THREE.DoubleSide,
        normalMap: planeNorm 
    });

    // MESHES
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(cubeSize + 1, cubeSize + 1, 0);
    scene.add(cube);

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(sphere);

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    //scene.add(plane);

    //LIGHTS
    const color = 0xffffff;
    const intensity = .7;
    const light = new THREE.DirectionalLight(color, intensity);
    light.target = plane;
    light.position.set(0, 30, 30);  // Set static position for the light
    scene.add(light);
    scene.add(light.target);

    const ambientColor = 0xffffff;
    const ambientIntensity = 0.5;  // Increase ambient light intensity
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);

    // Optional: Add a hemisphere light for better overall illumination
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
    scene.add(hemisphereLight);

    // Variables to control earthquake effect
    let earthquakeIntensity = 0.09;  // Control how strong the shake is
    let earthquakeDuration = 5;  // Duration of the earthquake

    // Variables for rain effect
    const rainCount = 10000;  // Number of rain particles
    const rainGeometry = new THREE.BufferGeometry();
    const rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.1,
        transparent: true
    });

    // Positions for the rain particles
    const rainPositions = new Float32Array(rainCount * 3); // Each rain particle needs 3 values (x, y, z)
    for (let i = 0; i < rainCount * 3; i += 3) {
        rainPositions[i] = (Math.random() - 0.5) * 100;  // X
        rainPositions[i + 1] = Math.random() * 50;  // Y (height)
        rainPositions[i + 2] = (Math.random() - 0.5) * 100;  // Z
    }

    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rain = new THREE.Points(rainGeometry, rainMaterial);
    scene.add(rain);

    // DRAW
    function draw(time){
        time *= 0.006;

        if (resizeGLToDisplaySize(gl)) {
            const canvas = gl.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        // Earthquake effect logic
        if (earthquakeDuration > 0) {
            camera.position.x += (Math.random() - 0.5) * earthquakeIntensity;
            camera.position.y += (Math.random() - 0.5) * earthquakeIntensity;
            camera.position.z += (Math.random() - 0.5) * earthquakeIntensity;

            earthquakeDuration -= 1;
        }

        // Animate rain particles
        const rainPositions = rain.geometry.attributes.position.array;
        for (let i = 0; i < rainCount * 3; i += 3) {
            rainPositions[i + 1] -= 0.2;  // Move each rain particle downwards
            if (rainPositions[i + 1] < 0) {  // If the rain reaches the ground, reset its height
                rainPositions[i + 1] = 50;
            }
        }
        rain.geometry.attributes.position.needsUpdate = true;  // Update the rain particles

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.01;

        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;
        sphere.rotation.y += 0.01;

        gl.render(scene, camera);
        requestAnimationFrame(draw);
    }

    // Start the draw loop
    requestAnimationFrame(draw);

    // Trigger earthquake on a timer
    setInterval(() => {
        earthquakeDuration = 100;  // Set earthquake duration
    }, 5000);  // Trigger earthquake every 5 seconds
}

// UPDATE RESIZE
function resizeGLToDisplaySize(gl) {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width != width || canvas.height != height;
    if (needResize) {
        gl.setSize(width, height, false);
    }
    return needResize;
}
