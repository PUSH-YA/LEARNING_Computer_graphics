console.log('underwater scene');
var a=7;  
var b=2.6;
console.log('a=',a,'b=',b);
var myvector = new THREE.Vector3(0,1,2);
console.log('myvector =',myvector);

var animation = true;
var meshesLoaded = false;
var RESOURCES_LOADED = false;
var deg2rad = Math.PI/180;

// give the following global scope (within in this file), which is useful for motions and objects
// that are related to animation

  // setup animation data structure, including a call-back function to use to update the model matrix
var treeMotion = new Motion(treeSetMatrices); 
var seaHorseMotion = new Motion(seaHorseSetMatrices);

var link_head, link_snout, link_mouth, link_neck, link_spine;
var linkFrame_head, linkFrame_snout, linkFrame_mouth, linkFrame_neck, linkFrame_spine;
var sphere;    
var tree1;     
var meshes = {};  


// SETUP RENDERER & SCENE

var canvas = document.getElementById('canvas');
var camera;
var light;
var ambientLight;
var seaHorseJump = false;
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setClearColor(0x135c7c);     // set background colour
canvas.appendChild(renderer.domElement);
SH_HEIGHT = 5 // sea horse's height

//////////////////////////////////////////////////////////
//  initCamera():   SETUP CAMERA
//////////////////////////////////////////////////////////

function initCamera() {
    // set up M_proj    (internally:  camera.projectionMatrix )
    var cameraFov = 40;     // initial camera vertical field of view, in degrees
      // view angle, aspect ratio, near, far
    camera = new THREE.PerspectiveCamera(cameraFov,1,0.1,1000); 

    var width = 20;  var height = 15;

//    An example of setting up an orthographic projection using threejs:
//    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0.1, 1000 );

    // set up M_view:   (internally:  camera.matrixWorldInverse )
    camera.position.set(0,5,20);
    camera.up = new THREE.Vector3(0,1,0);
    camera.lookAt(0,0,0);
    scene.add(camera);

      // SETUP ORBIT CONTROLS OF THE CAMERA (user control of rotation, pan, zoom)
//    const controls = new OrbitControls( camera, renderer.domElement );
    var controls = new THREE.OrbitControls(camera);
    controls.damping = 0.2;
    controls.autoRotate = false;
};

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
}

////////////////////////////////////////////////////////////////////////	
// init():  setup up scene
////////////////////////////////////////////////////////////////////////	

function init() {
    console.log('init called');

    initCamera();
    initMotions();
    initLights();
    initObjects();
    initseaHorse();
    initFileObjects();

    window.addEventListener('resize',resize);
    resize();
};

////////////////////////////////////////////////////////////////////////
// initMotions():  setup Motion instances for each object that we wish to animate
////////////////////////////////////////////////////////////////////////
function initMotions() {

      // keyframes for the tree animated motion:   name, time, [x1scaling, z1scaling, x2scaling, z2scaling, x3scaling, z3scaling]
    treeMotion.addKeyFrame(new Keyframe('pose A',0.0, [1.1, 1.1, 1.3, 1.3, 1.2, 1.2]));
    treeMotion.addKeyFrame(new Keyframe('pose B',1.0, [1.2, 1.2, 1.2, 1.2, 1.1, 1.1]));
    treeMotion.addKeyFrame(new Keyframe('pose B',1.0, [1.3, 1.3, 1.1, 1.1, 1.2, 1.2]));
    treeMotion.addKeyFrame(new Keyframe('pose B',1.0, [1.2, 1.2, 1.2, 1.3, 1.3, 1.3]));
    treeMotion.addKeyFrame(new Keyframe('pose B',1.0, [1.1, 1.1, 1.2, 1.2, 1.2, 1.2]));

    seaHorseAnim = 1
    updateSeaHorseAnimation()
}

