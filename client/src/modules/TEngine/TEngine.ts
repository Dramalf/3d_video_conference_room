import {
  AmbientLight,
  AxesHelper,
  BoxBufferGeometry,
  GridHelper,
  TextureLoader,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  MOUSE,
  Object3D,
  Group,
  Clock,
  Raycaster,
  TetrahedronBufferGeometry,
  VideoTexture,
  PMREMGenerator,
  UnsignedByteType,
  HemisphereLight,
  CanvasTexture,
  AnimationMixer,
  MeshBasicMaterial,
  PlaneGeometry
} from "three"
import * as TWEEN from '@tweenjs/tween.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { FaceMeshFaceGeometry } from "./js/face.js";


export class TEngine {

  private dom: HTMLElement
  private renderer: WebGLRenderer
  private mixer: AnimationMixer | undefined
  private scene: Scene
  private camera: PerspectiveCamera
  private clock: Clock
  private controls: FirstPersonControls
  private seatsPosition = [{
    x: -38,
    y: 29,
    z: 0
  }, {
    x: -20,
    y: 29,
    z: -20
  }, {
    x: 0,
    y: 29,
    z: -20
  }, {
    x: 26,
    y: 29,
    z: -20
  }, {
    x: 38,
    y: 29,
    z: 0
  }, {
    x: 26,
    y: 29,
    z: 20
  }, {
    x: 0,
    y: 29,
    z: 20
  }, {
    x: -20,
    y: 29,
    z: 20
  },

  ]

  private userVideoBoxes: Array<{ object: any, videoName: any }> = []
  private model!: Group
  private newEnterIndex = 0
  constructor(dom: HTMLElement) {
    this.dom = dom
    this.renderer = new WebGLRenderer({
      antialias: true
    })
    this.clock = new Clock()
    this.renderer.shadowMap.enabled = true

    this.scene = new Scene()
    // import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
    const pmremGenerator = new PMREMGenerator(this.renderer); // 使用hdr作为背景色
    pmremGenerator.compileEquirectangularShader();

    const scene = this.scene;
    new RGBELoader()
      .setDataType(UnsignedByteType)
      .load('/texture/015.hdr', function (texture) {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        // envMap.isPmremTexture = true;
        pmremGenerator.dispose();
        console.log('here');
        scene.environment = envMap; // 给场景添加环境光效果
        scene.background = envMap; // 给场景添加背景图
      }, () => { }, (e) => { console.log('123,', e); });


    this.camera = new PerspectiveCamera(55, dom.offsetWidth / dom.offsetHeight, 1, 1000)

    this.camera.position.set(-38, 28, 0)
    this.camera.lookAt(new Vector3(14, 28, 0))
    //this.camera.up = new Vector3(0, 1, 0)


    this.renderer.setSize(dom.offsetWidth, dom.offsetHeight, true)

    // 初始性能监视器
    const stats = Stats()
    const statsDom = stats.domElement
    statsDom.style.position = 'fixed'
    statsDom.style.top = '0'
    statsDom.style.right = '5px'
    statsDom.style.left = 'unset'



    const controls = new FirstPersonControls(this.camera);
    controls.lookSpeed = 0.2; //鼠标移动查看的速度
    controls.movementSpeed = 20; //相机移动速度
    // controls.noFly = true;
    controls.constrainVertical = true; //约束垂直
    controls.verticalMin = Math.PI / 2;

    controls.verticalMax = Math.PI / 2 + 0.0000001;
    this.controls = controls

    const updateRotation = () => {

      this.userVideoBoxes.map((vb, index) => {
        if (!vb) return
        const { object } = vb
        const cameraPosition = this.camera.position.clone()
        const lookAtPosition = new Vector3()
        this.camera.getWorldDirection(lookAtPosition)
        const videoPostion = object.position.clone()
        //const rotY=-Math.atan(lookAtPosition.x/lookAtPosition.z)-Math.PI/2
        const rotY = Math.atan((videoPostion.x - cameraPosition.x) / (videoPostion.z - cameraPosition.z))

        object.rotation.y = rotY

      })
    }

    const renderFun = () => {

      this.controls.update(this.clock.getDelta())
      var target = new Vector3()
      this.camera.getWorldDirection(target)
      //console.log(Math.atan2(target.x,target.z))
      this.renderer.render(this.scene, this.camera)
      stats.update()
      updateRotation()
      // var delta = this.clock.getDelta();
      //  if (this.mixer != null) {
      //     this. mixer.update(delta);
      // };
      //this.mixer&&(this.mixer as AnimationMixer).update(this.clock.getDelta());
      requestAnimationFrame(renderFun)
    }

    renderFun()

    dom.appendChild(this.renderer.domElement)
    dom.appendChild(statsDom)
  }
  loadRoom() {
    //载入模型
    const loader: GLTFLoader = new GLTFLoader()

    loader.load('/models/table/scene.gltf', (gltf) => {

      // this.mixer= new AnimationMixer(gltf.scene)
      // var action=this.mixer.clipAction(gltf.animations[0])
      // // action.timeScale=0.8
      // action.time=4
      gltf.scene.traverse((object) => {
        if ((object as Mesh).isMesh) {
          // 修改模型的材质
          object.castShadow = true;
          object.frustumCulled = false;
          // object.receiveShadow = true;

          (object as any).material.emissive = (object as any).material.color;
          (object as any).material.emissiveMap = (object as any).material.map;
        }
      })
      gltf.scene.receiveShadow = true
      this.model = gltf.scene
      this.scene.add(gltf.scene)
      gltf.scene.position.set(0, 0, 0)
      gltf.scene.scale.set(0.3, 0.3, 0.3)
    }, () => { }, (e) => { console.log("error", e) })

  }


