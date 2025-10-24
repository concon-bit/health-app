// src/components/dashboard/Dashboard.js

import React from 'react';
import Layout from '../common/Layout';
import { useSelector } from 'react-redux';
import HealthDashboard from '../features/health/HealthDashboard';

const Dashboard = () => {
    const activeMode = useSelector((state) => state.ui.activeMode);

    const renderContent = () => {
        switch (activeMode) {
            case 'health': return <HealthDashboard />;
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