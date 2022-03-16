import {
  AmbientLight,
  Object3D,
  PointLight,
  SpotLight
} from 'three'

export const LightsList: Object3D[] = []

const ambientLight: AmbientLight = new AmbientLight(0x404040,0.9)

export const pointLight: PointLight = new PointLight(
  'rgb(240, 225, 240)',
  0.7
)

pointLight.position.set(0, 20, 0)

export const spotLight: SpotLight = new SpotLight(
  'rgb(255, 255, 255)',
  0.7,
  200,
  Math.PI / 180 * 30,
  0,
  0
)

spotLight.castShadow = true

spotLight.position.set(0, 200, 0)



LightsList.push(ambientLight)