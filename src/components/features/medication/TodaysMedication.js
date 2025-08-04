// src/components/features/medication/TodaysMedication.js

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logDose } from '../../../redux/medicationSlice';
import { format } from 'date-fns';
import styles from './TodaysMedication.module.css';
import { FaCheckCircle, FaTimesCircle, FaRegCircle } from 'react-icons/fa';

const TodaysMedication = () => {
    const dispatch = useDispatch();
    const { items: medications, history, historyLoading } = useSelector((state) => state.medications);
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const getDoseStatus = (medicationId, timing) => {
        const record = history.find(h => 
            h.medicationId === medicationId && h.timing === timing && h.date === todayStr
        );
        return record ? record.status : 'pending';
    };

    const handleDoseChange = (medicationId, timing, currentStatus) => {
        let nextStatus;
        if (currentStatus === 'pending') {
            nextStatus = 'taken';
        } else if (currentStatus === 'taken') {
            nextStatus = 'skipped';
        } else {
            nextStatus = 'pending';
        }
        dispatch(logDose({ medicationId, date: todayStr, timing, status: nextStatus }));
    };

    const renderMedicationDoses = (timing, timingLabel) => {
        const medsForTiming = medications.filter(med => med.timings && med.timings.includes(timing));
        if (medsForTiming.length === 0) return null;

        return (
            <div className={styles.timingGroup}>
                <h4>{timingLabel}</h4>
                {medsForTiming.map(med => {
                    const status = getDoseStatus(med.id, timing);
                    return (
                        <div key={`${med.id}-${timing}`} className={styles.doseItem}>
                            <button 
                                className={styles.statusButton} 
                                onClick={() => handleDoseChange(med.id, timing, status)}
                                title={`状態変更: ${status}`}
                            >
                                {status === 'taken' && <FaCheckCircle className={`${styles.statusIcon} ${styles.taken}`} />}
                                {status === 'skipped' && <FaTimesCircle className={`${styles.statusIcon} ${styles.skipped}`} />}
                                {status === 'pending' && <FaRegCircle className={`${styles.statusIcon} ${styles.pending}`} />}
                                
                                <div className={styles.medInfo}>
                                    <span className={styles.medName}>{med.name}</span>
                                    <span className={styles.medQuantity}>{med.quantity} {med.unit}</span>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    const allTimings = ['morning', 'noon', 'night', 'before_bed'];
    const hasAnyMedsForToday = medications.some(med => med.timings && allTimings.some(t => med.timings.includes(t)));

    if (!hasAnyMedsForToday) {
        return null;
    }
    if (historyLoading === 'pending') {
        return <p>今日の服薬リストを読み込み中...</p>
    }

    return (
        <div className={styles.container}>
            <h3>今日の服薬</h3>
            {renderMedicationDoses('morning', '朝')}
            {renderMedicationDoses('noon', '昼')}
            {renderMedicationDoses('night', '夜')}
            {renderMedicationDoses('before_bed', '就寝前')}
        </div>
    );
};

export default TodaysMedication;