function updateSeaHorseAnimation() {
    seaHorseMotion.keyFrameArray = []
    curr_index = parseInt(seaHorseMotion.currTime)
    steps = 10
    // keyframes for seaHorse:    name, time, [x, y, z, theta0, theta1, theta2, theta3, theta4, theta5, theta6]
    
    if (seaHorseJump){
        jumptimes = [0.0,0.5,1.0,0.5,0.0,0.5,1.0,0.5,0.0,0.5,0]
    }else{
        jumptimes = [0,0,0,0,0,0,0,0,0,0,0]
    }
    if (seaHorseAnim == 1) {
        new_keyFrameArray = [
            new Keyframe('straight', 0.0, [0, 3,0, 0,  0, 0, 0, 0, 0, 0]),
            new Keyframe('something 2',1.0, [1,  3+jumptimes[0], 0, -360/steps,0 ,-5,6, 6, 19,30]),
            new Keyframe('something 2',2.0, [2,  3+jumptimes[1], 1, -360/steps*2,0, -10, 12, 10, 20,-30]),
            new Keyframe('something 2',3.0, [2,  3+jumptimes[2], 2, -360/steps*3,0, -15, 18, 20, 30, 30]),
            new Keyframe('something 2',4.0, [1,  3+jumptimes[3], 3, -360/steps*4,0, -20, 24, 30, 40,-30]),
            new Keyframe('something 2',5.0, [0,  3+jumptimes[4], 3.5, -360/steps*5,0, -25, 30, 40, 50,30]), 
            new Keyframe('something 2',6.0, [-1, 3+jumptimes[5], 3, -360/steps*6,0, -25, 30, 40, 50,30]),
            new Keyframe('something 2',7.0, [-2, 3+jumptimes[6], 2, -360/steps*7,0, -20, 24, 30, 40,-30]),
            new Keyframe('something 2',8.0, [-2, 3+jumptimes[7], 1, -360/steps*8,0, -15, 18, 20, 30, 30]),
            new Keyframe('something 2',9.0, [-1, 3+jumptimes[8], 0, -360/steps*9,0, -10, 12, 10, 20,-30]),
            new Keyframe('something 2',10.0, [0, 3+jumptimes[9], 0, -360/steps*10,0,  -5,6, 6, 19,30]),
        ]
    } else {
        new_keyFrameArray = [
            new Keyframe('straight',   0.0,  [0,  3+jumptimes[0], 0,  -360/2, 0, 0, 0, 0, 0,0]),
            new Keyframe('something 2',1.0,  [-1, 3+jumptimes[1], 0,  -360/2+360/steps, 0,-5,6, 6, 19,30]),
            new Keyframe('something 2',2.0, [-2,  3+jumptimes[2], 1,   -360/2 + 360/steps*2,0, -10, 12, 10, 20,-30]),
            new Keyframe('something 2',3.0, [-2,  3+jumptimes[3], 2,   -360/2 + 360/steps*3,0, -15, 18, 20, 30, 30]),
            new Keyframe('something 2',4.0, [-1,  3+jumptimes[4], 3,   -360/2 + 360/steps*4,0, -20, 24, 30, 40,-30]),
            new Keyframe('something 2',5.0, [0,   3+jumptimes[5], 3.5,  -360/2 + 360/steps*5,0, -25, 30, 40, 50,30]),
            new Keyframe('something 2', 6.0, [1,  3+jumptimes[6], 3,   -360/2 + 360/steps*6,0, -25, 30, 40, 50,30]),
            new Keyframe('something 2', 7.0, [2,  3+jumptimes[7], 2,   -360/2 + 360/steps*7,0 ,-5,6, 6, 19,30]),
            new Keyframe('something 2', 8.0, [2,  3+jumptimes[8], 1,   -360/2 + 360/steps*8,0, -10, 12, 10, 20,-30]),
            new Keyframe('something 2', 9.0, [1,  3+jumptimes[9], 0,   -360/2 + 360/steps*9,0, -15, 18, 20, 30, 30]),
            new Keyframe('something 2',10.0, [0,  3+jumptimes[10], 0,   -360/2,0, -20, 24, 30, 40,-30])
        ]
    }

    // var start_index =  new_keyFrameArray.length - curr_index % new_keyFrameArray.length;
    // for (let i = start_index; i < new_keyFrameArray.length; i++) {
    //     seaHorseMotion.addKeyFrame(new_keyFrameArray[i]);
    // }
    // for (let i = 0; i < start_index; i++) {
    //     seaHorseMotion.addKeyFrame(new_keyFrameArray[i]);
    // }
    seaHorseMotion.reset()
    for(let i = 0; i < 11; i++){
        seaHorseMotion.addKeyFrame(new_keyFrameArray[i]);
    }
}


