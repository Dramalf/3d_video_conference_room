import {
  Mesh,
  BoxBufferGeometry,
  MeshStandardMaterial,
  SphereBufferGeometry,
  CylinderBufferGeometry,
  Object3D,
  Line,
  Points,
  PointsMaterial,
  Material,
  PlaneBufferGeometry,
  DoubleSide,
  CircleBufferGeometry
} from 'three'
import { stageTexture,wallTexture } from './TTextures'

export const basicObjectList: Object3D[] = []

// 地面
const stage: Mesh = new Mesh(
  new BoxBufferGeometry(200, 10, 200),
  new MeshStandardMaterial({
    map:stageTexture
  })
)

stage.castShadow = true
stage.receiveShadow = true

stage.position.y = -5

// 立方体
const box: Mesh = new Mesh(
  new BoxBufferGeometry(2, 10, 2),
  new MeshStandardMaterial({
    color: '#b57355',
    metalness:0.5,
    roughness: 0.3
  })
)

box.castShadow = true
box.receiveShadow = true

box.position.set(-10,5,-10)


//墙壁
const leftWall:Mesh=new Mesh(
  new PlaneBufferGeometry(100, 40),
  new MeshStandardMaterial({
    map:wallTexture,
    side:DoubleSide
  })
)
leftWall.position.set(0,20,-50)

const rightWall:Mesh=new Mesh(
  new PlaneBufferGeometry(100, 40),
  new MeshStandardMaterial({
   map:wallTexture,
   side:DoubleSide
  })
)
rightWall.rotateY(Math.PI/2)
rightWall.position.set(-50,20,0)

const southWall:Mesh=new Mesh(
  new PlaneBufferGeometry(100, 40),
  new MeshStandardMaterial({
   map:wallTexture,
   side:DoubleSide
  })
)
southWall.rotateY(Math.PI/2)
southWall.position.set(50,20,0)

const eastWall:Mesh=new Mesh(
  new PlaneBufferGeometry(100, 40),
  new MeshStandardMaterial({
   map:wallTexture,
   side:DoubleSide
  })
)

eastWall.position.set(0,20,50)


basicObjectList.push(stage)