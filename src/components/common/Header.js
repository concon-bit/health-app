// src/components/common/Header.js

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
// import styles from '../../styles/App.css'; // 不要なため削除

const Header = () => {
    const { currentUser } = useAuth();

    return (
        <header className="app-header">
            <div className="header-title-container">
                <h1>体調管理</h1>
            </div>
            {currentUser && (
                <div className="user-info">
                    <img src={currentUser.photoURL} alt={currentUser.displayName} />
                </div>
            )}
        </header>
    );
};

export default Header;