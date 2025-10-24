// src/components/common/Layout.js

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MoreMenuModal from './MoreMenuModal';
import { useSelector } from 'react-redux';

const Layout = ({ children }) => {
    const showMoreMenu = useSelector((state) => state.ui.showMoreMenu);

    return (
        <div className="app-container">
            <Header />
            <main className="app-main">
                {children}
            </main>
            <Footer />
            {showMoreMenu && <MoreMenuModal />}
        </div>
    );
};

export default Layout;