// src/components/Login.js

import React from 'react';
import { loginWithGoogle } from '../../services/firebaseService';

const Login = () => {
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("ログインに失敗しました:", error);
      alert("ログインに失敗しました。");
    }
  };

  return (
    <div className="app-container login-page">
      <div className="login-container">
        <h1>体調管理アプリ</h1>
        <p>Googleアカウントでログインして、日々の健康を記録・分析しましょう。</p>
        <button onClick={handleLogin} className="login-button">Googleでログイン</button>
      </div>
    </div>
  );
};

export default Login;