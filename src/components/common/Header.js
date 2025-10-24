// src/components/common/Header.js

import React from 'react';
import { FaHome, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveMode, setActiveHealthTab, setSelectedDate } from '../../redux/uiSlice';

const Header = () => {
    const dispatch = useDispatch();
    const activeMode = useSelector((state) => state.ui.activeMode);

    const handleHomeClick = () => {
        dispatch(setSelectedDate(new Date().toISOString()));
        dispatch(setActiveMode('health'));
        dispatch(setActiveHealthTab('log'));
    };

    const handleChartClick = () => {
        dispatch(setActiveMode('health'));
        dispatch(setActiveHealthTab('chart'));
    };

    const handleHealthCalendarClick = () => {
        dispatch(setActiveMode('health'));
        dispatch(setActiveHealthTab('calendar'));
    };

    return (
        <header className="app-header">
            <div className="header-icon-button-left">
                <button className="header-icon-button" onClick={handleHomeClick}>
                    <FaHome />
                </button>
            </div>

            <div className="header-title-container">
                <h1>Wellnote</h1>
            </div>

            <div className="header-icon-group-right">
                {activeMode === 'health' && (
                    <>
                        <button className="header-icon-button" onClick={handleChartClick}>
                            <FaChartLine />
                        </button>
                        <button className="header-icon-button" onClick={handleHealthCalendarClick}>
                            <FaCalendarAlt />
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;