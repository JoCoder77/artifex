/**
 * Artifex 3D ASCII Engine
 * Renders a rotating 3D Torus Knot using character-based depth shading.
 */

class ASCII3D {
    constructor() {
        this.container = document.getElementById('ascii-3d-container');
        if (!this.container) return;

        this.pre = document.createElement('pre');
        this.container.appendChild(this.pre);

        this.A = 0; // Rotation around X
        this.B = 0; // Rotation around Z
        
        // Configuration
        this.width = 100; // Character columns
        this.height = 50; // Character rows
        
        this.chars = " .:-~=+*#%@"; // Shading palette
        
        this.animate();
    }

    renderFrame() {
        let z = new Array(this.width * this.height).fill(0);
        let b = new Array(this.width * this.height).fill(' ');

        // Animation angles
        this.A += 0.04;
        this.B += 0.02;

        const cA = Math.cos(this.A), sA = Math.sin(this.A);
        const cB = Math.cos(this.B), sB = Math.sin(this.B);

        // Render Torus Knot
        // Parameters for the knot shape
        const p = 3; 
        const q = 2;
        const radius = 15;
        const tubeRadius = 6;

        for (let t = 0; t < 6.28; t += 0.02) {
            for (let phi = 0; phi < 6.28; phi += 0.05) {
                
                // Torus Knot parameterization
                const r_inner = radius + tubeRadius * Math.cos(phi);
                const x0 = r_inner * Math.cos(p * t);
                const y0 = r_inner * Math.sin(p * t);
                const z0 = tubeRadius * Math.sin(phi) + Math.sin(q * t) * radius * 0.5;

                // Apply rotations
                // X rotation
                const y1 = y0 * cA - z0 * sA;
                const z1 = y0 * sA + z0 * cA;
                
                // Z rotation
                const x2 = x0 * cB - y1 * sB;
                const y2 = x0 * sB + y1 * cB;
                const z2 = z1 + 50; // Depth offset

                const ooz = 1 / z2; // One over Z for projection

                // Projection
                const xp = Math.floor(this.width / 2 + 40 * ooz * x2 * 2); // aspect correction
                const yp = Math.floor(this.height / 2 + 20 * ooz * y2);

                if (xp >= 0 && xp < this.width && yp >= 0 && yp < this.height) {
                    const idx = xp + yp * this.width;
                    if (ooz > z[idx]) {
                        z[idx] = ooz;
                        
                        // Fake a normal for shading (using phi and t)
                        let L = Math.floor((Math.cos(phi) + Math.sin(t * 2)) * 4 + 4);
                        L = Math.max(0, Math.min(this.chars.length - 1, L));
                        b[idx] = this.chars[L];
                    }
                }
            }
        }

        // Convert buffer to string
        let output = "";
        for (let k = 0; k < this.width * this.height; k++) {
            output += b[k];
            if (k % this.width === this.width - 1) output += "\n";
        }
        this.pre.innerText = output;
    }

    animate() {
        this.renderFrame();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ASCII3D();
});
