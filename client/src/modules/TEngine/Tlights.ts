import {
  AmbientLight,
  Object3D,
  PointLight,
  SpotLight
} from 'three'

export const LightsList: Object3D[] = []

export const ambientLight: AmbientLight = new AmbientLight('rgb(64,64,64)',0.2)

export const pointLight: PointLight = new PointLight(
  'rgb(240, 225, 240)',
  1
)

pointLight.position.set(0, 20, 0)

export const spotLight: SpotLight = new SpotLight(
  'rgb(255, 255, 255)',
  1,
  200,
  Math.PI ,
  0,
  0
)

spotLight.castShadow = true

spotLight.position.set(0, 200, 0)



LightsList.push(spotLight,pointLight)