//  example logging to console
myvector = new THREE.Vector3(3,4,5);
console.log('myvector =',myvector);

// SETUP RENDERER & SCENE
var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xd0f0d0); // set background colour
canvas.appendChild(renderer.domElement);

// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30,1,0.1,10000); // view angle, aspect ratio, near, far
camera.position.set(0,12,20);
camera.lookAt(0,0,0);
scene.add(camera);

// SETUP ORBIT CONTROLS OF THE CAMERA
var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;
controls.autoRotate = false;

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

// EVENT LISTENER RESIZE
window.addEventListener('resize',resize);
resize();

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
}

/////////////////////////////////////	
// ADD LIGHTS  and define a simple material that uses lighting
/////////////////////////////////////	

light = new THREE.PointLight(0xffffff);
light.position.set(0,4,4);
var vcsLight = new THREE.Vector3(light.position);
scene.add(light);
ambientLight = new THREE.AmbientLight(0x606060);
scene.add(ambientLight);

var diffuseMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
var diffuseMaterial2 = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide } );
var basicMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} );

///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  SHADERS /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

var textureLoader = new THREE.TextureLoader();

////////////////////// ENVMAP SHADER (and SkyBox textures)  /////////////////////////////

// posxTexture = textureLoader.load( "images/ABCD.jpg" );   // useful for debugging
posxTexture = textureLoader.load( "images/posx.jpg" ); 
posyTexture = textureLoader.load( "images/posy.jpg" ); 
poszTexture = textureLoader.load( "images/posz.jpg" ); 
negxTexture = textureLoader.load( "images/negx.jpg" ); 
negyTexture = textureLoader.load( "images/negy.jpg" ); 
negzTexture = textureLoader.load( "images/negz.jpg" ); 

minFilter = THREE.NearestFilter;
// minFilter = THREE.LinearMipMapLinearFilter;
magFilter = THREE.LinearFilter;

posxTexture.magFilter = magFilter;
posxTexture.minFilter = minFilter;
posyTexture.magFilter = magFilter;
posyTexture.minFilter = minFilter;
poszTexture.magFilter = magFilter;
poszTexture.minFilter = minFilter;
negxTexture.magFilter = magFilter;
negxTexture.minFilter = minFilter;
negyTexture.magFilter = magFilter;
negyTexture.minFilter = minFilter;
negzTexture.magFilter = magFilter;
negzTexture.minFilter = minFilter;

var envmapMaterial = new THREE.ShaderMaterial( {     
        uniforms: { 
           vcsLightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
	   matrixWorld: {value: new THREE.Matrix4()},
           uNegxTexture: {type: 't', value: negxTexture},
           uNegyTexture: {type: 't', value: negyTexture},
           uNegzTexture: {type: 't', value: negzTexture},
           uPosxTexture: {type: 't', value: posxTexture},
           uPosyTexture: {type: 't', value: posyTexture},
           uPoszTexture: {type: 't', value: poszTexture},
           myColor: { value: new THREE.Vector4(0.8,0.8,0.6,1.0) },
           time: {type: 'f', value: 0},
        },
	vertexShader: document.getElementById( 'myVertShader' ).textContent,
	fragmentShader: document.getElementById( 'envmapFragShader' ).textContent
} );

////////////////////// HOLEY SHADER /////////////////////////////

var holeyMaterial = new THREE.ShaderMaterial( {
        uniforms: { 
           vcsLightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
           myColor: { value: new THREE.Vector4(0.5,1.0,1.0,1.0) }
        },
	vertexShader: document.getElementById( 'myVertShader' ).textContent,
	fragmentShader: document.getElementById( 'holeyFragShader' ).textContent
} );

////////////////////// TOON SHADER /////////////////////////////