  loadHumanModel(faceCanvas: HTMLCanvasElement) {
    //载入模型
    const loader: GLTFLoader = new GLTFLoader()

    loader.load('/models/face.gltf', (gltf) => {

      gltf.scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          // 修改模型的材质
          object.castShadow = true
          object.receiveShadow = true
        }
      })
      gltf.scene.receiveShadow = true
      this.model = gltf.scene
      this.scene.add(gltf.scene);
      const texture = new CanvasTexture(faceCanvas);
      const material = new MeshBasicMaterial({
        map: texture,
        side: DoubleSide
      });
      (gltf.scene.children[0] as Mesh).material = material;
      new MeshBasicMaterial({
        color: 0xe3e4e5,
        // 前面FrontSide  背面：BackSide 双面：DoubleSide
        side: DoubleSide,
      });
      gltf.scene.position.set(10, 30, 10);
      gltf.scene.scale.set(5, 5, 5)
      gltf.scene.rotateZ(Math.PI / 2);
      gltf.scene.rotateX(Math.PI)

    }, () => { }, (e) => { console.log("error", e) })

  }
  addObject(...object: Object3D[]) {
    object.forEach(elem => {
      this.scene.add(elem)
    })
  }
  updateUserTexture(userVideo: HTMLCanvasElement, userName: string) {
    const texture = new CanvasTexture(userVideo);
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: DoubleSide
    })
    this.userVideoBoxes.some(box => {
      if (box.videoName === userName) {
        box.object.material = material
        return true
      }
    })
  }
  addUserVideo(userVideo: HTMLCanvasElement, userName: string) {
    var geometry = new PlaneGeometry(48, 36, 96, 72);
    const texture = new CanvasTexture(userVideo);
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: DoubleSide
    })
    material.needsUpdate=true
    const box = new Mesh(geometry, material)

    const { x, y, z } = this.seatsPosition[this.newEnterIndex]
    this.newEnterIndex++;
    box.position.set(x, y, z)
    box.scale.set(0.4, 0.4, 0.4)
    //box.rotateY(-Math.PI/3)

    //let cameraPosition=this.camera.position.clone()
    this.userVideoBoxes.push({
      object: box,
      videoName: userName
    })
    this.scene.add(box);
  }
  drawFace() {
    // const texture = new CanvasTexture(faceCanvas);
    // const material = new MeshBasicMaterial({
    //   map: texture,
    //   side: DoubleSide
    // })
    const loader = new TextureLoader();
    let modelRef;
    let referenceFace;
    // Create material for mask.
    
    const material = new MeshStandardMaterial({
      color: 0xb3b4cc,
      roughness: 0.8,
      metalness: 0,
    //  map: null, // Set later by the face detector.
      transparent: true,
      side: DoubleSide,
      opacity: 1,
    });

    // Create a new geometry helper.
    const faceGeometry = new FaceMeshFaceGeometry();

    // Create mask mesh.
    // @ts-ignore
    const mask = new Mesh(faceGeometry, material);
    mask.position.set(0,0,30)
    mask.scale.set(100,100,100)
    mask.receiveShadow = mask.castShadow = true;
    console.log('face',mask)
    this.scene.add(mask);
    
       // @ts-ignore
    console.log(window.facemesh)
  }
  disableControls() {
    this.controls.enabled = false
  }
  enableControls() {
    this.controls.enabled = true
  }
}
function dumpObject(obj: Object3D, lines: Array<String> = [], isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}