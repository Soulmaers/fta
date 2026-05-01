import React, { useMemo } from "react";
import { FaCheck } from "react-icons/fa";

export default function BioStatusTab({ players, statuses }) {
    const statusMap = useMemo(() => {
        const m = new Map();
        (statuses || []).forEach(s => m.set(String(s.playerId), !!s.hasBio));
        return m;
    }, [statuses]);

    if (!players || players.length === 0) {
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
                const fullName = p.fullName || `${p.lastName || ''} ${p.firstName || ''}`.trim();
                const hasBio = statusMap.get(String(p.id)) === true;

                return (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#fff', fontSize: '13px' }}>{fullName}</span>

                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 999,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: hasBio ? 'rgba(139, 195, 74, 0.15)' : 'rgba(139, 0, 0, 0.12)',
                                border: hasBio ? '1px solid rgba(139, 195, 74, 0.6)' : '1px solid rgba(139, 0, 0, 0.55)'
                            }}
                            title={hasBio ? 'Замер выполнен' : 'Нет замера'}
                        >
                            {hasBio ? <FaCheck size={12} color="#8bc34a" /> : <span style={{ width: 8, height: 8, borderRadius: 999, background: '#8b0000', opacity: 0.9 }} />}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

