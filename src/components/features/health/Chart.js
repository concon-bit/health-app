// src/components/features/health/Chart.js

import React, { useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { format, isValid } from 'date-fns';
import { MOOD_ICONS } from '../../../constants/iconConstants';
import styles from './HealthDashboard.module.css';
import { FaCog } from 'react-icons/fa';
import ReactDOMServer from 'react-dom/server';
import { useSelector } from 'react-redux';

Highcharts.setOptions({
    lang: { shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], weekdays: ['日', '月', '火', '水', '木', '金', '土'] },
    credits: { enabled: false }
});

const Chart = () => {
    const { items: logs, loading } = useSelector((state) => state.logs) || { items: [] };
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showWater, setShowWater] = useState(false);
    const [showMood, setShowMood] = useState(true);

    if (loading) return <p>グラフを読み込み中...</p>;
    const validLogs = Array.isArray(logs) ? logs.filter(log => log && log.date && isValid(new Date(log.date))) : [];
    if (validLogs.length === 0) return <p>グラフを表示する記録がありません。</p>;

    const sortedLogs = [...validLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const categories = sortedLogs.map(log => format(new Date(log.date + 'T00:00:00'), 'M/d'));
    const tempData = sortedLogs.map(log => log.temp ? parseFloat(log.temp) : null);
    const waterData = sortedLogs.map(log => log.waterIntake !== undefined ? log.waterIntake : null);
    
    const moodIconData = sortedLogs.map((log, index) => {
        if (!log.mood || !log.temp) return null;
        return { x: index, y: parseFloat(log.temp) + 0.3, mood: log.mood };
    }).filter(Boolean);

    const yAxisConfig = [
        { title: { text: '体温 (°C)', style: { color: Highcharts.getOptions().colors[0] } }, labels: { format: '{value} °C', style: { color: Highcharts.getOptions().colors[0] } }, min: 35.0, plotLines: [{ value: 37.5, color: 'red', dashStyle: 'shortdash', width: 2, label: { text: '発熱ライン' } }] }
    ];
    if (showWater) {
        yAxisConfig.push({ title: { text: '水分摂取量 (ml)', style: { color: Highcharts.getOptions().colors[1] } }, labels: { format: '{value} ml', style: { color: Highcharts.getOptions().colors[1] } }, opposite: true });
    }

    const options = {
        chart: { type: 'spline' },
        title: { text: '体調の推移' },
        xAxis: { categories },
        yAxis: yAxisConfig,
        series: [
            { name: '体温', data: tempData, yAxis: 0, zIndex: 1, marker: { symbol: 'circle', radius: 4 } },
            { name: '水分摂取量', type: 'column', data: waterData, yAxis: showWater ? 1 : 0, visible: showWater },
            {
                name: '気分', type: 'scatter', data: moodIconData, yAxis: 0, visible: showMood,
                marker: { symbol: 'circle', radius: 0, states: { hover: { enabled: false } } },
                dataLabels: {
                    enabled: true, useHTML: true,
                    formatter: function() {
                        const iconComponent = MOOD_ICONS[this.point.mood];
                        if (iconComponent) {
                            // [修正点] SVG文字列を<span>タグで囲むことで警告を解消
                            return '<span>' + ReactDOMServer.renderToString(iconComponent) + '</span>';
                        }
                        return '';
                    },
                    style: { fontSize: '18px', cursor: 'default' }, y: -10
                },
                showInLegend: false,
            }
        ],
        legend: { enabled: false },
        tooltip: { enabled: false },
        accessibility: { enabled: false }
    };

    return (
        <div className={styles.chartContainer}>
            <button className={styles.settingsButton} onClick={() => setIsSettingsOpen(true)}><FaCog /></button>
            <HighchartsReact highcharts={Highcharts} options={options} />
            {isSettingsOpen && (
                <div className={styles.modalBackdrop} onClick={() => setIsSettingsOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>グラフ表示設定</h3>
                        <div className={styles.settingItem}><span>水分量を表示する</span><label className={styles.switch}><input type="checkbox" checked={showWater} onChange={() => setShowWater(!showWater)} /><span className={styles.slider}></span></label></div>
                        <div className={styles.settingItem}><span>気分アイコンを表示する</span><label className={styles.switch}><input type="checkbox" checked={showMood} onChange={() => setShowMood(!showMood)} /><span className={styles.slider}></span></label></div>
                        <button className={styles.closeButton} onClick={() => setIsSettingsOpen(false)}>閉じる</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chart;