import * as THREE from 'three';

import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/*
"VHF Skull Point Cloud" (https://skfb.ly/oAr7q) by Terrie is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
*/

let container;
let camera, cameraTarget, scene, renderer,composer;
let group, textMesh1, textMesh2, textGeo, material;
let firstLetter = true;
console.log( window.location);
const urlParams = new URLSearchParams(window.location.search);
const d = urlParams.get('id');
let text = d+' BASED';
const height = 0,
	size = 180,
	hover = 30,
	curveSegments = 12,
	bevelThickness = 2,
	bevelSize = 1;

let font = null;
const mirror = true;

let targetRotation = 0;
let targetRotationOnPointerDown = 0;
let skull;

let pointerX = 0;
let pointerXOnPointerDown = 0;

let windowHalfX = window.innerWidth / 2;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// CAMERA

	camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
	console.log(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000);
	//camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1500 );
	camera.position.set( 0, 0, 500 );

	cameraTarget = new THREE.Vector3( 0, 0, 0 );

	// SCENE

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x3f00ff);
	scene.fog = new THREE.Fog( 0x000000, 250, 1400 );

	// LIGHTS

	const dirLight1 = new THREE.DirectionalLight( 0xffffff, 5 );
	dirLight1.position.set( 0, 0, 1 ).normalize();
	scene.add( dirLight1 );

	// const dirLight2 = new THREE.DirectionalLight( 0xffffff, 2 );
	// dirLight2.position.set( 0, hover, 10 ).normalize();
	// dirLight2.color.setHSL( Math.random(), 1, 0.5, THREE.SRGBColorSpace );
	// scene.add( dirLight2 );

	material =  new THREE.MeshPhongMaterial( { color: 0xc0ff00, flatShading: true } );

	group = new THREE.Group();
	group.position.y = 100;

	scene.add( group );

	const loader = new TTFLoader();
	//TODO:this is for prod, switch to /<FONT> for local build
	loader.load( 'https://ipfs.io/ipfs/QmVMrTSDbEHQJRf7rqcwjxxK6MMhb3q753PqnnnWfnPNwm/FREEFATFONT-Regular.ttf', function ( json ) {
		font = new Font( json );
		createText();
	} );

	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry( 10000, 10000 ),
		new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
	);
	plane.position.y = 100;
	plane.rotation.x = - Math.PI / 2;
	scene.add( plane );

	// RENDERER

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	//EFFECTS
	composer = new EffectComposer( renderer );
	const renderPass = new RenderPass( scene, camera );
	composer.addPass( renderPass );
	const glitchPass = new GlitchPass();
	composer.addPass( glitchPass );

	const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), .18, 0.2, 0.85 );
	composer.addPass( bloomPass );

	const outputPass = new OutputPass();
	composer.addPass( outputPass );
	// EVENTS

	container.style.touchAction = 'none';
	container.addEventListener( 'pointerdown', onPointerDown );

	document.addEventListener( 'keypress', onDocumentKeyPress );
	document.addEventListener( 'keydown', onDocumentKeyDown );

	window.addEventListener( 'resize', onWindowResize );

	// Load a glTF resource
	const gtlfLoader = new GLTFLoader();
	gtlfLoader.load(
		// resource URL
		'/scene.gltf',
		// called when the resource is loaded
		function ( gltf ) {
			
			//gltf.scene.scale.set(500,500,200);
			gltf.scene.updateMatrixWorld( true )
			gltf.scene.rotation.y = Math.PI / 2;
			gltf.scene.scale.multiplyScalar(3500);
			const box = new THREE.Box3().setFromObject( gltf.scene );
			const center = box.getCenter( new THREE.Vector3() );

			gltf.scene.position.x += ( gltf.scene.position.x - center.x );
			gltf.scene.position.y += ( gltf.scene.position.y - center.y );
			gltf.scene.position.z += ( gltf.scene.position.z - center.z) ;
			
			//gltf.scene.position.set(0,-window.innerHeight , 0);
			group.add( gltf.scene );

			// gltf.animations; // Array<THREE.AnimationClip>
			// gltf.scene; // THREE.Group
			// gltf.scenes; // Array<THREE.Group>
			// gltf.cameras; // Array<THREE.Camera>
			// gltf.asset; // Object
			

		},
		// called while loading is progressing
		function ( xhr ) {

			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		},
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' );

	}
);

}
function gradientMaterial(){
	var material = new THREE.MeshBasicMaterial({
		roughness: 1,
		metalness: 0,
		side: THREE.DoubleSide,
		// map: new THREE.TextureLoader().load("https://threejs.org/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg", tex => {
		//   tex.wrapS = THREE.RepeatWrapping;
		//   tex.wrapT = THREE.RepeatWrapping;
		//   tex.repeat.set( 16, 1 );
		// }),
		onBeforeCompile: shader => {
			shader.uniforms.bbMin = uniforms.bbMin;
			shader.uniforms.bbMax = uniforms.bbMax;
			shader.uniforms.color1 = uniforms.color1;
			shader.uniforms.color2 = uniforms.color2;
			shader.uniforms.color3 = uniforms.color3;
			shader.vertexShader = `
			varying vec2 vUv;
			varying vec3 vPos;
		${shader.vertexShader}
		`.replace(
			`#include <begin_vertex>`,
			`#include <begin_vertex>
		vPos = transformed;
		vUv = uv;
		`
			);
			shader.fragmentShader = `
			uniform vec3 bbMin;
		uniform vec3 bbMax;
		uniform vec3 color1;
		uniform vec3 color2;
		uniform vec3 color3;
		varying vec2 vUv;
		varying vec3 vPos;
		${shader.fragmentShader}
		`.replace(
			`vec4 diffuseColor = vec4( diffuse, opacity );`,
			`
		float f = clamp((vPos.z - bbMin.z) / (bbMax.z - bbMin.z), 0., 1.);
		vec3 col = mix(color1, color2, f);
		col = mix(color3, col, vUv.x);
		vec4 diffuseColor = vec4( col, opacity );`
			);
			//console.log(shader.vertexShader);
			//console.log(shader.fragmentShader);
		}
		});
		return material;
}


