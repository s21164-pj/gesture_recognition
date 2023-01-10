import React, {useRef} from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import './App.css';

function App() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
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