///////////////////////////////////////////////////////////////////////////////////////
// treeSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function treeSetMatrices(avars) {
    // note:  in the code below, we use the same keyframe information to animate both
    //        the box and the tree, i.e., avars[], although only the tree uses avars[3], as a rotation

     // update position of a tree
    var x1scaling = avars[0];
    var z1scaling = avars[1];
    meshes["tree1"].matrixAutoUpdate = false;
    meshes["tree1"].matrix.identity();
    meshes["tree1"].matrix.multiply(new THREE.Matrix4().makeTranslation(0,-1,-1));    
    meshes["tree1"].matrix.multiply(new THREE.Matrix4().makeScale(0.5*x1scaling,0.5,0.5*z1scaling));
    meshes["tree1"].updateMatrixWorld();  

    var x2scaling = avars[2];
    var z2scaling = avars[3];
    meshes["tree2"].matrixAutoUpdate = false;
    meshes["tree2"].matrix.identity();
    meshes["tree2"].matrix.multiply(new THREE.Matrix4().makeTranslation(-5,-1,1)); 
    meshes["tree2"].matrix.multiply(new THREE.Matrix4().makeScale(0.5*x2scaling,0.5,0.5*z2scaling));
    meshes["tree2"].updateMatrixWorld();  

    var x3scaling = avars[4];
    var z3scaling = avars[5];
    meshes["tree3"].matrixAutoUpdate = false;
    meshes["tree3"].matrix.identity();
    meshes["tree3"].matrix.multiply(new THREE.Matrix4().makeTranslation(5,-1,1)); 
    meshes["tree3"].matrix.multiply(new THREE.Matrix4().makeScale(0.5*x3scaling,0.5,0.5*z3scaling));
    meshes["tree3"].updateMatrixWorld();  
}

///////////////////////////////////////////////////////////////////////////////////////
// seaHorseSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function seaHorseSetMatrices(avars) {
    var xPosition = avars[0];
    var yPosition = avars[1];
    var zPosition = avars[2];
    var theta0 = avars[3]*deg2rad
    var theta1 = avars[4]*deg2rad;
    var theta2 = avars[5]*deg2rad;
    var theta3 = avars[6]*deg2rad;
    var theta4 = avars[7]*deg2rad;
    var theta5 = avars[8]*deg2rad;
    var theta6 = avars[9]*deg2rad;
    var M =  new THREE.Matrix4();
    

      ////////////// link_head 
    linkFrame_head.matrix.identity(); 
    linkFrame_head.matrix.multiply(M.makeTranslation(xPosition,yPosition,zPosition));
    linkFrame_head.matrix.multiply(M.makeRotationZ(theta1));    
    linkFrame_head.matrix.multiply(M.makeRotationY(theta0));    
    link_head.matrix.copy(linkFrame_head.matrix);
