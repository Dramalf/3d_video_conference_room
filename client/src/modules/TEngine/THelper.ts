import {
  AxesHelper,
  GridHelper,
  Object3D,
  PointLightHelper,
  SpotLightHelper
} from 'three'

import { pointLight, spotLight } from './Tlights'

export const helperList: Object3D[] = []

const axesHelper: AxesHelper = new AxesHelper(500)
const gridHelper: GridHelper = new GridHelper(500, 20, 'rgb(200, 200, 200)', 'rgb(100, 100, 100)')


const pointLightHelper: PointLightHelper = new PointLightHelper(pointLight, pointLight.distance, pointLight.color)

const spotLightHelper: SpotLightHelper = new SpotLightHelper(spotLight, spotLight.color)

 helperList.push(axesHelper,pointLightHelper,spotLightHelper)