// src/components/features/health/HealthDashboard.js

import React, { createRef } from 'react';
import DailyLogForm from './DailyLogForm';
import Chart from './Chart';
import CalendarView from './CalendarView';
import styles from './HealthDashboard.module.css'; // << 修正
import { useSelector } from 'react-redux';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

const HealthDashboard = () => {
    const activeHealthTab = useSelector((state) => state.ui.activeHealthTab);

    const pages = {
        log: <DailyLogForm />,
        chart: <Chart />,
        calendar: <CalendarView />
    };

    const nodeRef = createRef(null);

    return (
        <>
            <div className={styles.contentArea}>
                <SwitchTransition mode="out-in">
                    <CSSTransition
                        key={activeHealthTab}
                        nodeRef={nodeRef}
                        timeout={300}
                        classNames="fade"
                        unmountOnExit
                    >
                        <div ref={nodeRef} className="page-container">
                            {pages[activeHealthTab]}
                        </div>
                    </CSSTransition>
                </SwitchTransition>
            </div>
        </>
    );
};

export default HealthDashboard;