// 

    //   ////////////// link_snout
    linkFrame_snout.matrix.copy(linkFrame_head.matrix);      // start with parent frame
    linkFrame_snout.matrix.multiply(M.makeTranslation(0.1*SH_HEIGHT,-0.1,0));
      // Frame established
    link_snout.matrix.copy(linkFrame_snout.matrix);
    link_snout.matrix.multiply(M.makeRotationZ(-Math.PI/2-0.1)) 

   

      ///////////////  link_mouth
    linkFrame_mouth.matrix.copy(linkFrame_snout.matrix);
    linkFrame_mouth.matrix.multiply(M.makeTranslation(0.3,-0.05,0));
      // Frame established
    link_mouth.matrix.copy(linkFrame_mouth.matrix);
      
    ///////////////// link 4
    linkFrame_neck.matrix.copy(linkFrame_head.matrix);
    linkFrame_neck.matrix.multiply(M.makeTranslation(-0.3,-0.17*SH_HEIGHT*0.5,0));
    linkFrame_neck.matrix.multiply(M.makeRotationZ(theta2))
      // Frame established
    link_neck.matrix.copy(linkFrame_neck.matrix);
    link_neck.matrix.multiply(M.makeRotationZ(-Math.PI/4))
    link_neck.matrix.multiply(M.makeScale(1, 1+Math.abs(Math.sin(theta1)), 1)); // scale accordingly
    

     ///////////////// link 5
    linkFrame_spine.matrix.copy(linkFrame_neck.matrix);
    linkFrame_spine.matrix.multiply(M.makeTranslation(-0.15,-0.3*SH_HEIGHT*0.5,0));;    
      // Frame established
    link_spine.matrix.copy(linkFrame_spine.matrix);


    ///////////////// link 11
    linkFrame_belly.matrix.copy(linkFrame_spine.matrix);
    linkFrame_belly.matrix.multiply(M.makeTranslation(0.2,0,0));   
    // Frame established
    link_belly.matrix.copy(linkFrame_belly.matrix); 
    link_belly.matrix.multiply(M.makeScale(0.7,1.5,0.7))   

    ///////////////// link 12
    linkFrame_fin.matrix.copy(linkFrame_spine.matrix);
    linkFrame_fin.matrix.multiply(M.makeTranslation(0,-1,0));   
    linkFrame_fin.matrix.multiply(M.makeRotationY(theta6));
    // Frame established
    link_fin.matrix.copy(linkFrame_fin.matrix); 

     ///////////////// link 6
    linkFrame_tail1.matrix.copy(linkFrame_spine.matrix);
    linkFrame_tail1.matrix.multiply(M.makeTranslation(0,-0.25*SH_HEIGHT*0.5-0.07*SH_HEIGHT,0));
    linkFrame_tail2.matrix.multiply(M.makeRotationZ(theta3));
      // Frame established
    link_tail1.matrix.copy(linkFrame_tail1.matrix);  

     ///////////////// link 7
    linkFrame_tail2.matrix.copy(linkFrame_tail1.matrix);
    linkFrame_tail2.matrix.multiply(M.makeTranslation(0,-0.07*SH_HEIGHT,0));
    linkFrame_tail2.matrix.multiply(M.makeRotationZ(theta3));    
     // Frame established
    link_tail2.matrix.copy(linkFrame_tail2.matrix);  

    ///////////////// link 8
    linkFrame_tail3.matrix.copy(linkFrame_tail2.matrix);
    linkFrame_tail3.matrix.multiply(M.makeTranslation(0,-0.07*SH_HEIGHT,0));
    linkFrame_tail3.matrix.multiply(M.makeRotationZ(theta4));    
    // Frame established
    link_tail3.matrix.copy(linkFrame_tail3.matrix);
    
    ///////////////// link 9
    linkFrame_tail4.matrix.copy(linkFrame_tail3.matrix);
    linkFrame_tail4.matrix.multiply(M.makeTranslation(0,-0.07*SH_HEIGHT,0));
    linkFrame_tail4.matrix.multiply(M.makeRotationZ(theta5));    
    // Frame established
    link_tail4.matrix.copy(linkFrame_tail4.matrix);

    ///////////////// link 10
    linkFrame_tip.matrix.copy(linkFrame_tail4.matrix);
    linkFrame_tip.matrix.multiply(M.makeTranslation(0,-0.07*SH_HEIGHT,0));
    linkFrame_tip.matrix.multiply(M.makeRotationZ(theta5));    
    // Frame established
    link_tip.matrix.copy(linkFrame_tip.matrix);
    

    link_head.updateMatrixWorld();
    link_snout.updateMatrixWorld();
    link_mouth.updateMatrixWorld();
    link_neck.updateMatrixWorld();
    link_spine.updateMatrixWorld();
    link_tail1.updateMatrixWorld();
    link_tail2.updateMatrixWorld();
    link_tail3.updateMatrixWorld();
    link_tail4.updateMatrixWorld();
    link_tip.updateMatrixWorld();
    link_belly.updateMatrixWorld();

    linkFrame_head.updateMatrixWorld();
    linkFrame_snout.updateMatrixWorld();
    linkFrame_mouth.updateMatrixWorld();
    linkFrame_neck.updateMatrixWorld();
    linkFrame_spine.updateMatrixWorld();
    linkFrame_tail1.updateMatrixWorld();
    linkFrame_tail2.updateMatrixWorld();
    linkFrame_tail3.updateMatrixWorld();
    linkFrame_tail4.updateMatrixWorld();
    linkFrame_tip.updateMatrixWorld();
    linkFrame_belly.updateMatrixWorld();
}

/////////////////////////////////////	
// initLights():  SETUP LIGHTS
/////////////////////////////////////	

