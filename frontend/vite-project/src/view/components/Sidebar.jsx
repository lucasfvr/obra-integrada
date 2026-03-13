import React from 'react';
import { Link } from 'react-router-dom';

import './Sidebar.css';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-wrapper">
        <div className="sidebar-menu">
          <h3 className="sidebar-title">Dashboard</h3>
          <ul className="sidebar-list">
            <li className="sidebar-listItem">
              <Link to="/" className="link">
                <i className="bi bi-house-fill sidebar-icon"></i>
                Inicio
              </Link>
            </li>
            <li className="sidebar-listItem">
              <i className="bi bi-graph-up sidebar-icon"></i>
              Análise
            </li>
            <li className="sidebar-listItem">
              <i className="bi bi-graph-up-arrow sidebar-icon"></i>
              Vendas
            </li>
          </ul>
        </div>

        <div className="sidebar-menu">
          <h3 className="sidebar-title">Menu</h3>
          <ul className="sidebar-list">
            <li className="sidebar-listItem">
              <Link to="/users" className="link">
                <i className="bi bi-person sidebar-icon"></i>
                Usuários
              </Link>
            </li>
            <li className="sidebar-listItem">
              <Link to="/products" className="link">
                <i className="bi bi-shop-window sidebar-icon"></i>
                Produtos
              </Link>
            </li>
            <li className="sidebar-listItem">
              <i className="bi bi-currency-dollar sidebar-icon"></i>
              Transações
            </li>
            <li className="sidebar-listItem">
              <i className="bi bi-bar-chart-line sidebar-icon"></i>
              Reportes
            </li>
          </ul>
        </div>

        <div className="sidebar-menu">
          <h3 className="sidebar-title">Notificações</h3>
          <ul className="sidebar-list">
            <li className="sidebar-listItem">
              <i className="bi bi-envelope sidebar-icon"></i>
              Email
            </li>
            <li className="sidebar-listItem">
              <i className="bi bi-graph-up sidebar-icon"></i>
              Feedback
            </li>
            <li className="sidebar-listItem">
              <i className="bi bi-chat-left sidebar-icon"></i>
              Mensagens
            </li>
          </ul>
        </div>

        <div className="sidebar-menu">
          <h3 className="sidebar-title">Central</h3>
          <ul className="sidebar-list">
            <li className="sidebar-listItem">
              <i className="bi bi-briefcase sidebar-icon"></i>
              Gerenciamento
            </li>
            <li className="sidebar-listItem">
              <i className="bi bi-graph-up-arrow sidebar-icon"></i>
              Análise
            </li>
            <li className="sidebar-listItem">
              <i className="bi bi-exclamation-circle-fill sidebar-icon"></i>
              Bugs
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
