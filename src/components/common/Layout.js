// src/components/common/Layout.js

import React from 'react';
import Header from './Header';
import { logout } from '../../services/firebaseService';
import styles from '../../styles/App.css';

const Layout = ({ children }) => {
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("ログアウトに失敗しました:", error);
        }
    };

    return (
        <div className="app-container">
            <Header />
            <main className="app-main">
                {children}
            </main>
            <footer className="app-footer">
                <button onClick={handleLogout} className="logout-button">ログアウト</button>
            </footer>
        </div>
    );
};

export default Layout;