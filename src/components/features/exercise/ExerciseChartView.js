// src/components/features/exercise/ExerciseChartView.js

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { toggleExerciseChart } from '../../../redux/uiSlice';
import { fetchAllExerciseLogs } from '../../../redux/exerciseSlice';
import { fetchLogs } from '../../../redux/logsSlice';
import styles from './ExerciseChart.module.css';

// ▼▼▼ [修正] エラーの根本原因である、以下の拡張機能の読み込みを完全に削除しました ▼▼▼
// import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
// NoDataToDisplay(Highcharts);
// ▲▲▲ [修正] ▲▲▲

const ExerciseChartView = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user.currentUser?.uid);
  const allExerciseLogs = useSelector(state => state.exercise.allItems);
  const healthLogs = useSelector(state => state.logs.items);

  useEffect(() => {
    if (userId) {
      if (allExerciseLogs.length === 0) {
        dispatch(fetchAllExerciseLogs(userId));
      }
      if (healthLogs.length === 0) {
        dispatch(fetchLogs(userId)); 
      }
    }
  }, [userId, dispatch, allExerciseLogs.length, healthLogs.length]);

  const chartOptions = useMemo(() => {
    const calorieData = allExerciseLogs
      .map(log => {
        const totalCalories = log.logs.reduce((sum, item) => sum + (item.calories || 0), 0);
        return [new Date(log.date + 'T00:00:00').getTime(), Math.round(totalCalories)];
      })
      .sort((a, b) => a[0] - b[0]);

    const weightData = healthLogs
      .filter(log => log.weight)
      .map(log => [new Date(log.date + 'T00:00:00').getTime(), parseFloat(log.weight)])
      .sort((a, b) => a[0] - b[0]);

    return {
      chart: { zoomType: 'x' },
      title: { text: '体重と消費カロリーの推移' },
      xAxis: { type: 'datetime', title: { text: null } },
      yAxis: [{
        title: { text: '消費カロリー (kcal)', style: { color: '#ef476f' } },
        labels: { style: { color: '#ef476f' } },
        min: 0,
      }, {
        title: { text: '体重 (kg)', style: { color: '#06d6a0' } },
        labels: { style: { color: '#06d6a0' } },
        opposite: true,
      }],
      series: [{
        name: '消費カロリー',
        type: 'column',
        data: calorieData,
        yAxis: 0,
        color: '#fecdd3',
        tooltip: { valueSuffix: ' kcal' },
        pointPlacement: 'on',
      }, {
        name: '体重',
        type: 'spline',
        data: weightData,
        yAxis: 1,
        color: '#06d6a0',
        marker: { enabled: true, radius: 4 },
        tooltip: { valueSuffix: ' kg' }
      }],
      tooltip: { shared: true, crosshairs: true },
      credits: { enabled: false },
      lang: { 
        shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], 
        weekdays: ['日', '月', '火', '水', '木', '金', '土'],
      },
      // ▼▼▼ [修正] 拡張機能を削除したため、noDataの定義も不要 ▼▼▼
      // noData: "表示するデータがありません" 
      accessibility: { enabled: false },
    };
  }, [allExerciseLogs, healthLogs]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>運動グラフ</h3>
        <button onClick={() => dispatch(toggleExerciseChart())}>リストに戻る</button>
      </div>
      <div className={styles.chartWrapper}>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        <p className={styles.chartInstruction}>グラフをドラッグすると範囲を拡大できます。</p>
      </div>
    </div>
  );
};

export default ExerciseChartView;