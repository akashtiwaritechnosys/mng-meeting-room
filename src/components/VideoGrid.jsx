import React from 'react';

const allParticipants = [
  { name: "Dr. Priya Nair", role: "FDA Consultant", avatar: "/doctor6.jpg", muted: false },
  { name: "Dr. Robert Chen", role: "Chief Oncologist", avatar: "/doctor5.jpg", muted: false },
  { name: "Dr. Emily Stone", role: "Clinical Researcher", avatar: "/doctor2.jpg", muted: true },
  { name: "Dr. Marcus Webb", role: "Medical Director", avatar: "/doctor3.jpg", muted: true, isAudio: true },
  { name: "Dr. Sarah Johnson", role: "Chief Oncologist", avatar: "/doctor1.jpg", muted: false },
  { name: "Dr. David Kim", role: "Clinical Researcher", avatar: "/doctor4.jpg", muted: true },
];

const VideoGrid = () => {
  return (
    <div className="video-column responsive-grid" id="video-column">
      {allParticipants.map((p, idx) => (
        <div className="grid-card" key={idx}>
          {p.isAudio ? (
            <div className="audio-state" style={{background:'#3A4151', width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <div className="audio-ring-layer">
                    <img src={p.avatar} alt={p.name} />
                </div>
            </div>
          ) : (
            <img src={p.avatar} className="feed-img" alt={p.name} />
          )}
          
          <div className="video-name bottom-left-name">
            <span className="v-name">{p.name}</span>
            {p.role && <span className="role-text">{p.role}</span>}
          </div>
          
          <i className={`bx ${p.muted ? 'bx-microphone-off' : 'bx-microphone'} icon-corner`} 
             style={{color: p.muted ? 'var(--c-red)' : 'rgb(3, 133, 3)'}}>
          </i>
        </div>
      ))}
      
      <div className="grid-card more-users-card" style={{background:'#3B4151'}}>
          <i className='bx bx-group'></i>
          <span>+ 12 Experts</span>
      </div>
    </div>
  );
};

export default VideoGrid;
