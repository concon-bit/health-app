// src/components/common/Layout.js

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MoreMenuModal from './MoreMenuModal';
import NotificationManager from './NotificationManager';
import { useSelector } from 'react-redux';

const Layout = ({ children }) => {
    const showMoreMenu = useSelector((state) => state.ui.showMoreMenu);
    const activeMode = useSelector((state) => state.ui.activeMode);

    return (
        <div className="app-container">
            <Header />
            <main className="app-main">
                {children}
            </main>
            <Footer />
            {showMoreMenu && <MoreMenuModal />}
            {/* --- [修正] activeModeが'medication'の時だけ通知マネージャーを表示 --- */}
            {activeMode === 'medication' && <NotificationManager />}
        </div>
    );
};

export default Layout;