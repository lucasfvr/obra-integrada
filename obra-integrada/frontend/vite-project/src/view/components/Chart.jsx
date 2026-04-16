import React from 'react';
import './Chart.css';

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
  );
}
