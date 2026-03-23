import React from 'react';

export default function FeaturedInfo() {
  return (
    <>
      <style>{`
        .featured { display: grid; grid-template-columns: repeat(3, 1fr); }
        .featured-item {
          -webkit-box-shadow: 0px 0px 11px -1px rgba(0, 0, 0, 0.16);
          box-shadow: 0px 0px 11px -1px rgba(0, 0, 0, 0.16);
          width: 80%;
          display: flex;
          align-items: flex-start;
          flex-direction: column;
          padding: 35px 30px;
          gap: 1rem;
        }
        .featuredTitle { font-size: 20px; font-weight: 500; }
        .featuredMoneyContainer { position: relative; width: 50%; }
        .featuredMoneyContainer .featuredMoney { font-size: 25px; font-weight: 600; }
        .featuredMoneyRate {
          font-weight: normal;
          letter-spacing: 1px;
          font-size: 15px;
          position: absolute;
          right: 5px;
          top: 5px;
        }
        .bad-rate { color: red; }
        .good-rate { color: rgb(5, 255, 5); }
        .featuredResult { font-weight: lighter; }
      `}</style>
      <div className="featured">
        <div className="featured-item">
          <span className="featuredTitle">Receita</span>
          <div className="featuredMoneyContainer">
            <span className="featuredMoney">R$8,415</span>
            <span className="featuredMoneyRate">
              -11.4
              <i class="bi bi-arrow-down bad-rate"></i>
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
              <i class="bi bi-arrow-down bad-rate"></i>
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
              <i class="bi bi-arrow-up good-rate"></i>
            </span>
          </div>

          <span className="featuredResult">Comparado ao último mês</span>
        </div>
      </div>
    </>
  );
}