function onWindowResize() {

	windowHalfX = window.innerWidth / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentKeyDown( event ) {

	if ( firstLetter ) {

		firstLetter = false;
		text = '';

	}

	const keyCode = event.keyCode;

	// backspace

	if ( keyCode === 8 ) {

		event.preventDefault();

		text = text.substring( 0, text.length - 1 );
		refreshText();

		return false;

	}

}

function onDocumentKeyPress( event ) {

	const keyCode = event.which;

	// backspace

	if ( keyCode === 8 ) {

		event.preventDefault();

	} else {

		const ch = String.fromCharCode( keyCode );
		text += ch;

		refreshText();

	}

}

function createText() {

	textGeo = new TextGeometry( text, {

		font: font,

		size: size,
		height: height,
		curveSegments: curveSegments,

		bevelThickness: bevelThickness,
		bevelSize: bevelSize,
		bevelEnabled: true,
		


	} );

	textGeo.computeBoundingBox();
	textGeo.computeVertexNormals();

	const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
	const centerOffsetY = - 0.5 * ( textGeo.boundingBox.max.y - textGeo.boundingBox.min.y )

	textMesh1 = new THREE.Mesh( textGeo, material );

	textMesh1.position.x = centerOffset;
	textMesh1.position.y = centerOffsetY - height/2;
	textMesh1.position.z = 0;

	textMesh1.rotation.x = 0;
	//textMesh1.scale.set(1,1.5,1);
	//textMesh1.rotation.y = Math.PI * 2;

	group.add( textMesh1 );

	// if ( mirror ) {

	// 	textMesh2 = new THREE.Mesh( textGeo, material );

	// 	textMesh2.position.x = centerOffset;
	// 	textMesh2.position.y = - hover;
	// 	textMesh2.position.z = height;

	// 	textMesh2.rotation.x = Math.PI;
	// 	textMesh2.rotation.y = Math.PI * 2;

	// 	group.add( textMesh2 );

	// }

}

function refreshText() {

	group.remove( textMesh1 );
	if ( mirror ) group.remove( textMesh2 );

	if ( ! text ) return;

	createText();

}

function onPointerDown( event ) {

	if ( event.isPrimary === false ) return;

	pointerXOnPointerDown = event.clientX - windowHalfX;
	targetRotationOnPointerDown = targetRotation;

	document.addEventListener( 'pointermove', onPointerMove );
	document.addEventListener( 'pointerup', onPointerUp );

}

function onPointerMove( event ) {

	if ( event.isPrimary === false ) return;

	pointerX = event.clientX - windowHalfX;

	targetRotation = targetRotationOnPointerDown + ( pointerX - pointerXOnPointerDown ) * 0.02;

}

function onPointerUp() {

	if ( event.isPrimary === false ) return;

	document.removeEventListener( 'pointermove', onPointerMove );
	document.removeEventListener( 'pointerup', onPointerUp );

}

//

function animate() {

	requestAnimationFrame( animate );

	group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;

	camera.lookAt( cameraTarget );

	//renderer.render( scene, camera );
	composer.render()

}