import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { GestureRecognition } from './gesture';

export class HandAPI {
    private handDetector!: handPoseDetection.HandDetector;
    private detectVideo!: HTMLVideoElement;
    private gestureRecognition=new GestureRecognition()
    async createDetector() {
        console.log(this.gestureRecognition)
        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig: handPoseDetection.MediaPipeHandsMediaPipeModelConfig | handPoseDetection.MediaPipeHandsTfjsModelConfig | undefined = {
            runtime: 'tfjs', // or 'tfjs'
            modelType: 'full'
        };
        const detector = await handPoseDetection.createDetector(model, detectorConfig);
        this.handDetector = detector;
        console.log(detector)
        return this
    }
    bindVideo(targetVideo: HTMLVideoElement) {
        this.detectVideo = targetVideo
        return this
    }
    detect() {
        this.gestureRecognition.normalize(this.gestureRecognition.gestures.openPlam)
        setInterval(async () => {
            let hands = await this.handDetector.estimateHands(this.detectVideo);
           // console.log(hands)
           hands.map(hand=>{
            let norhand=this.gestureRecognition.normalize(hand)
            
            let norgesture=this.gestureRecognition.normalize(this.gestureRecognition.gestures.openPlam)
            console.log(norhand,norgesture)
            this.gestureRecognition.calcCorrelation(norhand,norgesture)
           })
        }, 1000)

    }
}