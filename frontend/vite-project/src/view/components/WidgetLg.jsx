import React from 'react';

export default function WidgetLg() {
  const type = 'Aproved';
  const type1 = 'Decline';
  const type2 = 'Pending';
  return (
    <>
      <style>{`
        .widgetLg {
          flex: 2;
          -webkit-box-shadow: 0px 0px 11px -1px rgba(0, 0, 0, 0.16);
          box-shadow: 0px 0px 11px -1px rgba(0, 0, 0, 0.16);
          padding: 20px;
        }
        .widgetLgTable { width: 100%; border-spacing: 20px; }
        .widgetLgTh { text-align: left; }
        .widgetLgUser {
          display: flex;
          font-weight: 600;
          align-items: center;
        }
        .widgetLgUser span { font-size: 15px; }
        .widgetLgDate, .widgetLgAmount { color: lightslategray; }
        .widgetLgImg {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 10px;
        }
        .widgetLgButton {
          border: none;
          padding: 7px 10px;
          border-radius: 10px;
        }
        .widgetLgButton.Aproved { background-color: #e5faf2; color: #3bb077; }
        .widgetLgButton.Decline { background-color: #fff0f1; color: #d95087; }
        .widgetLgButton.Pending { background-color: #ebf1fe; color: #2a7ade; }
      `}</style>
      <div className="widgetLg">
        <h2 className="widgetLgTitle">Últimas Transações</h2>

        <table className="widgetLgTable">
          <thead className="widgetLgThead">
            <tr>
              <th className="widgetLgTh">Usuário</th>
              <th className="widgetLgTh">Data</th>
              <th className="widgetLgTh">Valor</th>
              <th className="widgetLgTh">Status</th>
            </tr>
          </thead>
          <tbody className="widgetLgTbody">
            <tr>
              <td className="widgetLgUser">
                <img
                  src="https://images.unsplash.com/photo-1649228537048-227a135e86d2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDd8UzRNS0xBc0JCNzR8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=60"
                  alt="customer-avatar"
                  className="widgetLgImg"
                />
                <span>Pedro Susan</span>
              </td>
              <td className="widgetLgDate">2 Jun 2021</td>
              <td className="widgetLgAmount">R$122.00</td>
              <td className="widgetLgTd">
                <button className={`widgetLgButton ${type}`}>Aprovado</button>
              </td>
            </tr>
            <tr>
              <td className="widgetLgUser">
                <img
                  src="https://images.unsplash.com/photo-1649228537048-227a135e86d2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDd8UzRNS0xBc0JCNzR8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=60"
                  alt="customer-avatar"
                  className="widgetLgImg"
                />
                <span>Pedro Susan</span>
              </td>
              <td className="widgetLgDate">2 Jun 2021</td>
              <td className="widgetLgAmount">R$122.00</td>
              <td className="widgetLgTd">
                <button className={`widgetLgButton ${type1}`}>Reprovado</button>
              </td>
            </tr>
            <tr>
              <td className="widgetLgUser">
                <img
                  src="https://images.unsplash.com/photo-1649228537048-227a135e86d2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDd8UzRNS0xBc0JCNzR8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=60"
                  alt="customer-avatar"
                  className="widgetLgImg"
                />
                <span>Pedro Susan</span>
              </td>
              <td className="widgetLgDate">2 Jun 2021</td>
              <td className="widgetLgAmount">R$122.00</td>
              <td className="widgetLgTd">
                <button className={`widgetLgButton ${type}`}>Aprovado</button>
              </td>
            </tr>
            <tr>
              <td className="widgetLgUser">
                <img
                  src="https://images.unsplash.com/photo-1649228537048-227a135e86d2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDd8UzRNS0xBc0JCNzR8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=60"
                  alt="customer-avatar"
                  className="widgetLgImg"
                />
                <span>Pedro Susan</span>
              </td>
              <td className="widgetLgDate">2 Jun 2021</td>
              <td className="widgetLgAmount">R$122.00</td>
              <td className="widgetLgTd">
                <button className={`widgetLgButton ${type2}`}>Em Análise</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
