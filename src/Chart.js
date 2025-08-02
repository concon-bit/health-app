import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Highchartsの日本語化などのオプション設定
Highcharts.setOptions({
  lang: { shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], weekdays: ['日', '月', '火', '水', '木', '金', '土'] },
  credits: { enabled: false } // 右下のクレジット表記を非表示
});

function Chart({ logs }) {
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));

  const options = {
    title: { text: '体温の推移' },
    xAxis: { categories: sortedLogs.map(log => log.date.substring(5).replace('-', '/')) },
    yAxis: {
      title: { text: '体温 (°C)' },
      min: 35.0,
      plotLines: [{ value: 37.5, color: 'red', dashStyle: 'shortdash', width: 2, label: { text: '発熱ライン' } }]
    },
    series: [{ name: '体温', data: sortedLogs.map(log => parseFloat(log.temp)), tooltip: { valueSuffix: ' °C' } }]
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

export default Chart;