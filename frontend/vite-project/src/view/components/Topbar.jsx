import React from 'react';
import './Topbar.css';

export default function Topbar() {
  return (
    <div className="topbar">
      <div className="topbar-wrapper">
        <div className="topbar-left">
          <h2 className="topbar-title">Obra Integrada</h2>
        </div>
        <div className="topbar-right">
          <div className="topbar-notification">
            <i className="bi bi-bell icon-top"></i>
            <span className="notification-number">2</span>
          </div>

          <div className="topbar-notification">
            <i className="bi bi-globe icon-top"></i>
            <span className="notification-number">1</span>
          </div>

          <div className="topbar-notification">
            <i className="bi bi-gear icon-top"></i>
          </div>

          <img
            alt="avatar-img"
            className="topbar-avatar"
            src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8YXNpYW4lMjBnaXJsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
          />
        </div>
      </div>
    </div>
  );
}
