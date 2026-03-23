import React from 'react';

export default function Topbar() {
  return (
    <>
      <style>{`
        .topbar {
          position: relative;
          top: 0;
          width: 100%;
        }
        .topbar-wrapper {
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          justify-content: space-around;
          width: 15%;
        }
        .topbar-title { padding-left: 10px; }
        .topbar-notification {
          display: flex;
          align-items: center;
          position: relative;
        }
        .topbar-notification:hover { cursor: pointer; }
        .icon-top { font-size: 20px; }
        .topbar-notification span {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: red;
          color: white;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          text-align: center;
          font-size: 10px;
        }
        .topbar-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
      `}</style>
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
    </>
  );
}
