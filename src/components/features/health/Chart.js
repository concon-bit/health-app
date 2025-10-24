// src/components/features/health/Chart.js

import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import styles from './HealthDashboard.module.css';
import { useSelector } from 'react-redux';
// ▼▼▼ [修正] addDays と subDays をインポートします ▼▼▼
import { isValid, subDays, addDays } from 'date-fns';
// ▲▲▲ [修正] ▲▲▲

Highcharts.setOptions({
    lang: { shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], weekdays: ['日', '月', '火', '水', '木', '金', '土'] },
    credits: { enabled: false }
});

const Chart = () => {
    const { items: logs, loading } = useSelector((state) => state.logs) || { items: [] };

    if (loading) return <p>グラフを読み込み中...</p>;
    
    const validLogs = Array.isArray(logs) ? logs.filter(log => log && log.date && isValid(new Date(log.date))) : [];
    const sortedLogs = [...validLogs].sort((a, b) => new Date(a.date) - new Date(b.date));


    if (sortedLogs.length === 0) {
        return <p>グラフを表示する記録がありません。</p>;
    }

    // データを Highcharts の datetime 形式 [timestamp, value] に変更
    const tempData = sortedLogs.map(log => {
        const timestamp = new Date(log.date + 'T00:00:00').getTime();
        return [timestamp, log.temp ? parseFloat(log.temp) : null];
    });

    // ▼▼▼ [修正] デフォルトの表示範囲を「過去30日〜今日+1日」に設定 ▼▼▼
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);

    const xAxisMin = thirtyDaysAgo.getTime();
    const xAxisMax = addDays(today, 1).getTime(); // 今日+1日の余白
    // ▲▲▲ [修正] ▲▲▲

    // Y軸（縦軸）の設定
    const yAxisConfig = [
        { 
            title: { text: '体温 (°C)', style: { color: Highcharts.getOptions().colors[0] } }, 
            labels: { format: '{value} °C', style: { color: Highcharts.getOptions().colors[0] } }, 
            min: 35.0, 
            max: 38.5,
        }
    ];

    const options = {
        chart: { 
            type: 'spline',
            // ▼▼▼ [修正] スクロール(panning)を有効化し、ズームは無効化 ▼▼▼
            zoomType: null, // ズームは無効
            panning: true, // パン（スクロール）を有効化
            panKey: null, // Shiftキー不要でドラッグ/スワイプ可能に
            scrollablePlotArea: {
                minWidth: 1500, // スクロールできる全幅（この値が大きいほど過去に遡れます）
                scrollPositionX: 1 // 初期スクロール位置を一番右（最新）に設定
            }
            // ▲▲▲ [修正] ▲▲▲
        },
        title: { text: null }, 
        xAxis: { 
            type: 'datetime',
            // ▼▼▼ [修正] X軸の表示範囲(min/max)はスクロールのため削除 ▼▼▼
            // min: xAxisMin, // 削除
            max: xAxisMax, // [修正] maxのみ設定し、初期表示の右端を今日+1日にする
            // ▲▲▲ [修正] ▲▲▲
            dateTimeLabelFormats: {
                day: '%m/%d',
                week: '%m/%d',
                month: '%Y/%m',
                year: '%Y'
            },
            // ▼▼▼ [修正] X軸のラベルを強制的に5日間隔に設定 ▼▼▼
            tickInterval: 5 * 24 * 3600 * 1000, // 5日（ミリ秒）
            // ▲▲▲ [修正] ▲▲▲
        },
        yAxis: yAxisConfig,
        series: [
            { 
                name: '体温', 
                data: tempData, 
                yAxis: 0, 
                zIndex: 1, 
                marker: { symbol: 'circle', radius: 4 },
                connectNulls: true
            }
        ],
        legend: { 
            enabled: false
        },
        tooltip: {
            enabled: true, 
            shared: false, 
            headerFormat: '', 
            pointFormat: '<b>{point.y:.2f} °C</b>' 
        },
        accessibility: { enabled: false }
    };

    return (
        <div className={styles.chartContainer}>
            <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
    );
};

export default Chart;