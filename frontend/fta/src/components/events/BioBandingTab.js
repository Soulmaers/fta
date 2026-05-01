import React from "react";
import { FaQuestionCircle, FaWeightHanging, FaRulerVertical, FaChair, FaMale, FaFemale, FaExclamationTriangle } from "react-icons/fa";
import styles from "./EventCreateModal.module.css";

export default function BioBandingTab({
    isEventFinished, bioWeight, setBioWeight, bioHeight, setBioHeight,
    bioSittingHeight, setBioSittingHeight, bioFatherHeight, setBioFatherHeight,
    bioMotherHeight, setBioMotherHeight, lastBioData, currentPlayerData, setShowHelpModal,
    editingEventId, eventDate
}) {
    // Редактировать можно если:
    // 1. Замеров еще нет
    // 2. Это тот же самый замер, который был последним
    // 3. Дата текущего события позже или равна дате последнего замера
    const lastDate = lastBioData?.event?.date || lastBioData?.date || "0000-00-00";
    const isLatest = !lastBioData ||
        (lastBioData.event?.id || lastBioData.eventId) === editingEventId ||
        (eventDate >= lastDate);

    const canEdit = isEventFinished && isLatest;

    // Placeholders: use last measurement or profile data as fallback
    const weightPlaceholder = lastBioData?.weight || currentPlayerData?.weight || "0";
    const heightPlaceholder = lastBioData?.height || currentPlayerData?.height || "0";
    const sittingPlaceholder = lastBioData?.sittingHeight || "Замерьте сидя";

    return (
        <div style={{ padding: '16px 0', opacity: isEventFinished ? 1 : 0.5 }}>
            <div style={{ marginBottom: '20px' }}>
                {!isEventFinished ? (
                    <div style={{
                        background: 'rgba(255, 152, 0, 0.08)',
                        border: '1px solid rgba(255, 152, 0, 0.25)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}>
                        <FaExclamationTriangle style={{ color: '#ffa726' }} size={16} />
                        <span style={{ color: '#ffa726', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Замеры будут доступны в день события
                        </span>
                    </div>
                ) : !isLatest ? (
                    <div style={{
                        background: 'rgba(255, 152, 0, 0.08)',
                        border: '1px solid rgba(255, 152, 0, 0.4)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 12px rgba(255, 152, 0, 0.05)'
                    }}>
                        <FaExclamationTriangle style={{ color: '#ffa726', flexShrink: 0 }} size={18} />
                        <span style={{ color: '#ffa726', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', lineHeight: '1.4' }}>
                            Редактировать можно только последний замер
                        </span>
                    </div>
                ) : (
                    null
                )}
            </div>

            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px',
                background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
                <div className={styles.field}>
                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>ВЕС (КГ)</span>
                        <FaQuestionCircle onClick={() => setShowHelpModal('weight')} style={{ cursor: 'pointer', color: '#8bc34a', opacity: 0.8 }} size={12} />
                    </label>
                    <div style={{ position: 'relative' }}>
                        <FaWeightHanging style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8bc34a', opacity: 0.8 }} size={14} />
                        <input
                            type="number"
                            className={styles.input}
                            style={{ paddingLeft: '38px', background: 'rgba(0,0,0,0.3)', height: '48px', border: '1px solid rgba(139, 195, 74, 0.2)' }}
                            value={bioWeight}
                            onChange={e => setBioWeight(e.target.value)}
                            placeholder={weightPlaceholder}
                            disabled={!canEdit}
                        />
                    </div>
                </div>
                <div className={styles.field}>
                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>РОСТ (СМ)</span>
                        <FaQuestionCircle onClick={() => setShowHelpModal('height')} style={{ cursor: 'pointer', color: '#8bc34a', opacity: 0.8 }} size={12} />
                    </label>
                    <div style={{ position: 'relative' }}>
                        <FaRulerVertical style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8bc34a', opacity: 0.8 }} size={14} />
                        <input
                            type="number"
                            className={styles.input}
                            style={{ paddingLeft: '38px', background: 'rgba(0,0,0,0.3)', height: '48px', border: '1px solid rgba(139, 195, 74, 0.2)' }}
                            value={bioHeight}
                            onChange={e => setBioHeight(e.target.value)}
                            placeholder={heightPlaceholder}
                            disabled={!canEdit}
                        />
                    </div>
                </div>
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
                <div className={styles.field}>
                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>РОСТ СИДЯ (СМ)</span>
                        <FaQuestionCircle onClick={() => setShowHelpModal('sittingHeight')} style={{ cursor: 'pointer', color: '#8bc34a', opacity: 0.8 }} size={12} />
                    </label>
                    <div style={{ position: 'relative' }}>
                        <FaChair style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8bc34a', opacity: 0.8 }} size={14} />
                        <input
                            type="number"
                            className={styles.input}
                            style={{ paddingLeft: '38px', background: 'rgba(0,0,0,0.3)', height: '48px', border: '1px solid rgba(139, 195, 74, 0.2)' }}
                            value={bioSittingHeight}
                            onChange={e => setBioSittingHeight(e.target.value)}
                            placeholder={sittingPlaceholder}
                            disabled={!canEdit}
                        />
                    </div>
                </div>
            </div>

            <div style={{
                background: 'rgba(139, 195, 74, 0.08)', padding: '16px', borderRadius: '20px', border: '1px dashed rgba(139, 195, 74, 0.3)',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'
            }}>
                <div className={styles.field}>
                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 'bold' }}>РОСТ ПАПЫ (СМ)</label>
                    <div style={{ position: 'relative' }}>
                        <FaMale style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={14} />
                        <input
                            type="number"
                            className={styles.input}
                            style={{ paddingLeft: '38px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                            value={bioFatherHeight}
                            onChange={e => setBioFatherHeight(e.target.value)}
                            placeholder="0"
                            readOnly={currentPlayerData?.fatherHeight > 0}
                            disabled={!canEdit && !(currentPlayerData?.fatherHeight > 0)}
                        />
                    </div>
                </div>
                <div className={styles.field}>
                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 'bold' }}>РОСТ МАМЫ (СМ)</label>
                    <div style={{ position: 'relative' }}>
                        <FaFemale style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={14} />
                        <input
                            type="number"
                            className={styles.input}
                            style={{ paddingLeft: '38px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                            value={bioMotherHeight}
                            onChange={e => setBioMotherHeight(e.target.value)}
                            placeholder="0"
                            readOnly={currentPlayerData?.motherHeight > 0}
                            disabled={!canEdit && !(currentPlayerData?.motherHeight > 0)}
                        />
                    </div>
                </div>
            </div>

            {currentPlayerData?.fatherHeight > 0 && (
                <div style={{ fontSize: '10px', color: '#8bc34a', marginTop: '12px', textAlign: 'center', opacity: 0.8, letterSpacing: '0.8px', fontWeight: 'bold' }}>
                    ✓ ДАННЫЕ РОДИТЕЛЕЙ ПОДТВЕРЖДЕНЫ ИЗ ПРОФИЛЯ
                </div>
            )}
        </div>
    );
}