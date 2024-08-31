import * as THREE from 'three';
import type { Size2 } from './Utils';

export class Sea {
	private size: Size2;
	private geometry: THREE.PlaneGeometry;
	private material: THREE.MeshStandardMaterial;
	private seaMesh: THREE.Mesh;
	private waterNormalMap: THREE.Texture | null;
	private clock: THREE.Clock;
	private textureRepeat: number;
	private uniforms: {
		time: { value: number };
		grid: { value: number };
	};

	constructor(size: Size2, textureRepeat: number = 10) {
		this.size = size;
		this.textureRepeat = textureRepeat;
		this.waterNormalMap = null;
		this.clock = new THREE.Clock();
		this.geometry = new THREE.PlaneGeometry(this.size.w, this.size.h, 100, 100);
		this.geometry.rotateX(-Math.PI * 0.5);
		this.uniforms = {
			time: { value: 0 },
			grid: { value: this.size.w }
		};
		this.material = this.createSeaMaterial();
		this.seaMesh = new THREE.Mesh(this.geometry, this.material);
		this.seaMesh.scale.y = 0.2;
	}
	private createSeaMaterial(): THREE.MeshStandardMaterial {
		const material = new THREE.MeshStandardMaterial({
			color: 0x1060f0
		});

		material.onBeforeCompile = (shader) => {
			shader.uniforms.time = this.uniforms.time;
			shader.uniforms.grid = this.uniforms.grid;

			shader.vertexShader = `
                uniform float time;
                uniform float grid;  
                varying float vHeight;
                vec3 moveWave(vec3 p){
                    vec3 retVal = p;
                    float ang;
                    float kzx = 360.0/grid;
                    // Wave1 (135 degrees)
                    ang = 50.0*time + -1.0*p.x*kzx + -2.0*p.z*kzx;
                    ang = mod(ang, 360.0) * 3.14159265/180.0;
                    retVal.y = 3.0*sin(ang);
                    // Wave2 (090)
                    ang = 25.0*time + -3.0*p.x*kzx;
                    ang = mod(ang, 360.0) * 3.14159265/180.0;
                    retVal.y = retVal.y + 2.0*sin(ang);
                    // Wave3 (180 degrees)
                    ang = 15.0*time - 3.0*p.z*kzx;
                    ang = mod(ang, 360.0) * 3.14159265/180.0;
                    retVal.y = retVal.y + 2.0*sin(ang);
                    // Wave4 (225 degrees)
                    ang = 50.0*time + 4.0*p.x*kzx + 8.0*p.z*kzx;
                    ang = mod(ang, 360.0) * 3.14159265/180.0;
                    retVal.y = retVal.y + 0.5*sin(ang);
                    // Wave5 (270 degrees)
                    ang = 50.0*time + 8.0*p.x*kzx;
                    ang = mod(ang, 360.0) * 3.14159265/180.0;
                    retVal.y = retVal.y + 0.5*sin(ang);
                    return retVal;
                }					
                ${shader.vertexShader}
            `
				.replace(
					`#include <beginnormal_vertex>`,
					`#include <beginnormal_vertex>
                    vec3 p = position;
                    vec2 move = vec2(1, 0);
                    vec3 pos = moveWave(p);
                    vec3 pos2 = moveWave(p + move.xyy);
                    vec3 pos3 = moveWave(p + move.yyx);
                    objectNormal = normalize(cross(normalize(pos2-pos), normalize(pos3-pos)));
                `
				)
				.replace(
					`#include <begin_vertex>`,
					`#include <begin_vertex>
                    transformed = pos;
                    vHeight = pos.y;
                `
				);
		};

		return material;
	}

	mesh(): THREE.Mesh {
		return this.seaMesh;
	}

	update(): void {
		const elapsedTime = this.clock.getElapsedTime();
		this.uniforms.time.value = elapsedTime;

		if (this.waterNormalMap) {
			this.waterNormalMap.offset.x -= 0.0005;
			this.waterNormalMap.offset.y += 0.00025;
		}
	}
}
