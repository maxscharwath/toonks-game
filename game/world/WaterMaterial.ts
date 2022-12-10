import {ShaderMaterial, UniformsLib} from 'three';
import {type THREE} from 'enable3d';

const vertexShader = `
#include <fog_pars_vertex>
uniform float time;
varying vec2 vUv;
void main() {
	vUv = uv;	
	#include <begin_vertex>
	#include <project_vertex>
	#include <fog_vertex>
	
    vec3 newPos = position;
    float t = time*0.001;
    // create a lot of tiny waves
    newPos.z += 0.05 * sin( 2000.0 * ( newPos.x + t*0.001 ) ) * sin( 1000.0 * ( newPos.y + t*0.01 ) );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
	
}
`;

const fragmentShader = `

#include <common>
#include <packing>
#include <fog_pars_fragment>

varying vec2 vUv;
uniform sampler2D waterTexture;
uniform float time;

void main() {	
    float scale = 1.0/0.02;
	vec4 waterColor = texture2D(waterTexture, vUv * mat2(scale, 0.0, 0.0, scale) + 0.01*vec2(cos(time*0.00001), sin(time*0.00001)));
	gl_FragColor = vec4(waterColor.rgb, 1.0);
	gl_FragColor.a = 0.4;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}
`;

export class WaterMaterial extends ShaderMaterial {
	constructor(waterTexture: THREE.Texture) {
		super({
			uniforms: {
				...UniformsLib.fog,
				waterTexture: {value: waterTexture},
				time: {value: 0},
			},
			vertexShader,
			fragmentShader,
			fog: true,
			transparent: true,
		});
		const update = () => {
			this.uniforms.time.value = performance.now();
			requestAnimationFrame(update);
		};

		update();
	}
}
