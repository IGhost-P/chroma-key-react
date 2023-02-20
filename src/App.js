import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const video = useRef(null);
  const canvas = useRef(null);
  const [streaming, setStreaming] = useState(false);

  const onVideoCanPlay = () => {
    if (!streaming) {
      setHeight(video.current.videoHeight / (video.current.videoWidth / width));

      if (isNaN(height)) {
        setHeight(width / (4 / 3));
      }

      video.current.setAttribute("width", 400);
      video.current.setAttribute("height", 300);
      canvas.current.setAttribute("width", 400);
      canvas.current.setAttribute("height", 300);
      setStreaming(true);
    }
  };

  const chromaKey = (r, g, b) => {
    const threshold = 80;
    if (r > 60 && g > 120 && b < 120 && Math.abs(r - g) < 15) {
      return [0, 0, 0, 0];
    }
    return [r, g, b, 255];
  };

  useEffect(() => {
    const context = canvas.current.getContext("2d");
    let requestId;
    const constraints = {
      video: true,
    };

    const success = (stream) => {
      video.current.srcObject = stream;
      video.current.play();
    };

    const error = (err) => {
      console.log("The following error occurred: " + err.name);
    };

    navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);

    const render = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(
        video.current,
        0,
        0,
        canvas.current.width,
        canvas.current.height
      );
      const imageData = context.getImageData(
        0,
        0,
        canvas.current.width,
        canvas.current.height
      );
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = data.slice(i, i + 3);
        const [cr, cg, cb, ca] = chromaKey(r, g, b);
        data[i] = cr;
        data[i + 1] = cg;
        data[i + 2] = cb;
        data[i + 3] = ca;
      }
      context.putImageData(imageData, 0, 0);
      requestId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, []);

  return (
    <>
      <div className="camera">
        <video
          id="video"
          width="400"
          height="300"
          autoPlay
          onCanPlay={onVideoCanPlay}
          ref={video}
        ></video>
      </div>
      <canvas id="canvas" width="400" height="300" ref={canvas}></canvas>
    </>
  );
}

export default App;
