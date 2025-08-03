// src/components/dashboard/Dashboard.js

import React, { useState } from 'react';
import Layout from '../common/Layout';
import DailyLogForm from './DailyLogForm';
import Chart from './Chart';
import CalendarView from './CalendarView';
// import WeeklyReport from '../reports/WeeklyReport'; // 不要なため削除
import styles from '../../styles/Dashboard.module.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('log'); // 'log', 'chart', 'calendar'
    const [selectedDate, setSelectedDate] = useState(new Date());

    const renderContent = () => {
        switch (activeTab) {
            case 'chart':
                return <Chart />;
            case 'calendar':
                return <CalendarView selectedDate={selectedDate} setSelectedDate={setSelectedDate} setActiveTab={setActiveTab} />;
            // case 'report': // 不要なため削除
            //     return <WeeklyReport />;
            case 'log':
            default:
                return <DailyLogForm selectedDate={selectedDate} />;
        }
    };
    
    return (
        <Layout>
            <div className={styles.tabContainer}>
                <button onClick={() => setActiveTab('log')} className={`${styles.tabButton} ${activeTab === 'log' ? styles.active : ''}`}>記録</button>
                <button onClick={() => setActiveTab('chart')} className={`${styles.tabButton} ${activeTab === 'chart' ? styles.active : ''}`}>グラフ</button>
                <button onClick={() => setActiveTab('calendar')} className={`${styles.tabButton} ${activeTab === 'calendar' ? styles.active : ''}`}>カレンダー</button>
                {/* レポートタブのボタンを削除 */}
            </div>
            <div className={styles.contentArea}>
                {renderContent()}
            </div>
        </Layout>
    );
};

export default Dashboard;