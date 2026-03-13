import React from 'react';

import FeaturedInfo from '../../components/FeaturedInfo/FeaturedInfo';
import Chart from '../../components/Chart/Chart';
import { userData } from '../../dummyData';
import WidgetLg from '../../components/WidgetLg/WidgetLg';
import WidgetSm from '../../components/WidgetSm/WidgetSm';

import './Home.css';

export default function Home() {
  return (
    <div className="home">
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
  );
}
