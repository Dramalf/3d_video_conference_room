import {
  AmbientLight,
  AxesHelper,
  BoxBufferGeometry,
  GridHelper,
  RGBAFormat,
  TextureLoader,
  ObjectLoader,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector2,
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
  PlaneGeometry,
  CineonToneMapping,
  LinearToneMapping,
  QuadraticBezierCurve3
} from "three"
import * as TWEEN from '@tweenjs/tween.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { ambientLight } from './Tlights'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export class TEngine {

  private dom: HTMLElement
  public renderer: WebGLRenderer
  private mixer: AnimationMixer | undefined
  private pmremGenerator: PMREMGenerator
  private scene: Scene
  private raycaster:Raycaster
  private camera: PerspectiveCamera
  private ambientLight: AmbientLight
  private clock: Clock
  private centralpoint=new Vector2(0,0)
  private controls: FirstPersonControls | OrbitControls
  private seatsPosition = [{
   x: 0,
    y: 29,
    z: 20
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
       x: -38,
    y: 29,
    z: 0
  }

  ]

  private userVideoBoxes: Array<{ object: any, videoName: any }> = []
  private model!: Group
  private heart!: Group
  private VRviewBody: Object3D
  private newEnterIndex = 0
  stats: Stats
  constructor(dom: HTMLElement, enableVR = false, browserType: string) {
    this.dom = dom
    this.renderer = new WebGLRenderer({
      antialias: true
    })
    this.renderer.xr.enabled = true;
    this.clock = new Clock()
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = LinearToneMapping
    this.ambientLight = ambientLight;
    this.scene = new Scene()
    this.scene.add(this.ambientLight);
    const pmremGenerator = new PMREMGenerator(this.renderer); // 使用hdr作为背景色
    pmremGenerator.compileEquirectangularShader();
    this.pmremGenerator = pmremGenerator;
    const scene = this.scene;
    const body = new Object3D();

    body.position.set(0, 28, 0);
    this.VRviewBody = body;
    new RGBELoader()
      .setDataType(UnsignedByteType)
      .load('/texture/autumn_forest_04_1k.hdr', function (texture) {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        // envMap.isPmremTexture = true;
        pmremGenerator.dispose();
        console.log('here');
        scene.environment = envMap; // 给场景添加环境光效果
        scene.background = envMap; // 给场景添加背景图
      }, () => { }, (e) => { console.log('error in load env_texture', e); });

    this.camera = new PerspectiveCamera(60, dom.offsetWidth / dom.offsetHeight, 1, 1000)

    

    this.renderer.setSize(dom.offsetWidth, dom.offsetHeight, true)

    // 初始性能监视器
    const stats = Stats()
    const statsDom = stats.domElement
    this.stats = stats;
    statsDom.style.position = 'fixed'
    statsDom.style.top = '0'
    statsDom.style.right = '5px'
    statsDom.style.left = 'unset'



    let controls;
    let useorbit = browserType === 'oculus' || browserType === 'android' || browserType === 'ios'

    if (useorbit) {
      controls = new OrbitControls(this.camera, this.dom);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.target = new Vector3(0, 28, 0)
      controls.maxPolarAngle = Math.PI / 2 + 0.001;
      controls.minPolarAngle = Math.PI / 2;
      controls.update()
    } else {
      controls = new FirstPersonControls(this.camera, this.dom);
      controls.lookSpeed = 0.2; //鼠标移动查看的速度
      controls.movementSpeed = 20; //相机移动速度
      // controls.noFly = true;
      controls.constrainVertical = true; //约束垂直
      controls.verticalMin = Math.PI / 2;

      controls.verticalMax = Math.PI / 2 + 0.0000001;
    }

    this.controls = controls

    this.controls.object.position.set(0, 28, 20)
    this.controls.object.lookAt(new Vector3(0, 0, 0))

    this.camera.up = new Vector3(0, 1, 0)
    //@ts-ignore
    useorbit && this.controls.update();
    const raycaster = new Raycaster();
    this.raycaster=raycaster;
    const onWindowResize = () => {

      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(dom.offsetWidth, dom.offsetHeight, true);

    }
    window.addEventListener('resize', onWindowResize);

    //     const renderFun = () => {
    // //@ts-ignore
    //       this.controls.update(this.clock.getDelta())
    //       this.renderer.render(this.scene, this.camera)
    //       stats.update()
    //       TWEEN.update();
    //      updateUserVideoRotation()
    //       requestAnimationFrame(renderFun)
    //     }
    //this.renderid=requestAnimationFrame(this.renderFun);

    this.renderer.setAnimationLoop(() => {
      !useorbit && this.controls.update(this.clock.getDelta())
      useorbit && (this.controls as OrbitControls).update()
      this.renderer.render(this.scene, this.camera)
      stats.update()
      TWEEN.update();
      this.updateUserVideoRotation()
    })



    dom.appendChild(this.renderer.domElement)
    dom.appendChild(statsDom)
    dom.appendChild(VRButton.createButton(this.renderer))
  }

  loadRoom(cb = () => { }) {
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
      cb();
    }, () => { }, (e) => { console.log("error", e) })

  }
  switchVRview(vr:boolean){
    if(vr){
      this.VRviewBody.add(this.camera)
    }else{
      this.VRviewBody.remove(this.camera)
    }
    
  }
  getCentralUser(){
   
    this.raycaster.setFromCamera(this.centralpoint,this.camera);
    const intersects = this.raycaster.intersectObjects( this.scene.children );
    let targetName;
    for ( let i = 0; i < intersects.length; i ++ ) {
      targetName=intersects[i].object.name
    }
    return targetName
  

  }
  load_sprite() {
    const loader = new ObjectLoader()
    console.log('120')
    loader.load('/models/sprite/sprite.json', (obj) => {
      this.scene.add(obj)
      obj.position.set(-29, 30, -20)
      obj.scale.set(10, 10, 10)
      console.log(obj, 120)
      // this.mixer= new AnimationMixer(gltf.scene)
      // var action=this.mixer.clipAction(gltf.animations[0])
      // // action.timeScale=0.8
      // action.time=4

    }, () => { }, (e) => { console.log("error", e) })

  }
  addObject(...object: Object3D[]) {
    object.forEach(elem => {
      this.scene.add(elem)
    })
  }
  updateUserVideoRotation() {

    this.userVideoBoxes.map((vb, index) => {
      if (!vb) return
      const { object } = vb
      const cameraPosition = this.camera.position.clone()

      const videoPostion = object.position.clone()
      //const rotY=-Math.atan(lookAtPosition.x/lookAtPosition.z)-Math.PI/2
      const rotY = Math.atan((videoPostion.x - cameraPosition.x) / (videoPostion.z - cameraPosition.z))

      object.rotation.y = rotY

    })
  }

  changeScene(url: string) {
    new RGBELoader()
      .setDataType(UnsignedByteType)
      .load(`/texture/${url}.hdr`, (texture) => {
        const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
        // envMap.isPmremTexture = true;
        this.pmremGenerator.dispose();
        this.scene.environment = envMap; // 给场景添加环境光效果
        this.scene.background = envMap; // 给场景添加背景图
      }, () => { }, (e) => { console.log('123,', e); });

  }
  addUserVideo(userVideo: HTMLVideoElement, userName: string) {
    var geometry = new PlaneGeometry(48, 36, 96, 72);
    const texture = new VideoTexture(userVideo);
    texture.format = RGBAFormat;
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: DoubleSide
    })
    material.needsUpdate = true
    const box = new Mesh(geometry, material)
    box.name=userName
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
  removeUserVideo(userName: string) {
    this.userVideoBoxes = this.userVideoBoxes.filter(b => {
      if (b.videoName === userName) {
        console.log('997', b);
        b.object.material.dispose();
        b.object.geometry.dispose();
        this.scene.remove(b.object);

      }
      return b.videoName !== userName
    })
  }
  adjustBrightness(type: string) {
    if (type === 'brighter') {
      console.log('亮一点')
      this.renderer.toneMappingExposure += 0.1
    } else {
      console.log('暗一点')
      this.renderer.toneMappingExposure -= 0.1
    }
  }

  startLove(from:string,to:string) {
    const heart = this.heart.clone();
    this.scene.add(heart)
   
    let position = this.userVideoBoxes.find(b=>b.videoName===from)?.object.position.clone()

   let target = this.userVideoBoxes.find(b=>b.videoName===to)?.object.position.clone()
   if(from==="&&SELF"){
    position=this.camera.position.clone()
   } 
   if(!position||!target)return
   position.y=24;
   target.y=24;
   const mid = new Vector3(position.x/2-target.x/2-2, 32, position.z/2-target.z/2-6);
    //   x: -38,
    // y: 29,
    // z: 0
    const curve = new QuadraticBezierCurve3(
      position,
      mid,
      target
    )
    const points = curve.getPoints(50);
    let scene=this.scene;
    function animate(points: Vector3[]) {
      let i = 0;
      let tween1;
      let tweens = points.map((point, index, arr) => {
        if (index < points.length - 2) {
          let t = new TWEEN.Tween(point).to(arr[index + 1], 10);
          t.onUpdate((p) => {
            heart.position.set(p.x, p.y, p.z);
          })
          return t
        }else if(index===points.length-2){
          let t= new TWEEN.Tween(point).to(arr[index + 1], 10);
          t.onUpdate(()=>{
            scene.remove(heart)
          })
          return t
        }

      });

      tweens.pop()
      for (let i = 0; i < points.length - 1; i++) {
        if (tweens[i + 1] && tweens[i])
          //@ts-ignore
          tweens[i].chain(tweens[i + 1] as TWEEN.Tween<Vector3>)
      }
      //@ts-ignore
      return tweens[0]
    }
    let t = animate(points);

    t?.start()
  }
  loadLove() {
    const loader: GLTFLoader = new GLTFLoader()

    loader.load('/models/heart_in_love/scene.gltf', (gltf) => {

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
      this.heart = gltf.scene
      // this.scene.add(gltf.scene)
      // gltf.scene.position.set(30, 30, 30)
      gltf.scene.scale.set(0.01, 0.01, 0.01)
    }, () => { }, (e) => { console.log("error", e) })
  }

  disableControls() {
    this.controls.enabled = false
  }
  enableControls() {
    this.controls.enabled = true
  }
}