function initLights() {
    light = new THREE.PointLight(0xffffff);
    light.position.set(0,4,2);
    scene.add(light);
    ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
}

/////////////////////////////////////	
// MATERIALS
/////////////////////////////////////	

var diffuseMaterial = new THREE.MeshLambertMaterial( {color: 0xffaaff} );
var diffuseMaterial2 = new THREE.MeshLambertMaterial( {color: 0xaaffff, side: THREE.DoubleSide } );
var archMaterial = new THREE.MeshLambertMaterial( {color: 0x5D2B1F, side: THREE.DoubleSide } );
var basicMaterial = new THREE.MeshBasicMaterial( {color: 0xaaaa00} );

/////////////////////////////////////	
// initObjects():  setup objects in the scene
/////////////////////////////////////	

function initObjects() {
    var worldFrame = new THREE.AxesHelper(5) ;
    scene.add(worldFrame);


    // textured floor
    var floorTexture = new THREE.TextureLoader().load('images/large_ocean_bed.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(1, 1);
    var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
    var floorGeometry = new THREE.PlaneGeometry(35, 35);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -1.1;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    // sphere, located at light position
    var sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);    // radius, segments, segments
    sphere = new THREE.Mesh(sphereGeometry, basicMaterial);
    sphere.position.set(0,4,2);
    sphere.position.set(light.position.x, light.position.y, light.position.z);
    scene.add(sphere);

    var shell1Geometry = new THREE.SphereGeometry(0.3, 32, 32);    // radius, segments, segments
    shell1 = new THREE.Mesh(shell1Geometry, diffuseMaterial);
    shell1.position.set(-3.5,-1,6);
    shell1.scale.set(6,4,2);
    scene.add(shell1);

    var shell2Geometry = new THREE.SphereGeometry(0.3, 32, 32);    // radius, segments, segments
    shell2 = new THREE.Mesh(shell2Geometry, diffuseMaterial2);
    shell2.position.set(3.5,-1,6);
    shell2.scale.set(3,4,6);
    scene.add(shell2);

    var archGeometry = new THREE.TorusGeometry(17, 10, 32, 32);
    arch = new THREE.Mesh(archGeometry, archMaterial);
    arch.position.set(0,0,-20);
    scene.add(arch);

    // water
    waterGeometry = new THREE.BoxGeometry(35,1,35);    // radius, segments, segments
    waterTexture = new THREE.MeshBasicMaterial({ color: 0x00fff, transparent: true });
    waterTexture.opacity = 0.5;
    water = new THREE.Mesh(waterGeometry, waterTexture)
    water.position.set(0,-1,0);
    scene.add(water);
}

/////////////////////////////////////////////////////////////////////////////////////
//  initseaHorse():  define all geometry associated with the seaHorse
/////////////////////////////////////////////////////////////////////////////////////

