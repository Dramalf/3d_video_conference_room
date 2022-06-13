import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { GestureRecognition } from './gesture';

export class HandAPI {
    private handDetector!: handPoseDetection.HandDetector;
    private detectVideo!: HTMLVideoElement;
    private gestureRecognition = new GestureRecognition()
    public enable=false;
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
    onDetect(cb=()=>{}) {
         setInterval(async () => {
             if(!this.enable){
                return 
             }
            let hands = await this.handDetector.estimateHands(this.detectVideo);
            if (hands[0]) {
                // console.log('3d996',hands[0].keypoints3D![4],hands[0].keypoints3D![8])

                let thumb_tip = hands[0].keypoints3D![3];
                let index_finger_tip = hands[0].keypoints3D![7];
                let d = Math.sqrt(Math.pow((thumb_tip.x - index_finger_tip.x), 2) + Math.pow((thumb_tip.y - index_finger_tip.y), 2))
                console.log(d)
                if (d < 0.05) {
                    console.log('比心')
                    cb()
                }
            }

            //    hands.map(hand=>{
            //     let norhand=this.gestureRecognition.normalize(hand)

            //     let norgesture=this.gestureRecognition.normalize(this.gestureRecognition.gestures.openPlam)
            //     console.log(norhand,norgesture)
            //     this.gestureRecognition.calcCorrelation(norhand,norgesture)
            //    })
        }, 30)
    }
}