// src/components/dashboard/Chart.js

import React, { useState } from 'react';
import { useLogs } from '../../contexts/LogContext';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { format, isValid } from 'date-fns';
import { MOOD_OPTIONS } from '../../constants/appConstants';
import styles from '../../styles/Dashboard.module.css';
// [追加] 歯車アイコンをインポート
import { FaCog } from 'react-icons/fa';

Highcharts.setOptions({
    lang: { shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], weekdays: ['日', '月', '火', '水', '木', '金', '土'] },
    credits: { enabled: false }
});

const Chart = () => {
    const { logs, loading } = useLogs();
    // [修正] 設定モーダルの開閉状態を追加
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showWater, setShowWater] = useState(false);
    const [showMood, setShowMood] = useState(true);

    if (loading) return <p>グラフを読み込み中...</p>;
    
    const validLogs = logs.filter(log => log && log.date && isValid(new Date(log.date)));

    if (validLogs.length === 0) return <p>グラフを表示する記録がありません。</p>;

    const sortedLogs = [...validLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const categories = sortedLogs.map(log => format(new Date(log.date + 'T00:00:00'), 'M/d'));
    const tempData = sortedLogs.map(log => ({
        y: log.temp ? parseFloat(log.temp) : null,
        mood: log.mood || null
    }));
    const waterData = sortedLogs.map(log => log.waterIntake !== undefined ? log.waterIntake : null);
    
    const options = {
        chart: { type: 'spline' },
        title: { text: '体調の推移' },
        xAxis: { categories },
        yAxis: [
            { 
                title: { text: '体温 (°C)', style: { color: Highcharts.getOptions().colors[0] } },
                labels: { format: '{value} °C', style: { color: Highcharts.getOptions().colors[0] } },
                min: 35.0,
                plotLines: [{ value: 37.5, color: 'red', dashStyle: 'shortdash', width: 2, label: { text: '発熱ライン' } }]
            },
            { 
                title: { text: '水分摂取量 (ml)', style: { color: Highcharts.getOptions().colors[1] } },
                labels: { format: '{value} ml', style: { color: Highcharts.getOptions().colors[1] } },
                opposite: true
            }
        ],
        series: [
            { 
                name: '体温', 
                data: tempData,
                yAxis: 0, 
                dataLabels: {
                    enabled: showMood,
                    useHTML: true,
                    formatter: function() {
                        if (this.point.mood) {
                            return `<span style="font-size: 14px;">${MOOD_OPTIONS[this.point.mood]}</span>`;
                        }
                        return null;
                    },
                    y: -20
                }
            },
            {
                name: '水分摂取量',
                type: 'column', 
                data: waterData,
                yAxis: 1, 
                visible: showWater
            }
        ],
        legend: { enabled: false },
        // [修正] ツールチップを無効化
        tooltip: { enabled: false }
    };

    return (
        <div className={styles.chartContainer}>
             {/* --- [ここから新規追加] 歯車アイコンボタン --- */}
            <button className={styles.settingsButton} onClick={() => setIsSettingsOpen(true)}>
                <FaCog />
            </button>
            {/* --- [ここまで新規追加] --- */}

            <HighchartsReact highcharts={Highcharts} options={options} />
            
            {/* --- [ここから新規追加] 設定モーダル --- */}
            {isSettingsOpen && (
                <div className={styles.modalBackdrop} onClick={() => setIsSettingsOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>グラフ表示設定</h3>
                        <div className={styles.settingItem}>
                            <span>水分量を表示する</span>
                            <label className={styles.switch}>
                                <input type="checkbox" checked={showWater} onChange={() => setShowWater(!showWater)} />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                        <div className={styles.settingItem}>
                            <span>気分アイコンを表示する</span>
                             <label className={styles.switch}>
                                <input type="checkbox" checked={showMood} onChange={() => setShowMood(!showMood)} />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                         <button className={styles.closeButton} onClick={() => setIsSettingsOpen(false)}>閉じる</button>
                    </div>
                </div>
            )}
             {/* --- [ここまで新規追加] --- */}
        </div>
    );
};

export default Chart;