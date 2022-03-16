import * as faceapi from 'face-api.js';
import { Context } from 'react';
interface FFeature {
  faceBottom: number;
  faceLeft: number;
  faceRight: number;
  faceTop: number;
  faceWidth: number;
  jaw: faceapi.Point[];
  eyebrowLeft: faceapi.Point[];
  eyebrowRight: faceapi.Point[];
  noseBridge: faceapi.Point[];
  nose: faceapi.Point[];
  eyeLeft: faceapi.Point[];
  eyeRight: faceapi.Point[];
  lipOuter: faceapi.Point[];
  lipInner: faceapi.Point[];
}
export class FaceAPI {
  private videoView: HTMLVideoElement;
  private canvasView: HTMLCanvasElement;
  private faceFeature!: FFeature;
  constructor(inputVideo: HTMLVideoElement, inputCanvas: HTMLCanvasElement) {
    this.videoView = inputVideo;
    this.canvasView = inputCanvas;

  }
  async loaded() {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("./fd_models"),
      faceapi.nets.faceLandmark68Net.loadFromUri('./fd_models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('./fd_models'),
      faceapi.nets.faceExpressionNet.loadFromUri('./fd_models')
    ])
    const ctx: CanvasRenderingContext2D = this.canvasView.getContext('2d') as  CanvasRenderingContext2D;
    const {width:cWidth,height:cHeight}=this.canvasView;
    const firstDetect = async () => {

      const detections = await faceapi.detectAllFaces(
        this.videoView,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceExpressions()
      for (const face of detections) {
        const features = {
          faceBottom: face.alignedRect.box.bottom,
          faceLeft: face.alignedRect.box.left,
          faceRight: face.alignedRect.box.right,
          faceTop: face.alignedRect.box.top,
          faceWidth: face.alignedRect.box.width,
          jaw: face.landmarks.positions.slice(0, 17),
          eyebrowLeft: face.landmarks.positions.slice(17, 22),
          eyebrowRight: face.landmarks.positions.slice(22, 27),
          noseBridge: face.landmarks.positions.slice(27, 31),
          nose: face.landmarks.positions.slice(31, 36),
          eyeLeft: face.landmarks.positions.slice(36, 42),
          eyeRight: face.landmarks.positions.slice(42, 48),
          lipOuter: face.landmarks.positions.slice(48, 60),
          lipInner: face.landmarks.positions.slice(60),
        };
        ctx.clearRect(0, 0, cWidth, cHeight)
        //ctx.drawImage(this.videoView, 0, 0, cWidth, cHeight)  //绘制视频
        const jawPosition=features.jaw;
        const jawLeft:{x:number,y:number}=jawPosition[0]
        const jawRight:{x:number,y:number}=jawPosition[16]
        const dy=(jawLeft.x-jawRight.x)/2
        const dx=(jawRight.y-jawLeft.y)/2
        ctx.beginPath()


        ctx.moveTo(jawRight.x+dx,jawRight.y+dy);
        ctx.lineTo(jawLeft.x+dx,jawLeft.y+dy)
        jawPosition.forEach((point)=>{
          const {x,y}=point
          ctx.lineTo(x,y)
        })
        ctx.lineTo(jawRight.x+dx,jawRight.y+dy)

        ctx.closePath()
        ctx.clip()
        ctx.drawImage(this.videoView,0,0)
        this.faceFeature = features;

      }
    }
    const detect = async () => {

      const detections = await faceapi.detectAllFaces(
        this.videoView,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceExpressions()
      for (const face of detections) {
        const features = {
          faceBottom: face.alignedRect.box.bottom,
          faceLeft: face.alignedRect.box.left,
          faceRight: face.alignedRect.box.right,
          faceTop: face.alignedRect.box.top,
          faceWidth: face.alignedRect.box.width,
          jaw: face.landmarks.positions.slice(0, 17),
          eyebrowLeft: face.landmarks.positions.slice(17, 22),
          eyebrowRight: face.landmarks.positions.slice(22, 27),
          noseBridge: face.landmarks.positions.slice(27, 31),
          nose: face.landmarks.positions.slice(31, 36),
          eyeLeft: face.landmarks.positions.slice(36, 42),
          eyeRight: face.landmarks.positions.slice(42, 48),
          lipOuter: face.landmarks.positions.slice(48, 60),
          lipInner: face.landmarks.positions.slice(60),
        };
        this.faceFeature = features;

      }
      window.requestAnimationFrame(detect)
    }

    await firstDetect()
    detect()
    return this
  }
  getFeatures() {
    return this.canvasView
  }

}