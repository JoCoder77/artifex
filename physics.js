/**
 * Artifex 3D Physics Engine (Full-Page Wireframe Cubes)
 */

class FlingEngine {
    constructor() {
        this.container = document.getElementById('three-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        this.cubes = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.intersected = null;
        
        this.isDragging = false;
        this.dragOffset = new THREE.Vector3();
        this.prevMousePos = new THREE.Vector2();
        this.velocity = new THREE.Vector2();
        
        this.isSpinning = true;
        this.pixelToUnit = 0.0081; // Base conversion factor at z=5

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Allow clicks to pass through to the site UI
        this.renderer.domElement.style.pointerEvents = 'none';

        this.camera.position.z = 5;

        // Spawn 3 from left and 2 from right
        const spawnPoints = [
            { targetX: -5, y: 1, startX: -15 }, { targetX: -4, y: -2, startX: -15 }, { targetX: -6, y: 0, startX: -15 },
            { targetX: 5, y: 2, startX: 15 }, { targetX: 4, y: -1, startX: 15 }
        ];

        spawnPoints.forEach(p => this.createCube(p.targetX, p.y, p.startX));

        this.addEventListeners();
        this.initSpinToggle();
        this.animate();
    }

    initSpinToggle() {
        const btn = document.getElementById('spin-toggle');
        if (!btn) return;

        btn.addEventListener('click', () => {
            this.isSpinning = !this.isSpinning;
            btn.innerText = `Spin: ${this.isSpinning ? 'ON' : 'OFF'}`;
            btn.style.opacity = this.isSpinning ? '1' : '0.5';
        });
    }

    createCube(targetX, posY, startX) {
        const size = Math.random() * 0.5 + 0.5;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(startX, posY, 0);
        
        cube.userData = {
            targetPos: new THREE.Vector3(targetX, posY, 0),
            isEntering: true,
            velocity: new THREE.Vector3(0, 0, 0),
            rotationSpeed: new THREE.Vector3(
                Math.random() * 0.05,
                Math.random() * 0.05,
                Math.random() * 0.05
            )
        };

        this.scene.add(cube);
        this.cubes.push(cube);
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        window.addEventListener('pointermove', (e) => {
            this.onPointerMove(e);
            this.updateCursor(e);
        });
        window.addEventListener('pointerup', () => this.onPointerUp());
    }

    updateCursor(e) {
        if (this.isDragging) return;
        this.updateMouse(e);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cubes);
        document.body.style.cursor = intersects.length > 0 ? 'grab' : 'default';
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onPointerDown(e) {
        this.updateMouse(e);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cubes);
        if (intersects.length > 0) {
            this.isDragging = true;
            this.intersected = intersects[0].object;
            this.intersected.material.opacity = 1.0;
            this.intersected.userData.isEntering = false;
            this.prevMousePos.set(e.clientX, e.clientY);

            const tooltip = document.getElementById('cube-tooltip');
            if (tooltip) {
                tooltip.dataset.hidden = 'true';
                tooltip.style.opacity = '0';
                setTimeout(() => tooltip.remove(), 400);
            }
        }
    }

    onPointerMove(e) {
        this.updateMouse(e);
        if (this.isDragging && this.intersected) {
            const dx = e.clientX - this.prevMousePos.x;
            const dy = e.clientY - this.prevMousePos.y;
            this.velocity.set(dx * 0.005, -dy * 0.005);
            this.prevMousePos.set(e.clientX, e.clientY);

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const pos = new THREE.Vector3();
            this.raycaster.ray.at(5, pos); 
            this.intersected.position.copy(pos);
            
            this.intersected.rotation.x += 0.05;
            this.intersected.rotation.y += 0.05;
        }
    }

    onPointerUp() {
        if (this.isDragging && this.intersected) {
            this.intersected.userData.velocity.set(this.velocity.x, this.velocity.y, 0);
            this.intersected.material.opacity = 0.8;
        }
        this.isDragging = false;
        this.intersected = null;
    }

    updateMouse(e) {
        // Since canvas is fixed again, simple viewport mapping works
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Sync Camera to Scroll
        const scrollFactor = 0.0081; // Adjusted for perspective
        this.camera.position.y = -window.scrollY * scrollFactor;

        // Document boundaries in Three.js units
        const docHeight = document.documentElement.scrollHeight;
        const totalHeightUnits = docHeight * scrollFactor;
        const bottomBound = -totalHeightUnits + 4; // Buffer for camera offset
        const topBound = 4;
        const sideBound = 6;

        this.cubes.forEach((cube, index) => {
            if (this.intersected !== cube) {
                if (cube.userData.isEntering) {
                    cube.position.lerp(cube.userData.targetPos, 0.05);
                    if (this.isSpinning) {
                        cube.rotation.x += 0.05;
                        cube.rotation.y += 0.05;
                    }
                    if (cube.position.distanceTo(cube.userData.targetPos) < 0.01) {
                        cube.userData.isEntering = false;
                    }
                } else {
                    cube.position.add(cube.userData.velocity);
                    if (this.isSpinning) {
                        cube.rotation.x += cube.userData.rotationSpeed.x;
                        cube.rotation.y += cube.userData.rotationSpeed.y;
                        cube.rotation.z += cube.userData.rotationSpeed.z;
                    }
                    cube.userData.velocity.multiplyScalar(0.99); // Reduced friction

                    // bounce off sides
                    if (Math.abs(cube.position.x) > sideBound) {
                        cube.userData.velocity.x *= -1;
                        cube.position.x = Math.sign(cube.position.x) * sideBound;
                    }
                    // bounce off top and BOTTOM of entire page
                    if (cube.position.y > topBound) {
                        cube.userData.velocity.y *= -1;
                        cube.position.y = topBound;
                    }
                    if (cube.position.y < bottomBound) {
                        cube.userData.velocity.y *= -1;
                        cube.position.y = bottomBound;
                    }
                }

                if (index === 0) {
                    this.updateTooltip(cube);
                }
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    updateTooltip(cube) {
        const tooltip = document.getElementById('cube-tooltip');
        if (!tooltip || tooltip.dataset.hidden === 'true' || cube.userData.isEntering) return;

        const vector = cube.position.clone();
        vector.project(this.camera);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;

        // Since canvas is fixed and camera follows scroll, and tooltip is fixed...
        // Wait, if tooltip is absolute it will scroll with page.
        // I'll make the tooltip FIXED again so it follows the viewport coordinate.
        if (tooltip.style.position !== 'fixed') {
            tooltip.style.position = 'fixed';
        }

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;

        if (parseFloat(tooltip.style.opacity) < 1 || !tooltip.style.opacity) {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translate(-50%, -120%) scale(1)';
        }
    }
}

window.addEventListener('load', () => {
    new FlingEngine();
});