var toonMaterial = new THREE.ShaderMaterial( {
        uniforms: { 
           vcsLightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
           toonColor: { value: new THREE.Vector3(0.5,0.5,0.8) }
        },
	vertexShader: document.getElementById( 'toonVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'toonFragmentShader' ).textContent
} );

////////////////////// FLOOR SHADER /////////////////////////////

floorNormalTexture = textureLoader.load( "images/stone-map.png" ); 
floorTexture = textureLoader.load( "images/floor.jpg" );
floorTexture.magFilter = THREE.NearestFilter;
// TODO: changed to mipmap filter so smoother color
floorTexture.minFilter = THREE.LineartMipmapLinearFilter ;
floorNormalTexture.minFilter = THREE.NearestFilter;
floorNormalTexture.magFilter = THREE.NearestFilter;
var floorMaterial = new THREE.ShaderMaterial( {
        uniforms: { 
           vcsLightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
           myColor: { value: new THREE.Vector4(0.0,1.0,0.0,1.0) },
           normalMap: { type: 't', value: floorNormalTexture},
           textureMap: { type: 't', value: floorTexture}
        },
        side: THREE.DoubleSide,
	vertexShader: document.getElementById( 'floorVertShader' ).textContent,
	fragmentShader: document.getElementById( 'floorFragShader' ).textContent
} );
floorMaterial.uniforms.vcsLightPosition.value.needsUpdate = true;

///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  OBJECTS /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////	
// WORLD COORDINATE FRAME
/////////////////////////////////////	

var worldFrame = new THREE.AxesHelper(5) ;
scene.add(worldFrame);

/////////////////////////////////////	
// Skybox 
/////////////////////////////////////	

// TO DO: 
//  - add the other skybox faces:  negx, negy, posy, negz, posz
//  - after debugging, change size to 1000

var size = 200;
wallGeometry = new THREE.PlaneBufferGeometry(2*size, 2*size);

  // posxWall:  positive x-axis wall
posxMaterial = new THREE.MeshBasicMaterial( {map: posxTexture, side:THREE.DoubleSide });
posxWall = new THREE.Mesh(wallGeometry, posxMaterial);
posxWall.position.x = -size;
posxWall.rotation.y = -Math.PI / 2;
scene.add(posxWall);

  // negyWall:  negative y-axis wall
  negyMaterial = new THREE.MeshBasicMaterial( {map: negyTexture, side:THREE.DoubleSide });
  negyWall = new THREE.Mesh(wallGeometry, negyMaterial);
  negyWall.position.y = -size;
  negyWall.rotation.x = Math.PI/2;
  scene.add(negyWall);

  // negzWall:  negative z-axis wall
  negzMaterial = new THREE.MeshBasicMaterial( {map: negzTexture, side:THREE.DoubleSide });
  negzWall = new THREE.Mesh(wallGeometry, negzMaterial);
  negzWall.position.z = -size;
  negzWall.rotation.y = -Math.PI;
  scene.add(negzWall);

  // negxWall:  negative x-axis wall
  negxMaterial = new THREE.MeshBasicMaterial( {map: negxTexture, side:THREE.DoubleSide });
  negxWall = new THREE.Mesh(wallGeometry, negxMaterial);
  negxWall.position.x = size;
  negxWall.rotation.y = Math.PI / 2;
  scene.add(negxWall);

  // posyWall:  positive y-axis wall
  posyMaterial = new THREE.MeshBasicMaterial( {map: posyTexture, side:THREE.DoubleSide });
  posyWall = new THREE.Mesh(wallGeometry, posyMaterial);
  posyWall.position.y = size;
  posyWall.rotation.x = -Math.PI/2;
  scene.add(posyWall);


  // poszWall:  positive z-axis wall
  poszMaterial = new THREE.MeshBasicMaterial( {map: poszTexture, side:THREE.DoubleSide });
  poszWall = new THREE.Mesh(wallGeometry, poszMaterial);
  poszWall.position.z = size;
  scene.add(poszWall);


/////////////////////////////////////	
// FLOOR:  texture-map  &  normal-map
/////////////////////////////////////	

floorGeometry = new THREE.PlaneBufferGeometry(15, 15);
floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1.1;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

///////////////////////////////////////////////////////////////////////
//   sphere, representing the light 
///////////////////////////////////////////////////////////////////////

sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);    // radius, segments, segments
lightSphere = new THREE.Mesh(sphereGeometry, basicMaterial);
lightSphere.position.set(0,4,-5);
lightSphere.position.set(light.position.x, light.position.y, light.position.z);
scene.add(lightSphere);

/////////////////////////////////////////////////////////////////////////
// holey-shaded torus
/////////////////////////////////////////////////////////////////////////

