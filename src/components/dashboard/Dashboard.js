// src/components/dashboard/Dashboard.js

import React from 'react';
import Layout from '../common/Layout';
import { useSelector } from 'react-redux';
import HealthDashboard from '../features/health/HealthDashboard';
import PeriodDashboard from '../features/period/PeriodDashboard';
import MedicationDashboard from '../features/medication/MedicationDashboard';
import ExerciseDashboard from '../features/exercise/ExerciseDashboard';
import ProfileDashboard from '../features/profile/ProfileDashboard'; // <<< [追加]

const Dashboard = () => {
    const activeMode = useSelector((state) => state.ui.activeMode);

    const renderContent = () => {
        switch (activeMode) {
            case 'health': return <HealthDashboard />;
            case 'period': return <PeriodDashboard />;
            case 'medication': return <MedicationDashboard />;
            case 'exercise': return <ExerciseDashboard />;
            case 'profile': return <ProfileDashboard />; // <<< [追加]
            default: return <HealthDashboard />;
        }
    };
    
    return (
        <Layout>
            {renderContent()}
        </Layout>
    );
};

export default Dashboard;