function initseaHorse() {
        /////////////////////////////////////
    //  FIN 
    ////////////////////////////////////
    fin_height = SH_HEIGHT/3;
    fin_width = fin_height/2;
    var finGeometry = new THREE.Geometry(); 
    var verticesArray  =[
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(-fin_width,1/4*fin_height,0),
        new THREE.Vector3(0,1/4*fin_height,0),
        new THREE.Vector3(0,3/4*fin_height,0),
        new THREE.Vector3(-fin_width,3/4*fin_height,0),
        new THREE.Vector3(0,fin_height,0),
    ];;
    
    finGeometry.vertices.push(...verticesArray);
    
    finGeometry.faces.push( new THREE.Face3( 2,1,0) );
    finGeometry.faces.push( new THREE.Face3( 3,1,2 ) );
    finGeometry.faces.push( new THREE.Face3( 3,4,1 ) );
    finGeometry.faces.push( new THREE.Face3( 5,4,3 ) );
    finGeometry.faces.push( new THREE.Face3( 0,1,2) );
    finGeometry.faces.push( new THREE.Face3( 2,1,3 ) );
    finGeometry.faces.push( new THREE.Face3( 1,4,3 ) );
    finGeometry.faces.push( new THREE.Face3( 3,4,5 ) );
    finGeometry.computeFaceNormals();

    var outerSkinMaterial = new THREE.MeshLambertMaterial( {color: 0x6f2Da8} );
    var tailSkinMaterial = new THREE.MeshLambertMaterial( {color: 0x7f3Db8} );
    var underSkinMaterial = new THREE.MeshLambertMaterial( {color: 0x555500} );
    var headGeometry = new THREE.SphereGeometry(0.17*SH_HEIGHT*0.5,32,32)    // rad, segments, segments
    var snoutGeometry = new THREE.CylinderGeometry( 0.1, 0.2, 0.1*SH_HEIGHT, 20, 4 ); // radiusTop, radiusBot, height, radialSegments, heightSegments
    var mouthGeometry = new THREE.SphereGeometry( 0.1, 20, 4 );
    var neckGeometry = new THREE.CylinderGeometry(0.1*SH_HEIGHT*0.5,0.1*SH_HEIGHT*0.5+0.1, 0.3, 20)
    var spineGeometry = new THREE.CylinderGeometry( 0.12*SH_HEIGHT*0.5, 0.14*SH_HEIGHT*0.5, 0.33*SH_HEIGHT,20)
    tail_dec = 0.14*SH_HEIGHT*0.5/5 // how much the tail should decrease in width
    var tail1Geometry = new THREE.CylinderGeometry( 0.14*SH_HEIGHT*0.5, 0.14*SH_HEIGHT*0.5 - tail_dec, 0.1*SH_HEIGHT,20)
    var tail2Geometry = new THREE.CylinderGeometry( 0.14*SH_HEIGHT*0.5 - tail_dec,0.14*SH_HEIGHT*0.5 - tail_dec*2, 0.1*SH_HEIGHT,20)
    var tail3Geometry = new THREE.CylinderGeometry( 0.14*SH_HEIGHT*0.5 - tail_dec*2,0.14*SH_HEIGHT*0.5 - tail_dec*3, 0.1*SH_HEIGHT,20)
    var tail4Geometry = new THREE.CylinderGeometry( 0.14*SH_HEIGHT*0.5 - tail_dec*3,0.14*SH_HEIGHT*0.5 - tail_dec*4, 0.1*SH_HEIGHT,20)
    var tipGeometry = new THREE.CylinderGeometry( 0.14*SH_HEIGHT*0.5 - tail_dec*4,0, 0.07*SH_HEIGHT,20)
    var bellyGeometry = new THREE.SphereGeometry(0.5,32,32);


    link_head = new THREE.Mesh( headGeometry, outerSkinMaterial );  scene.add( link_head );
    linkFrame_head   = new THREE.AxesHelper(0) ;   ;
    link_snout = new THREE.Mesh( snoutGeometry, outerSkinMaterial );  scene.add( link_snout );
    linkFrame_snout   = new THREE.AxesHelper(1) ;   
    link_mouth = new THREE.Mesh( mouthGeometry, outerSkinMaterial );  scene.add( link_mouth );
    linkFrame_mouth   = new THREE.AxesHelper(1) ;   
    link_neck = new THREE.Mesh( neckGeometry, outerSkinMaterial );  scene.add( link_neck );
    linkFrame_neck   = new THREE.AxesHelper(1) ; 
    link_spine = new THREE.Mesh( spineGeometry, outerSkinMaterial );  scene.add( link_spine );
    linkFrame_spine   = new THREE.AxesHelper(1) ;   
    link_tail1 = new THREE.Mesh( tail1Geometry, tailSkinMaterial );  scene.add( link_tail1 );
    linkFrame_tail1   = new THREE.AxesHelper(1) ;  
    link_tail2 = new THREE.Mesh( tail2Geometry, tailSkinMaterial );  scene.add( link_tail2 );
    linkFrame_tail2   = new THREE.AxesHelper(1) ;  
    link_tail3 = new THREE.Mesh( tail3Geometry, tailSkinMaterial );  scene.add( link_tail3 );
    linkFrame_tail3   = new THREE.AxesHelper(1) ;  
    link_tail4 = new THREE.Mesh( tail4Geometry, tailSkinMaterial );  scene.add( link_tail4 );
    linkFrame_tail4   = new THREE.AxesHelper(1) ;  
    link_tip = new THREE.Mesh( tipGeometry, tailSkinMaterial );  scene.add( link_tip );
    linkFrame_tip   = new THREE.AxesHelper(1) ;   
    link_belly = new THREE.Mesh( bellyGeometry, underSkinMaterial );  scene.add( link_belly );
    linkFrame_belly   = new THREE.AxesHelper(1) ;  
    link_fin = new THREE.Mesh( finGeometry, underSkinMaterial );  scene.add( link_fin );
    linkFrame_fin   = new THREE.AxesHelper(1) ;  

    

    link_head.matrixAutoUpdate = false;  
    link_snout.matrixAutoUpdate = false;  
    link_mouth.matrixAutoUpdate = false;  
    link_neck.matrixAutoUpdate = false;  
    link_spine.matrixAutoUpdate = false;
    link_tail1.matrixAutoUpdate = false;
    link_tail2.matrixAutoUpdate = false;
    link_tail3.matrixAutoUpdate = false;
    link_tail4.matrixAutoUpdate = false;
    link_tip.matrixAutoUpdate = false;
    link_belly.matrixAutoUpdate = false;
    link_fin.matrixAutoUpdate = false;

    linkFrame_head.matrixAutoUpdate = false;  
    linkFrame_snout.matrixAutoUpdate = false;  
    linkFrame_mouth.matrixAutoUpdate = false;  
    linkFrame_neck.matrixAutoUpdate = false;  
    linkFrame_spine.matrixAutoUpdate = false;
    linkFrame_tail1.matrixAutoUpdate = false;
    linkFrame_tail2.matrixAutoUpdate = false;
    linkFrame_tail3.matrixAutoUpdate = false;
    linkFrame_tail4.matrixAutoUpdate = false;
    linkFrame_tip.matrixAutoUpdate = false;
    linkFrame_belly.matrixAutoUpdate = false;
    linkFrame_fin.matrixAutoUpdate = false;
}

