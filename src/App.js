import React, {useRef, useState} from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import './App.css';
import {drawHand} from "./utilities";
import * as fp from "fingerpose";

function App() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const [emoji, setEmoji] = useState(null);
    const images = {thums_up:'👍', victory:'✌'};

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
                    fp.Gestures.VictoryGesture,
                    fp.Gestures.ThumbsUpGesture,
                ])

                const gesture = await GE.estimate(hand[0].landmarks, 8);
                console.log(gesture);
                if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
                    //jeśli jest więcej niż jeden prawdopodobny gest to wybieramy najbardziej prawdopodobny
                    const confidence = gesture.gestures.map(
                        (prediction) => prediction.confidence
                    );
                    const maxConfidence = confidence.indexOf(
                        Math.max.apply(null, confidence)
                    );
                    //najbardziej prawdopodobny gest
                    setEmoji(gesture.gestures[maxConfidence].name);
                    console.log(emoji);
                }
            }

            const ctx = canvasRef.current.getContext("2d");
            drawHand(hand, ctx);
        }
    }

    runHandpose()

  return (
    <div className="App">
      <header className="App-header">
        <Webcam ref={webcamRef}
          style={{
            position:"absolute",
            marginLeft:"auto",
            marginRight:"auto",
            left:"0",
            right:"0",
            textAlign:"center",
            zIndex:"9",
            width:"1280",
            height:"720"
        }}/>
        <canvas ref={canvasRef}
          style={{
            position:"absolute",
            marginLeft:"auto",
            marginRight:"auto",
            left:"0",
            right:"0",
            textAlign:"center",
            zIndex:"9",
            width:"1280",
            height:"720"
          }}/>
      </header>
    </div>
  );
}

export default App;
