import { Texture, TextureLoader,RepeatWrapping } from "three";

const textureLoader: TextureLoader = new TextureLoader()

export const stageTexture: Texture = textureLoader.load('./texture/wood.jpeg')
stageTexture.wrapS = RepeatWrapping;
stageTexture.wrapT = RepeatWrapping;
stageTexture.repeat.set( 10, 4 );

export const wallTexture: Texture = textureLoader.load('./texture/wall2.jpg')
wallTexture.wrapS = RepeatWrapping;
wallTexture.wrapT = RepeatWrapping;
wallTexture.repeat.set( 10, 4 );