// parameters:   radius of torus, diameter of tube, segments around radius, segments around torus
torusGeometry = new THREE.TorusGeometry( 1.2, 0.4, 10, 20 );
torus = new THREE.Mesh( torusGeometry, holeyMaterial);
torus.position.set(-3, 0.4, 0.3);   // translation
torus.rotation.set(0,0,0);     // rotation about x,y,z axes
scene.add( torus );

/////////////////////////////////////////////////////////////////////////
// toon-shaded torus
/////////////////////////////////////////////////////////////////////////

// parameters:   radius of torus, diameter of tube, segments around radius, segments around torus
torusGeometry = new THREE.TorusGeometry( 1.2, 0.4, 10, 20 );
torus = new THREE.Mesh( torusGeometry, toonMaterial);
torus.position.set(1.0, 0.4, 0.3);   // translation
torus.rotation.set(0,0,0);     // rotation about x,y,z axes
scene.add( torus );

/////////////////////////////////////	
// MIRROR:  square patch on the ground
/////////////////////////////////////	

mirrorGeometry = new THREE.PlaneBufferGeometry(4,4);
mirror = new THREE.Mesh(mirrorGeometry, envmapMaterial);
mirror.position.x = -2.0;
mirror.position.z = 4.0;
mirror.position.y = -1.0;
mirror.rotation.x = -Math.PI / 2;
scene.add(mirror);

/////////////////////////////////////	
// MARBLE:  square patch on the ground
/////////////////////////////////////	

var marbleMaterial = new THREE.ShaderMaterial( {
	vertexShader: document.getElementById( 'myVertShader' ).textContent,
	fragmentShader: document.getElementById( 'pnoiseFragShader' ).textContent,
        side: THREE.DoubleSide
} );

marbleGeometry = new THREE.PlaneBufferGeometry(4,4);
marble = new THREE.Mesh(marbleGeometry, marbleMaterial);
marble.position.x = 2.0;
marble.position.z = 4.0;
marble.position.y = -1.0;
marble.rotation.x = -Math.PI / 2;
scene.add(marble);

/////////////////////////////////////////////////////////////////////////
// sphere
/////////////////////////////////////////////////////////////////////////

sphereA = new THREE.Mesh( new THREE.SphereGeometry( 3, 20, 10 ), envmapMaterial );
sphereA.position.set(6,0,-1);
scene.add( sphereA );

///////////////////////////////////////////////////////////////////////////////////////
// LISTEN TO KEYBOARD
///////////////////////////////////////////////////////////////////////////////////////

var keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed("W")) {
    console.log('W pressed');
    light.position.y += 0.1;
  } else if (keyboard.pressed("S"))
    light.position.y -= 0.1;
  if (keyboard.pressed("A"))
    light.position.x -= 0.1;
  else if (keyboard.pressed("D"))
    light.position.x += 0.1;
  lightSphere.position.set(light.position.x, light.position.y, light.position.z);

    // compute light position in VCS coords,  supply this to the shaders
  vcsLight.set(light.position.x, light.position.y, light.position.z);
  vcsLight.applyMatrix4(camera.matrixWorldInverse);

  floorMaterial.uniforms.vcsLightPosition.value = vcsLight;
  floorMaterial.uniforms.vcsLightPosition.value.needsUpdate = true;
  toonMaterial.uniforms.vcsLightPosition.value = vcsLight;
  toonMaterial.uniforms.vcsLightPosition.value.needsUpdate = true;
  holeyMaterial.uniforms.vcsLightPosition.value = vcsLight;
  holeyMaterial.uniforms.vcsLightPosition.value.needsUpdate = true;
  envmapMaterial.uniforms.vcsLightPosition.value = vcsLight;
  envmapMaterial.uniforms.vcsLightPosition.value.needsUpdate = true;
}

///////////////////////////////////////////////////////////////////////////////////////
// UPDATE CALLBACK
///////////////////////////////////////////////////////////////////////////////////////
let startTime  = Date.now();
function update() {
  checkKeyboard();
  requestAnimationFrame(update);
  envmapMaterial.uniforms.matrixWorld.value = camera.matrixWorld;
  envmapMaterial.uniforms.matrixWorld.update = true;

  const currentTime = Date.now();
  const elapsedTime = (currentTime - startTime)*0.001;
  // so it doesn't run out of space
  if(elapsedTime > Math.pow(2,127)){startTime = currentTime};
  envmapMaterial.uniforms.time.value = elapsedTime;
  renderer.render(scene, camera);
}

update();

