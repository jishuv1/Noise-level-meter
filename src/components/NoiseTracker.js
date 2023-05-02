import React, {useState, useEffect} from 'react';
import Bar from './Bar';
import './noiseTracker.css';

const NoiseTracker = () => {
  const [recording, setRecording] = useState(false);
  const [decibels, setDecibels] = useState(0);
  const [maxDecibels, setMaxDecibels] = useState(0);
  const [avgDecibels, setAvgDecibels] = useState(0);
  const [decibelsArray, setDecibelsArray] = useState([]);

  useEffect(() => {
    let mediaStream = null;
    let audioContext = null;
    let analyser = null;
    let rafId = null;

    const startRecording = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        analyser.fftSize = 32;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const getDecibels = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          let max = 0;
          for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i];
            sum += value;
            max = Math.max(max, value);
          }
          const average = sum / bufferLength;
          setDecibels(average);

          setTimeout(() => {
            setDecibelsArray((prevArray) => [...prevArray, average]);
          }, 500);
          rafId = requestAnimationFrame(getDecibels);
        };

        getDecibels();
      } catch (error) {
        console.error(error);
      }
    };

    const stopRecording = () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };

    if (recording) {
      startRecording();
    } else {
      stopRecording();
    }

    return stopRecording;
  }, [recording]);

  const handleStartRecording = () => {
    setRecording(true);
  };

  const handleStopRecording = () => {
    setRecording(false);
    // setDecibels(0);
  };
  const handleResetRecording = () => {
    setRecording(false);
    setDecibels(0);
    setMaxDecibels(0);
    setAvgDecibels(0);
    setDecibelsArray([]);
  };

  useEffect(() => {
    if (recording) {
      const sum = decibelsArray.reduce((acc, curr) => acc + curr, 0);
      const avg = sum / decibelsArray.length || 0;
      setAvgDecibels(avg);
      setMaxDecibels(Math.max(...decibelsArray));
    }
  }, [decibelsArray, recording]);

  return (
    <>
      <div className='noise-tracker'>
        <button onClick={handleStartRecording}>Start Recording</button>
        <button onClick={handleStopRecording}>Stop Recording</button>
        <button onClick={handleResetRecording}>Reset</button>
        <p>{`Current noise level: ${Math.round(decibels)} dB`}</p>
        <p>{`Max noise level: ${Math.round(maxDecibels)} dB`}</p>
        <p>{`Avg noise level: ${Math.round(avgDecibels)} dB`}</p>
      </div>
      <div className='bar'>
        <Bar decibels={Math.round(decibels)} />
        <p className='barText'>Noise Level</p>
      </div>
    </>
  );
};

export default NoiseTracker;
