import React from 'react';

import FeaturedInfo from './components/FeaturedInfo';
import Chart from './components/Chart';
import WidgetLg from './components/WidgetLg';
import WidgetSm from './components/WidgetSm';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';

import './DashboardFinal.css';

const userData = [
  { name: 'Jan', 'Active User': 4000 },
  { name: 'Feb', 'Active User': 3000 },
  { name: 'Mar', 'Active User': 2000 },
  { name: 'Apr', 'Active User': 2780 },
  { name: 'May', 'Active User': 1890 },
  { name: 'Jun', 'Active User': 2390 },
  { name: 'Jul', 'Active User': 3490 },
  { name: 'Aug', 'Active User': 4000 },
  { name: 'Sep', 'Active User': 3000 },
  { name: 'Oct', 'Active User': 2000 },
  { name: 'Nov', 'Active User': 2780 },
  { name: 'Dec', 'Active User': 1890 },
];

export default function DashboardFinal({ onNavigate }) {
  return (
    <div className="home">
      <Topbar />
      <div className="homeContainer">
        <Sidebar onNavigate={onNavigate} />
        <div className="homeWidgets">
          <FeaturedInfo />
          <Chart
            grid
            dataKey="Active User"
            useData={userData}
            title="Estatísticas de Usuários"
          />

          <div className="widgetContainer">
            <WidgetSm />
            <WidgetLg />
          </div>
        </div>
      </div>
    </div>
  );
}