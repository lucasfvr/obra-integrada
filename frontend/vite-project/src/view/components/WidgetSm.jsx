import React from 'react';

export default function WidgetSm() {
  return (
    <>
      <style>{`
        .widgetSm {
          flex: 1;
          -webkit-box-shadow: 0px 0px 11px -1px rgba(0, 0, 0, 0.16);
          box-shadow: 0px 0px 11px -1px rgba(0, 0, 0, 0.16);
          padding: 20px;
          margin-right: 20px;
        }
        .widgetSmTitle { padding-bottom: 15px; }
        .listItem {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        .widgetUserImg {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        .widgetSmInfo {
          flex: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .widgetSmInfo .widgetUserUsername { font-weight: 600; }
        .widgetSmInfo .widgetUserTitle { color: lightslategray; }
        .widgetSmButton {
          flex: 0.5;
          width: 100%;
          display: flex;
          align-items: center;
          height: fit-content;
          background-color: #eeeef7;
          color: #555;
          border: none;
          padding: 7px 10px;
        }
      `}</style>
      <div className="widgetSm">
        <h2 className="widgetSmTitle">Novos Usuários</h2>
        <ul className="usersList">
          <li className="listItem">
            <img
              src="https://images.unsplash.com/photo-1648562951003-5acb85b16aa6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDI5fFM0TUtMQXNCQjc0fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=600&q=60"
              alt="user-avatar"
              className="widgetUserImg"
            />

            <div className="widgetSmInfo">
              <span className="widgetUserUsername">Lucas Montenegro</span>
              <span className="widgetUserTitle">Engenheira de Software</span>
            </div>

            <button className="widgetSmButton">
              <i class="bi bi-eye-fill"></i>
              Display
            </button>
          </li>
          <li className="listItem">
            <img
              src="https://images.unsplash.com/photo-1648562951003-5acb85b16aa6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDI5fFM0TUtMQXNCQjc0fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=600&q=60"
              alt="user-avatar"
              className="widgetUserImg"
            />

            <div className="widgetSmInfo">
              <span className="widgetUserUsername">Lucas Montenegro</span>
              <span className="widgetUserTitle">Engenheira de Software</span>
            </div>

            <button className="widgetSmButton">
              <i class="bi bi-eye-fill"></i>
              Display
            </button>
          </li>
          <li className="listItem">
            <img
              src="https://images.unsplash.com/photo-1648562951003-5acb85b16aa6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDI5fFM0TUtMQXNCQjc0fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=600&q=60"
              alt="user-avatar"
              className="widgetUserImg"
            />

            <div className="widgetSmInfo">
              <span className="widgetUserUsername">Lucas Montenegro</span>
              <span className="widgetUserTitle">Engenheira de Software</span>
            </div>

            <button className="widgetSmButton">
              <i class="bi bi-eye-fill"></i>
              Display
            </button>
          </li>
          <li className="listItem">
            <img
              src="https://images.unsplash.com/photo-1648562951003-5acb85b16aa6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDI5fFM0TUtMQXNCQjc0fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=600&q=60"
              alt="user-avatar"
              className="widgetUserImg"
            />

            <div className="widgetSmInfo">
              <span className="widgetUserUsername">Lucas Montenegro</span>
              <span className="widgetUserTitle">Engenheira de Software</span>
            </div>

            <button className="widgetSmButton">
              <i class="bi bi-eye-fill"></i>
              Display
            </button>
          </li>
          <li className="listItem">
            <img
              src="https://images.unsplash.com/photo-1648562951003-5acb85b16aa6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDI5fFM0TUtMQXNCQjc0fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=600&q=60"
              alt="user-avatar"
              className="widgetUserImg"
            />

            <div className="widgetSmInfo">
              <span className="widgetUserUsername">Lucas Montenegro</span>
              <span className="widgetUserTitle">Engenheira de Software</span>
            </div>

            <button className="widgetSmButton">
              <i class="bi bi-eye-fill"></i>
              Visualizar
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
