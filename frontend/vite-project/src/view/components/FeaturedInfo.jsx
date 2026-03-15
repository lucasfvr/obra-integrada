import React from 'react';
import './FeaturedInfo.css';

export default function FeaturedInfo() {
  return (
    <div className="featured">
      <div className="featured-item">
        <span className="featuredTitle">Receita</span>
        <div className="featuredMoneyContainer">
          <span className="featuredMoney">R$8,415</span>
          <span className="featuredMoneyRate">
            -11.4
            <i className="bi bi-arrow-down bad-rate"></i>
          </span>
        </div>

        <span className="featuredResult">Comparado ao último mês</span>
      </div>

      <div className="featured-item">
        <span className="featuredTitle">Vendas</span>
        <div className="featuredMoneyContainer">
          <span className="featuredMoney">R$4,415</span>
          <span className="featuredMoneyRate">
            -1.4
            <i className="bi bi-arrow-down bad-rate"></i>
          </span>
        </div>

        <span className="featuredResult">Comparado ao último mês</span>
      </div>

      <div className="featured-item">
        <span className="featuredTitle">Custo da Operação</span>
        <div className="featuredMoneyContainer">
          <span className="featuredMoney">R$2,225</span>
          <span className="featuredMoneyRate">
            +2.4
            <i className="bi bi-arrow-up good-rate"></i>
          </span>
        </div>

        <span className="featuredResult">Comparado ao último mês</span>
      </div>
    </div>
  );
}