/////////////////////////////////////////////////////////////////////////////////////
//  create customShader material
/////////////////////////////////////////////////////////////////////////////////////

var customTree1Material = new THREE.ShaderMaterial( {
//        uniforms: { textureSampler: {type: 't', value: floorTexture}},
	vertexShader: document.getElementById( 'customVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'customTree1FragmentShader' ).textContent
} );
var customTree2Material = new THREE.ShaderMaterial( {
    //        uniforms: { textureSampler: {type: 't', value: floorTexture}},
        vertexShader: document.getElementById( 'customVertexShader' ).textContent,
        fragmentShader: document.getElementById( 'customTree2FragmentShader' ).textContent
    } );
var customTree3Material = new THREE.ShaderMaterial( {
    //        uniforms: { textureSampler: {type: 't', value: floorTexture}},
        vertexShader: document.getElementById( 'customVertexShader' ).textContent,
        fragmentShader: document.getElementById( 'customTree3FragmentShader' ).textContent
    } );
// var ctx = renderer.context;
// ctx.getShaderInfoLog = function () { return '' };   // stops shader warnings, seen in some browsers

////////////////////////////////////////////////////////////////////////	
// initFileObjects():    read object data from OBJ files;  see onResourcesLoaded() for instances
////////////////////////////////////////////////////////////////////////	

var models;

function initFileObjects() {
        // list of OBJ files that we want to load, and their material
    models = {     
	tree1:    {obj:"obj/tree_coral.obj", mtl: customTree1Material, mesh: null },
	tree2:    {obj:"obj/tree_coral.obj", mtl: customTree2Material, mesh: null },
	tree3:    {obj:"obj/tree_coral.obj", mtl: customTree3Material, mesh: null }
    };

    var manager = new THREE.LoadingManager();
    manager.onLoad = function () {
	console.log("loaded the trees resources");
	RESOURCES_LOADED = true;
	onResourcesLoaded();
    }
    var onProgress = function ( xhr ) {
	if ( xhr.lengthComputable ) {
	    var percentComplete = xhr.loaded / xhr.total * 100;
	    console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
    };
    var onError = function ( xhr ) {
    };

    // Load models;  asynchronous in JS, so wrap code in a fn and pass it the index
    for( var _key in models ){
	console.log('Key:', _key);
	(function(key){
	    var objLoader = new THREE.OBJLoader( manager );
	    objLoader.load( models[key].obj, function ( object ) {
		object.traverse( function ( child ) {
		    if ( child instanceof THREE.Mesh ) {
			child.material = models[key].mtl;
			child.material.shading = THREE.SmoothShading;
		    }	} );
		models[key].mesh = object;
	    }, onProgress, onError );
	})(_key);
    }
}

/////////////////////////////////////////////////////////////////////////////////////
// onResourcesLoaded():  once all OBJ files are loaded, this gets called.
//                       Object instancing is done here
/////////////////////////////////////////////////////////////////////////////////////

function onResourcesLoaded(){
	
 // Clone models into meshes;   [Michiel:  AFAIK this makes a "shallow" copy of the model,
 //                             i.e., creates references to the geometry, and not full copies ]
    meshes["tree1"] = models.tree1.mesh.clone();
    meshes["tree2"] = models.tree2.mesh.clone();
    meshes["tree3"] = models.tree3.mesh.clone();

    
    // position the object instances and parent them to the scene, i.e., WCS
    // For static objects in your scene, it is ok to use the default postion / rotation / scale
    // to build the object-to-world transformation matrix. This is what we do below.
    //
    // Three.js builds the transformation matrix according to:  M = T*R*S,
    // where T = translation, according to position.set()
    //       R = rotation, according to rotation.set(), and which implements the following "Euler angle" rotations:
    //            R = Rx * Ry * Rz
    //       S = scale, according to scale.set()
    
      // note:  the local transformations described by the following position, rotation, and scale
      // are overwritten by the animation loop for this particular object, which directly builds the
      // tree1-to-world transformation matrix
    meshes["tree1"].position.set(-5, 0.2, 4);
    meshes["tree1"].rotation.set(0, Math.PI, 0);
    meshes["tree1"].scale.set(1,0.3,0.3);
    scene.add(meshes["tree1"]);

    meshes["tree2"].position.set(-5, 0.2, 4);
    meshes["tree2"].rotation.set(0, Math.PI, 0);
    meshes["tree2"].scale.set(1,0.3,0.3);
    scene.add(meshes["tree2"]);

    meshes["tree3"].position.set(-5, 0.2, 4);
    meshes["tree3"].rotation.set(0, Math.PI, 0);
    meshes["tree3"].scale.set(1,0.3,0.3);
    scene.add(meshes["tree3"]);


    meshesLoaded = true;
}


///////////////////////////////////////////////////////////////////////////////////////
// LISTEN TO KEYBOARD
///////////////////////////////////////////////////////////////////////////////////////

// movement
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    // up
    if (keyCode == "W".charCodeAt()) {          // W = up
        light.position.y += 0.11;
        // down
    } else if (keyCode == "S".charCodeAt()) {   // S = down
        light.position.y -= 0.11;
        // left
    } else if (keyCode == "A".charCodeAt()) {   // A = left
	light.position.x -= 0.1;
        // right
    } else if (keyCode == "D".charCodeAt()) {   // D = right
        light.position.x += 0.11;
    } else if (keyCode == " ".charCodeAt()) {   // space
	animation = !animation;
    } else if (keyCode == 'R'.charCodeAt()) { // Check if the pressed key is 'R' or 'r'
        // Toggle between the animation states
        seaHorseAnim = (seaHorseAnim == 1) ? 0 : 1;
        // Update the animation based on the seaHorseAnim variable
        updateSeaHorseAnimation();
    }else if (keyCode == 'J'.charCodeAt()) { // Check if the pressed key is 'R' or 'r'
        // Toggle between the animation states
        seaHorseJump = (seaHorseJump == true) ? false : true;
        console.log(seaHorseJump)
        // Update the animation based on the seaHorseAnim variable
        updateSeaHorseAnimation();
    }
};


///////////////////////////////////////////////////////////////////////////////////////
// UPDATE CALLBACK:    This is the main animation loop
///////////////////////////////////////////////////////////////////////////////////////

function update() {
    var dt=0.03;
    if (animation && meshesLoaded) {
	// advance the motion of all the animated objects
	treeMotion.timestep(dt);    // note: will also call treeSetMatrices(), provided as a callback fn during setup
   	seaHorseMotion.timestep(dt);     // note: will also call myseaHorseSetMatrices(), provided as a callback fn during setup
    }
    if (meshesLoaded) {
	sphere.position.set(light.position.x, light.position.y, light.position.z);
    renderer.render(scene, camera);
    }
    requestAnimationFrame(update);      // requests the next update call;  this creates a loop
}

init();
update();

