import React from 'react';

import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Chart({ title, useData, dataKey, grid }) {
  return (
    <>
      <style>{`
        .chart {
          -webkit-box-shadow: 0px 0px 11px -1px rgba(0, 0, 0, 0.16);
          box-shadow: 0px 0px 11px -1px rgba(0, 0, 0, 0.16);
          margin-top: 20px;
          padding: 10px;
        }
        .chart-title {
          padding: 20px;
          margin-bottom: 20px;
        }
      `}</style>
      <div className="chart">
        <h3 className="chart-title">{title}</h3>
        <ResponsiveContainer width="100%" aspect={4 / 1}>
          <LineChart data={useData}>
            <XAxis dataKey="name" stroke="#5550bd"></XAxis>
            <Line type="monotone" dataKey={dataKey} stroke="#5550bd"></Line>
            <Tooltip />
            {grid && <CartesianGrid stroke="#e0dfdf" />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
