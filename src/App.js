import React, {useRef, useState} from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import './App.css';
import {drawHand} from "./utilities";
import * as fp from "fingerpose";

import {raisedHand} from "./gestures/raisedHand";
import {fingerSplayed} from "./gestures/fingerSplayed";
import {fist} from "./gestures/fist";
import {okGesture} from "./gestures/okGesture";
import {victory} from "./gestures/victory";

function App() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const [emoji, setEmoji] = useState(null);
    const [confidence, setConfidence] = useState(null);
    const quotes = {thumbs_up:'👍', victory:'✌',raised_hand:'✋', finger_splayed:'🖐', fist:'✊', ok:'👌'};

    const runHandpose = async () =>{
        const net = await handpose.load()
        console.log('Handpose loaded')
        setInterval(() =>{
            detect(net)
        }, 100)
    }

    const detect = async (net) =>{
        if (typeof webcamRef.current !=="undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
        ) {
            const video = webcamRef.current.video;
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;

            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            const hand = await  net.estimateHands(video);
            console.log(hand);


            if (hand.length > 0) {
                //gesty które będziemy rozpoznawać
                const GE = new fp.GestureEstimator([
                    fp.Gestures.ThumbsUpGesture,
                    victory,
                    raisedHand,
                    fingerSplayed,
                    fist,
                    okGesture
                ]);

                const gesture = await GE.estimate(hand[0].landmarks, 7);
                console.log(gesture);
                if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
                    //jeśli jest więcej niż jeden prawdopodobny gest to wybieramy najbardziej prawdopodobny
                    const confidence = gesture.gestures.map(
                        (prediction) => prediction.confidence
                    );
                    console.log(confidence)
                    const maxConfidence = confidence.indexOf(
                        Math.max.apply(null, confidence)
                    );
                    //najbardziej prawdopodobny gest
                    setEmoji(gesture.gestures[maxConfidence].name);
                    setConfidence(gesture.gestures[maxConfidence].confidence.toFixed(2))
                    console.log(emoji);
                }
            }

            const ctx = canvasRef.current.getContext("2d");
            drawHand(hand, ctx);
        }
    };

    runHandpose()

    return (
        <div className="App">
            <header className="App-header">
                <Webcam
                    ref={webcamRef}
                    style={{
                        position: "absolute",
                        marginLeft: "auto",
                        marginRight: "auto",
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        zindex: 9,
                        width: 640,
                        height: 480,
                    }}
                />

                <canvas
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        marginLeft: "auto",
                        marginRight: "auto",
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        zindex: 9,
                        width: 640,
                        height: 480,
                    }}
                />
                {emoji !== null ? (
                    <p style={{
                        position: "absolute",
                        marginLeft: "auto",
                        marginRight: "auto",
                        left: 0,
                        bottom: 800,
                        right: 0,
                        textAlign: "center",
                        height: 100,
                    }}>
                        {quotes[emoji]} {confidence}
                    </p>
                ) : (
                    ""
                )}
            </header>
        </div>
    );
}

export default App;
