

export class GestureRecognition {
    public gestures = {
        openPlam: { "keypoints": [{ "x": 527.9091230562565, "y": 521.0406841419879, "name": "wrist" }, { "x": 456.2807815622871, "y": 503.0127886486822, "name": "thumb_cmc" }, { "x": 409.9258107905914, "y": 453.83136706486096, "name": "thumb_mcp" }, { "x": 399.9838723622642, "y": 397.80269690754363, "name": "thumb_ip" }, { "x": 404.2601322964012, "y": 352.733005759806, "name": "thumb_tip" }, { "x": 391.89745346202676, "y": 424.9564693061705, "name": "index_finger_mcp" }, { "x": 330.8528899353995, "y": 344.57204064346183, "name": "index_finger_pip" }, { "x": 292.0213106618285, "y": 286.5198725763419, "name": "index_finger_dip" }, { "x": 257.8089845653416, "y": 239.55721912145168, "name": "index_finger_tip" }, { "x": 449.7284131728093, "y": 416.88567083621336, "name": "middle_finger_mcp" }, { "x": 433.10611425385207, "y": 287.9674767660912, "name": "middle_finger_pip" }, { "x": 419.0225843013024, "y": 203.85083349289098, "name": "middle_finger_dip" }, { "x": 404.1351913134992, "y": 143.48506497753527, "name": "middle_finger_tip" }, { "x": 514.0518507153616, "y": 419.37081567152734, "name": "ring_finger_mcp" }, { "x": 537.2266617051833, "y": 294.9893689874851, "name": "ring_finger_pip" }, { "x": 538.0877401382181, "y": 210.49916531436995, "name": "ring_finger_dip" }, { "x": 537.3729875673654, "y": 148.6602971411435, "name": "ring_finger_tip" }, { "x": 568.5880405624539, "y": 430.1912609597638, "name": "pinky_finger_mcp" }, { "x": 595.80688016865, "y": 379.5906582307573, "name": "pinky_finger_pip" }, { "x": 606.4642624396802, "y": 380.4839605696293, "name": "pinky_finger_dip" }, { "x": 615.8822669063884, "y": 381.99105962903826, "name": "pinky_finger_tip" }], "keypoints3D": [{ "x": 0.024291463976102275, "y": 0.04706618694861017, "z": 0.0684986561536789, "name": "wrist" }, { "x": 0.0013181784842062321, "y": 0.02858571814555528, "z": 0.04906672239303589, "name": "thumb_cmc" }, { "x": -0.00792290007287188, "y": 0.014263559570490181, "z": 0.03756839036941528, "name": "thumb_mcp" }, { "x": -0.009724975250556002, "y": -0.001968791059482895, "z": 0.006983112543821335, "name": "thumb_ip" }, { "x": -0.009035289177010554, "y": -0.01704422039573432, "z": -0.007673956453800201, "name": "thumb_tip" }, { "x": -0.009226183238666983, "y": 0.006526046040007371, "z": -0.0012988932430744171, "name": "index_finger_mcp" }, { "x": -0.035690459548791506, "y": -0.010919095394759737, "z": -0.005468373186886311, "name": "index_finger_pip" }, { "x": -0.050869090878542855, "y": -0.028686547686333212, "z": -0.019602525979280472, "name": "index_finger_dip" }, { "x": -0.061546791711189125, "y": -0.0428273248678893, "z": -0.03161431849002838, "name": "index_finger_tip" }, { "x": -0.003312389026670696, "y": 0.004445856054086265, "z": 0.0008503459393978119, "name": "middle_finger_mcp" }, { "x": -0.01247337094911538, "y": -0.027892787967230867, "z": -0.009020786732435226, "name": "middle_finger_pip" }, { "x": -0.018162415088423537, "y": -0.05029917813544822, "z": -0.015433765947818756, "name": "middle_finger_dip" }, { "x": -0.032113432185902825, "y": -0.07820429470056996, "z": -0.004696410149335861, "name": "middle_finger_tip" }, { "x": 0.00983112498225417, "y": -0.007950719871017985, "z": -0.001078881323337555, "name": "ring_finger_mcp" }, { "x": 0.010367577791061313, "y": -0.029685706562936648, "z": 0.002013266086578369, "name": "ring_finger_pip" }, { "x": 0.013941904876090962, "y": -0.06440187171550504, "z": 0.001839280128479004, "name": "ring_finger_dip" }, { "x": 0.013301820163690255, "y": -0.08799677484684626, "z": -0.0029235854744911194, "name": "ring_finger_tip" }, { "x": 0.022169293997946912, "y": -0.0007543127232017416, "z": 0.009144721552729607, "name": "pinky_finger_mcp" }, { "x": 0.026750486362560964, "y": -0.005371706799819841, "z": 0.011953644454479218, "name": "pinky_finger_pip" }, { "x": 0.02917335594483131, "y": -0.008743876222298233, "z": 0.013476628810167313, "name": "pinky_finger_dip" }, { "x": 0.03338556358486299, "y": -0.0018176424280466272, "z": 0.0139746880158782, "name": "pinky_finger_tip" }], "handedness": "Left", "score": 0.9569462537765503 }
    }
    normalize(hand: any) {
        const { keypoints, keypoints3D } = hand;
        let xmean = 0, ymean = 0;
        keypoints.map((point: { x: number; y: number; }) => {
            xmean += point.x;
            ymean += point.y;

        });
        xmean = xmean / keypoints.length;
        ymean = ymean / keypoints.length;
       // console.log(`mean>>  (${xmean},${ymean})`);
        let variance = 0;
        keypoints.map((point: { x: number; y: number; }) => {
            variance += (Math.pow(point.x - xmean, 2) + Math.pow(point.y - ymean, 2))
        })
        variance = variance / keypoints.length
        //console.log('variance>>  ', variance);
        let meanVariance = Math.sqrt(variance)
        //console.log('MeanVariance>>  ', meanVariance);
        let result = keypoints.map((point: { x: number; y: number; }) => {
            return {
                x: (point.x - xmean) / meanVariance,
                y: (point.y - ymean) / meanVariance,
            }
        })
       return result;
    }
    calcCorrelation(handFeatures:any,gestureFeatures:any){
        let cov:any;
        let featuresLength=handFeatures.length
        let A=0,B=0,C=0,D=0,E=0
        for(let i=0;i<featuresLength;i++){
            A+=handFeatures[i].x*gestureFeatures[i].x+handFeatures[i].y*gestureFeatures[i].y ;
            C+=handFeatures[i].x*handFeatures[i].x+handFeatures[i].y*handFeatures[i].y;
            D+=gestureFeatures[i].x*gestureFeatures[i].x+gestureFeatures[i].y*gestureFeatures[i].y;
        }
        A=featuresLength*A;

        let hxmean = 0, hymean = 0;
        handFeatures.map((point: { x: number; y: number; }) => {
            hxmean += point.x;
            hymean += point.y;

        });
        // hxmean = hxmean / featuresLength;
        // hymean = hymean / featuresLength;
        let gxmean = 0, gymean = 0;
        gestureFeatures.map((point: { x: number; y: number; }) => {
            gxmean += point.x;
            gymean += point.y;

        });
        B=hxmean*gxmean+hymean*gymean;
        C=Math.sqrt(C-hxmean*hxmean-hymean*hymean)
        D=Math.sqrt(D-gxmean*gxmean-gymean*gymean)
        console.log((A-B)/(C*D))
        // gxmean = gxmean / featuresLength;
        // gymean = gymean / featuresLength;
        // for(let i=0;i<featuresLength;i++){
        //     cov=(handFeatures[i].x-hxmean)*(gestureFeatures[i].x-gxmean)+(handFeatures[i].y-hymean)*(gestureFeatures[i].y-gymean);
        // }
        // cov=cov/featuresLength
        // let deviationHand=0,deviationGesture=0;
        // for(let i=0;i<featuresLength;i++){
        //     deviationHand+=Math.pow(handFeatures[i].x-hxmean,2)+Math.pow(handFeatures[i].y-hymean,2);
        //     deviationGesture+=Math.pow(gestureFeatures[i].x-gxmean,2)+Math.pow(gestureFeatures[i].y-gymean,2);
        // }
        // deviationHand=Math.sqrt(deviationHand/featuresLength)
        // deviationGesture=Math.sqrt(deviationGesture/featuresLength)

        // console.log(cov/deviationHand/deviationGesture)
    }
}
// export const json = [{ "keypoints": [{ "x": 527.9091230562565, "y": 521.0406841419879, "name": "wrist" }, { "x": 456.2807815622871, "y": 503.0127886486822, "name": "thumb_cmc" }, { "x": 409.9258107905914, "y": 453.83136706486096, "name": "thumb_mcp" }, { "x": 399.9838723622642, "y": 397.80269690754363, "name": "thumb_ip" }, { "x": 404.2601322964012, "y": 352.733005759806, "name": "thumb_tip" }, { "x": 391.89745346202676, "y": 424.9564693061705, "name": "index_finger_mcp" }, { "x": 330.8528899353995, "y": 344.57204064346183, "name": "index_finger_pip" }, { "x": 292.0213106618285, "y": 286.5198725763419, "name": "index_finger_dip" }, { "x": 257.8089845653416, "y": 239.55721912145168, "name": "index_finger_tip" }, { "x": 449.7284131728093, "y": 416.88567083621336, "name": "middle_finger_mcp" }, { "x": 433.10611425385207, "y": 287.9674767660912, "name": "middle_finger_pip" }, { "x": 419.0225843013024, "y": 203.85083349289098, "name": "middle_finger_dip" }, { "x": 404.1351913134992, "y": 143.48506497753527, "name": "middle_finger_tip" }, { "x": 514.0518507153616, "y": 419.37081567152734, "name": "ring_finger_mcp" }, { "x": 537.2266617051833, "y": 294.9893689874851, "name": "ring_finger_pip" }, { "x": 538.0877401382181, "y": 210.49916531436995, "name": "ring_finger_dip" }, { "x": 537.3729875673654, "y": 148.6602971411435, "name": "ring_finger_tip" }, { "x": 568.5880405624539, "y": 430.1912609597638, "name": "pinky_finger_mcp" }, { "x": 595.80688016865, "y": 379.5906582307573, "name": "pinky_finger_pip" }, { "x": 606.4642624396802, "y": 380.4839605696293, "name": "pinky_finger_dip" }, { "x": 615.8822669063884, "y": 381.99105962903826, "name": "pinky_finger_tip" }], "keypoints3D": [{ "x": 0.024291463976102275, "y": 0.04706618694861017, "z": 0.0684986561536789, "name": "wrist" }, { "x": 0.0013181784842062321, "y": 0.02858571814555528, "z": 0.04906672239303589, "name": "thumb_cmc" }, { "x": -0.00792290007287188, "y": 0.014263559570490181, "z": 0.03756839036941528, "name": "thumb_mcp" }, { "x": -0.009724975250556002, "y": -0.001968791059482895, "z": 0.006983112543821335, "name": "thumb_ip" }, { "x": -0.009035289177010554, "y": -0.01704422039573432, "z": -0.007673956453800201, "name": "thumb_tip" }, { "x": -0.009226183238666983, "y": 0.006526046040007371, "z": -0.0012988932430744171, "name": "index_finger_mcp" }, { "x": -0.035690459548791506, "y": -0.010919095394759737, "z": -0.005468373186886311, "name": "index_finger_pip" }, { "x": -0.050869090878542855, "y": -0.028686547686333212, "z": -0.019602525979280472, "name": "index_finger_dip" }, { "x": -0.061546791711189125, "y": -0.0428273248678893, "z": -0.03161431849002838, "name": "index_finger_tip" }, { "x": -0.003312389026670696, "y": 0.004445856054086265, "z": 0.0008503459393978119, "name": "middle_finger_mcp" }, { "x": -0.01247337094911538, "y": -0.027892787967230867, "z": -0.009020786732435226, "name": "middle_finger_pip" }, { "x": -0.018162415088423537, "y": -0.05029917813544822, "z": -0.015433765947818756, "name": "middle_finger_dip" }, { "x": -0.032113432185902825, "y": -0.07820429470056996, "z": -0.004696410149335861, "name": "middle_finger_tip" }, { "x": 0.00983112498225417, "y": -0.007950719871017985, "z": -0.001078881323337555, "name": "ring_finger_mcp" }, { "x": 0.010367577791061313, "y": -0.029685706562936648, "z": 0.002013266086578369, "name": "ring_finger_pip" }, { "x": 0.013941904876090962, "y": -0.06440187171550504, "z": 0.001839280128479004, "name": "ring_finger_dip" }, { "x": 0.013301820163690255, "y": -0.08799677484684626, "z": -0.0029235854744911194, "name": "ring_finger_tip" }, { "x": 0.022169293997946912, "y": -0.0007543127232017416, "z": 0.009144721552729607, "name": "pinky_finger_mcp" }, { "x": 0.026750486362560964, "y": -0.005371706799819841, "z": 0.011953644454479218, "name": "pinky_finger_pip" }, { "x": 0.02917335594483131, "y": -0.008743876222298233, "z": 0.013476628810167313, "name": "pinky_finger_dip" }, { "x": 0.03338556358486299, "y": -0.0018176424280466272, "z": 0.0139746880158782, "name": "pinky_finger_tip" }], "handedness": "Left", "score": 0.9569462537765503 }]