import {MeshStandardMaterial, type Shader} from 'three';
import {type THREE} from 'enable3d';
import {type WebGLRenderer} from 'three/src/renderers/WebGLRenderer';

type HeightMapMaterialParams = {
	oceanTexture: THREE.Texture;
	sandTexture: THREE.Texture;
	grassTexture: THREE.Texture;
	rockTexture: THREE.Texture;
	snowTexture: THREE.Texture;
};

export class HeightMapMaterial extends MeshStandardMaterial {
	constructor(private readonly options: HeightMapMaterialParams) {
		super({});
	}

	public onBeforeCompile(shader: Shader, renderer: WebGLRenderer) {
		shader.uniforms.oceanTexture = {value: this.options.oceanTexture};
		shader.uniforms.sandTexture = {value: this.options.sandTexture};
		shader.uniforms.grassTexture = {value: this.options.grassTexture};
		shader.uniforms.rockTexture = {value: this.options.rockTexture};
		shader.uniforms.snowTexture = {value: this.options.snowTexture};

		shader.vertexShader = `
			varying vec3 vViewPosition;
			#ifdef USE_TRANSMISSION
			  varying vec3 vWorldPosition;
			#endif
			#include <common>
			#include <uv_pars_vertex>
			#include <uv2_pars_vertex>
			#include <displacementmap_pars_vertex>
			#include <color_pars_vertex>
			#include <fog_pars_vertex>
			#include <normal_pars_vertex>
			#include <morphtarget_pars_vertex>
			#include <skinning_pars_vertex>
			#include <shadowmap_pars_vertex>
			#include <logdepthbuf_pars_vertex>
			#include <clipping_planes_pars_vertex>
			
			varying vec2 vUV;
			varying float vHeight;
			
			void main() {
			  vUV = uv; 
			  vHeight = (position.z ) / 8.0;
			
			  #include <uv_vertex>
			  #include <uv2_vertex>
			  #include <color_vertex>
			  #include <morphcolor_vertex>
			  #include <beginnormal_vertex>
			  #include <morphnormal_vertex>
			  #include <skinbase_vertex>
			  #include <skinnormal_vertex>
			  #include <defaultnormal_vertex>
			  #include <normal_vertex>
			  #include <begin_vertex>
			  #include <morphtarget_vertex>
			  #include <skinning_vertex>
			  #include <displacementmap_vertex>
			  #include <project_vertex>
			  #include <logdepthbuf_vertex>
			  #include <clipping_planes_vertex>
			  vViewPosition = - mvPosition.xyz;
			  #include <worldpos_vertex>
			  #include <shadowmap_vertex>
			  #include <fog_vertex>
			#ifdef USE_TRANSMISSION
			  vWorldPosition = worldPosition.xyz;
			#endif
			}
		`;
		shader.fragmentShader = `
			#ifdef PHYSICAL
			  #define IOR
			  #define SPECULAR
			#endif
			uniform vec3 diffuse;
			uniform vec3 emissive;
			uniform float roughness;
			uniform float metalness;
			uniform float opacity;
			#ifdef IOR
			  uniform float ior;
			#endif
			#ifdef SPECULAR
			  uniform float specularIntensity;
			  uniform vec3 specularColor;
			  #ifdef USE_SPECULARINTENSITYMAP
				uniform sampler2D specularIntensityMap;
			  #endif
			  #ifdef USE_SPECULARCOLORMAP
				uniform sampler2D specularColorMap;
			  #endif
			#endif
			#ifdef USE_CLEARCOAT
			  uniform float clearcoat;
			  uniform float clearcoatRoughness;
			#endif
			#ifdef USE_IRIDESCENCE
			  uniform float iridescence;
			  uniform float iridescenceIOR;
			  uniform float iridescenceThicknessMinimum;
			  uniform float iridescenceThicknessMaximum;
			#endif
			#ifdef USE_SHEEN
			  uniform vec3 sheenColor;
			  uniform float sheenRoughness;
			  #ifdef USE_SHEENCOLORMAP
				uniform sampler2D sheenColorMap;
			  #endif
			  #ifdef USE_SHEENROUGHNESSMAP
				uniform sampler2D sheenRoughnessMap;
			  #endif
			#endif
			varying vec3 vViewPosition;
			#include <common>
			#include <packing>
			#include <dithering_pars_fragment>
			#include <color_pars_fragment>
			#include <uv_pars_fragment>
			#include <uv2_pars_fragment>
			#include <map_pars_fragment>
			#include <alphamap_pars_fragment>
			#include <alphatest_pars_fragment>
			#include <aomap_pars_fragment>
			#include <lightmap_pars_fragment>
			#include <emissivemap_pars_fragment>
			#include <bsdfs>
			#include <iridescence_fragment>
			#include <cube_uv_reflection_fragment>
			#include <envmap_common_pars_fragment>
			#include <envmap_physical_pars_fragment>
			#include <fog_pars_fragment>
			#include <lights_pars_begin>
			#include <normal_pars_fragment>
			#include <lights_physical_pars_fragment>
			#include <transmission_pars_fragment>
			#include <shadowmap_pars_fragment>
			#include <bumpmap_pars_fragment>
			#include <normalmap_pars_fragment>
			#include <clearcoat_pars_fragment>
			#include <iridescence_pars_fragment>
			#include <roughnessmap_pars_fragment>
			#include <metalnessmap_pars_fragment>
			#include <logdepthbuf_pars_fragment>
			#include <clipping_planes_pars_fragment>
			
			uniform sampler2D oceanTexture;
			uniform sampler2D sandTexture;
			uniform sampler2D grassTexture;
			uniform sampler2D rockTexture;
			uniform sampler2D snowTexture;
			
			varying vec2 vUV;
			varying float vHeight;
			
			void main() {
			  #include <clipping_planes_fragment>
			  vec4 diffuseColor = vec4( diffuse, opacity );
			  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
			  vec3 totalEmissiveRadiance = emissive;
			  #include <logdepthbuf_fragment>
			  #include <map_fragment>
			  
			  float vH = vHeight + (sin(vUV.x * 50.0) * 0.02 + sin(vUV.y * 20.0) * 0.01);
			  
			  vec4 water = (smoothstep(0.01, 0.25, vH) - smoothstep(0.24, 0.26, vH)) * texture2D( oceanTexture, vUV * 10.0 );
			  vec4 sandy = (smoothstep(0.24, 0.27, vH) - smoothstep(0.28, 0.31, vH)) * texture2D( sandTexture, vUV * 10.0 );
			  vec4 grass = (smoothstep(0.28, 0.32, vH) - smoothstep(0.35, 0.40, vH)) * texture2D( grassTexture, vUV * 20.0 );
			  vec4 rocky = (smoothstep(0.30, 0.50, vH) - smoothstep(0.40, 0.70, vH)) * texture2D( rockTexture, vUV * 20.0 );
			  vec4 snowy = (smoothstep(0.50, 0.65, vH))                                   * texture2D( snowTexture, vUV * 10.0 );
			
			
			  diffuseColor  = vec4(0.0, 0.0, 0.0, 1.0) + water + sandy + grass + rocky + snowy;
			  
			  #include <alphamap_fragment>
			  #include <alphatest_fragment>
			  #include <roughnessmap_fragment>
			  #include <metalnessmap_fragment>
			  #include <normal_fragment_begin>
			  #include <normal_fragment_maps>
			  #include <clearcoat_normal_fragment_begin>
			  #include <clearcoat_normal_fragment_maps>
			  #include <emissivemap_fragment>
			  #include <lights_physical_fragment>
			  #include <lights_fragment_begin>
			  #include <lights_fragment_maps>
			  #include <lights_fragment_end>
			  #include <aomap_fragment>
			  vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
			  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
			  #include <transmission_fragment>
			  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
			  #ifdef USE_SHEEN
				float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
				outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
			  #endif
			  #ifdef USE_CLEARCOAT
				float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
				vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
				outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
			  #endif
			  #include <output_fragment>
			  #include <tonemapping_fragment>
			  #include <encodings_fragment>
			  #include <fog_fragment>
			  #include <premultiplied_alpha_fragment>
			  #include <dithering_fragment>
			}
		`;
	}
}
