import React from "react";
import { FaCheck, FaExclamationTriangle, FaTimes } from "react-icons/fa";

export default function AttendanceTab({ players, attendance, setAttendance, isEventHappened }) {
    if (players.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                В этой команде/составе пока нет игроков.<br />
                Для сбора статистики добавьте игроков в разделе «Команда».
            </div>
        );
    }

    return (
        <div>
            {players.map(p => {
                const status = attendance[p.id] !== undefined ? attendance[p.id] : 0;
                const statusArr = [
                    { color: '#28c76f', icon: <FaCheck size={12} />, label: 'Был' },
                    { color: '#fbbc05', icon: <FaExclamationTriangle size={12} />, label: 'Опоздал' },
                    { color: '#ea5455', icon: <FaTimes size={12} />, label: 'Не был' }
                ];
                const currentStatus = statusArr[status];

                return (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: !isEventHappened ? 0.4 : 1 }}>
                        <span style={{ color: '#fff', fontSize: '13px' }}>{p.fullName || `${p.lastName || ''} ${p.firstName || ''}`.trim()}</span>
                        {!isEventHappened ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)', minWidth: '100px', justifyContent: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ОЖИДАНИЕ</span>
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '5px 10px', borderRadius: '10px',
                                    background: `${currentStatus.color}15`,
                                    border: `1px solid ${currentStatus.color}40`,
                                    color: currentStatus.color,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    userSelect: 'none',
                                    minWidth: '100px', justifyContent: 'center'
                                }}
                                onClick={() => setAttendance(prev => ({ ...prev, [p.id]: (status + 1) % 3 }))}
                            >
                                {currentStatus.icon}
                                <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {currentStatus.label}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
