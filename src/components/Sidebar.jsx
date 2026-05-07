import React, { useState } from 'react';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('bx-group');

  const mngEndpoints = {
    home: 'https://www.mnghealth.com/',
    calendar: 'https://calendly.com/mnghealth/',
    user: 'https://www.mnghealth.com/technology-enabled-solutions/kol-and-speaker-advocacy/',
    envelope: 'https://www.mnghealth.com/contact/',
    cog: 'https://www.mnghealth.com/platform/'
  };

  const handleClick = (iconClass) => {
    if (!['bx-cog', 'bx-support'].includes(iconClass)) {
      setActiveItem(iconClass);
    }

    if (iconClass === 'bx-grid-alt') { window.showMNGToast('Accessing MNG Health Dashboard...', mngEndpoints.home); setTimeout(() => window.open(mngEndpoints.home, '_blank'), 800); }
    else if (iconClass === 'bx-group') { window.showMNGToast('MNG Virtual Advisory Board Active.'); }
    else if (iconClass === 'bx-calendar') { window.showMNGToast('Opening Calendar...', mngEndpoints.calendar); setTimeout(() => window.open(mngEndpoints.calendar, '_blank'), 800); }
    else if (iconClass === 'bx-bar-chart-alt-2') { window.showMNGToast('Navigating to Analytics...', mngEndpoints.cog); setTimeout(() => window.open(mngEndpoints.cog, '_blank'), 800); }
    else if (iconClass === 'bx-user-voice') { window.showMNGToast('Opening HCP Engagement Protocol...', mngEndpoints.user); setTimeout(() => window.open(mngEndpoints.user, '_blank'), 800); }
    else if (iconClass === 'bx-cog') { window.showMNGToast('Accessing Settings...', mngEndpoints.cog); setTimeout(() => window.open(mngEndpoints.cog, '_blank'), 800); }
    else if (iconClass === 'bx-support') { window.showMNGToast('Opening Support Desk...', mngEndpoints.envelope); setTimeout(() => window.open(mngEndpoints.envelope, '_blank'), 800); }
  };

  return (
    <aside className="sidebar">
      <div className="brand-flame">
        <img src="/MNG_Health.png" alt="MNG Health Logo" style={{ width: '70px' }} />
      </div>

      <div className="nav-list">
        <div className={`nav-item tooltip-wrap-right ${activeItem === 'bx-grid-alt' ? 'active' : ''}`} onClick={() => handleClick('bx-grid-alt')} data-tooltip="Dashboard"><i className='bx bx-grid-alt'></i></div>
        <div className={`nav-item tooltip-wrap-right ${activeItem === 'bx-calendar' ? 'active' : ''}`} onClick={() => handleClick('bx-calendar')} data-tooltip="Meetings"><i className='bx bx-calendar'></i></div>
        <div className={`nav-item tooltip-wrap-right ${activeItem === 'bx-group' ? 'active' : ''}`} onClick={() => handleClick('bx-group')} data-tooltip="Advisory Boards"><i className='bx bx-group' style={activeItem === 'bx-group' ? { color: '#FFF' } : {}}></i></div>
        <div className={`nav-item tooltip-wrap-right ${activeItem === 'bx-bar-chart-alt-2' ? 'active' : ''}`} onClick={() => handleClick('bx-bar-chart-alt-2')} data-tooltip="Analytics"><i className='bx bx-bar-chart-alt-2'></i></div>
        <div className={`nav-item tooltip-wrap-right ${activeItem === 'bx-user-voice' ? 'active' : ''}`} onClick={() => handleClick('bx-user-voice')} data-tooltip="HCP Engagement"><i className='bx bx-user-voice'></i></div>
      </div>

      <div className="bottom-nav">
        <div className="nav-item tooltip-wrap-right" onClick={() => handleClick('bx-cog')} data-tooltip="Settings"><i className='bx bx-cog'></i></div>
        <div className="nav-item tooltip-wrap-right" onClick={() => handleClick('bx-support')} data-tooltip="Support"><i className='bx bx-support'></i></div>
      </div>
    </aside>
  );
};

export default Sidebar;
