import React from "react";
import styles from "./EventCreateModal.module.css";

export default function TestTab({ players, activeTab, testResults, setTestResults, isEventHappened }) {
    return (
        <div>
            {players.map(p => {
                const name = p.fullName || `${p.lastName || ''} ${p.firstName || ''}`.trim() || p.name || "Без имени";
                return (
                    <div key={p.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        opacity: !isEventHappened ? 0.4 : 1
                    }}>
                        <span style={{ color: '#fff', fontSize: '13px' }}>{name}</span>
                        <input
                            className={styles.input}
                            style={{
                                width: '70px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                color: '#fff',
                                textAlign: 'center',
                                outline: 'none',
                                fontSize: '16px' // Чтобы iOS Safari не приближал экран
                            }}
                            value={testResults[p.id]?.[activeTab] || ''}
                            onChange={e => {
                                // Разрешаем точки, запятые и цифры
                                const val = e.target.value.replace(/[^0-9.,]/g, '');
                                setTestResults(p.id, activeTab, val);
                            }}
                            inputMode="decimal"
                            placeholder="—"
                            disabled={!isEventHappened}
                        />
                    </div>
                );
            })}
        </div>
    );
}