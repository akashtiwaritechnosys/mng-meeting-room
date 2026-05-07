import React, { useState } from 'react';

const FloatingDock = ({ onEnd }) => {
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);

  const toggleMic = () => {
    setMicActive(!micActive);
    if (micActive) {
      window.showMNGToast('Microphone Muted - MNG Broadcast protected.');
    } else {
      window.showMNGToast('Live Audio Active.');
    }
  };

  const toggleCam = () => {
    setCamActive(!camActive);
    if (camActive) {
      window.showMNGToast('Camera feed disabled.');
    } else {
      window.showMNGToast('Camera enabled.');
    }
  };

  return (
    <div className="floating-dock">
      <button className={`dock-tool hw-mic ${!micActive ? 'red-state' : ''}`} onClick={toggleMic}>
        <i className={micActive ? 'bx bx-microphone' : 'bx bx-microphone-off'}></i>
      </button>
      <button className={`dock-tool hw-cam ${!camActive ? 'red-state' : ''}`} onClick={toggleCam}>
        <i className={camActive ? 'bx bx-video' : 'bx bx-video-off'}></i>
      </button>
      <button className="dock-tool"><i className='bx bx-desktop'></i></button>
      <button className="dock-tool"><i className='bx bx-bar-chart-alt-2'></i></button>
      <button className="dock-tool"><i className='bx bx-smile'></i></button>
      <button className="dock-tool dock-end" onClick={onEnd}><i className='bx bx-power-off'></i></button>
    </div>
  );
};

export default FloatingDock;
