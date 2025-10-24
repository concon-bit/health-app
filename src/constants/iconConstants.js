// src/constants/iconConstants.js

import React from 'react';
import {
  FaGrinStars, FaSmile, FaMeh, FaFrown, FaTired,
  FaRegCheckCircle, FaRegTimesCircle, FaHeadSideVirus, FaGlassMartiniAlt,
  FaBed, FaGrinBeam, FaMehRollingEyes, FaTired as FaTiredStress, FaBeer,
  FaStar // FaPoo の代わりに FaStar をインポート
} from 'react-icons/fa';

export const MOOD_ICONS = {
  '絶好調': <FaGrinStars style={{ color: '#ef476f' }} />,
  '好調':    <FaSmile style={{ color: '#f7a325' }} />,
  '普通':    <FaMeh   style={{ color: '#a3a3a3' }} />,
  '不調':    <FaFrown style={{ color: '#577399' }} />,
  '絶不調':  <FaTired style={{ color: '#2d3142' }} />
};

export const POOP_ICONS = {
  'あり': <FaRegCheckCircle style={{ color: '#8B4513' }} />,
  'なし': <FaRegTimesCircle style={{ color: '#a3a3a3' }} />
};

// ▼▼▼ [修正] 星アイコンの色を黄色に変更 ▼▼▼
export const POOP_CALENDAR_ICON = <FaStar style={{ color: '#FFC107' }} />; // 黄色に変更
// ▲▲▲ [修正] ▲▲▲

export const SYMPTOM_ICONS = {
  'headache': <FaHeadSideVirus />,
  'hangover': <FaGlassMartiniAlt />
};

export const SLEEP_ICONS = {
  'good': <FaBed style={{ color: '#8b5cf6' }} />,
  'normal': <FaBed style={{ color: '#a3a3a3' }} />,
  'bad': <FaBed style={{ color: '#6b7280' }} />
};

export const STRESS_ICONS = {
  'low': <FaGrinBeam style={{ color: '#22c55e' }} />,
  'medium': <FaMehRollingEyes style={{ color: '#f59e0b' }} />,
  'high': <FaTiredStress style={{ color: '#ef4444' }} />
};

export const ALCOHOL_ICONS = {
  'yes': <FaBeer style={{ color: '#f97316' }} />,
  'no': <FaRegTimesCircle style={{ color: '#a3a3a3' }} />
};