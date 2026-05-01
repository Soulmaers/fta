import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

export default function RpeTab({ playerRpe, setPlayerRpe, isEventFinished, teamYear }) {
    const currentYear = new Date().getFullYear();
    const teamYearNum = teamYear ? parseInt(teamYear, 10) : (currentYear - 20); // Если года нет, считаем взрослым (20 лет)
    const age = currentYear - teamYearNum;

    let scaleParams = [];
    let isAdult = false;

    if (age < 7) {
        // Дошкольники (< 7 лет): 3 кружка (3, 6, 10)
        scaleParams = [
            { v: 3, c: '#8bc34a' }, // зеленый
            { v: 6, c: '#fdd835' }, // желтый
            { v: 10, c: '#f44336' } // красный
        ];
    } else if (age >= 7 && age < 10) {
        // От первоклассников до 10 лет (7-9 лет): 5 кружков (2, 4, 6, 8, 10)
        scaleParams = [
            { v: 2, c: '#b2ff59' }, // светло-зеленый
            { v: 4, c: '#cddc39' }, // лимонный (ближе к желтому)
            { v: 6, c: '#fdd835' }, // желтый
            { v: 8, c: '#ff9800' }, // оранжевый
            { v: 10, c: '#f44336' } // красный
        ];
    } else {
        // От 10 лет и старше: 10-балльная шкала
        isAdult = true;
        scaleParams = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => {
            let color = '#8bc34a'; // 1-3 зеленый
            if (v >= 4 && v <= 6) color = '#fdd835'; // 4-6 желтый
            if (v >= 7 && v <= 8) color = '#ff9800'; // 7-8 оранжевый
            if (v >= 9) color = '#f44336'; // 9-10 красный
            return { v, c: color };
        });
    }

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
                            Оценка ИВН доступна после тренировки!
                        </span>
                    </div>
                ) : (
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textAlign: 'center', lineHeight: '1.4' }}>
                        Оцените уровень нагрузки
                    </div>
                )}
            </div>

            <div style={{
                display: 'flex',
                justifyContent: isAdult ? 'space-between' : 'space-evenly',
                marginBottom: '20px',
                pointerEvents: isEventFinished ? 'auto' : 'none'
            }}>
                {scaleParams.map((item) => {
                    const isSelected = playerRpe === item.v;

                    // Стили зависят от возраста: кружки или кнопки
                    const btnStyle = isAdult ? {
                        width: '100%', maxWidth: '30px', height: '36px', borderRadius: '6px',
                        background: isSelected ? item.c : item.c + '30', // '30' adds about 20% opacity (hex alpha)
                        color: isSelected ? '#000' : item.c,
                        border: `2px solid ${item.c}`, // всегда цветная рамка
                        fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
                        boxShadow: isSelected ? `0 0 10px ${item.c}` : 'none',
                        transition: 'all 0.2s ease',
                        opacity: playerRpe > 0 && !isSelected ? 0.5 : 1 // слегка гасим невыбранные, если выбор уже сделан
                    } : {
                        width: '50px', height: '50px', borderRadius: '50%',
                        background: isSelected ? item.c : item.c + '30',
                        color: isSelected ? '#000' : item.c,
                        border: `3px solid ${item.c}`,
                        fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isSelected ? `0 0 15px ${item.c}` : 'none',
                        transition: 'all 0.2s ease',
                        opacity: playerRpe > 0 && !isSelected ? 0.5 : 1
                    };

                    return (
                        <button
                            key={item.v}
                            style={btnStyle}
                            onClick={() => setPlayerRpe(item.v)}
                        >
                            {/* Для детей можно не выводить цифры или вывести их, выведем пока для понимания */}
                            {isAdult ? item.v : ""}
                        </button>
                    );
                })}
            </div>

            {playerRpe > 0 && isAdult && (
                <div style={{
                    textAlign: 'center', fontSize: '13px', lineHeight: '1.4',
                    color: playerRpe <= 1 ? '#b2ff59' : '#f44336'
                }}>
                    <div style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontSize: '14px' }}>
                        {playerRpe === 1 && "Очень легко"}
                        {playerRpe === 10 && "Очень тяжело"}
                    </div>
                </div>
            )}

            {!isAdult && (!playerRpe || playerRpe === 0) && (
                <div style={{
                    textAlign: 'center',
                    marginTop: '56px',
                    fontSize: '12px',
                    color: '#b2ff59',
                    lineHeight: '1.4',
                    fontStyle: 'italic',
                    textShadow: '0 0 10px rgba(178, 255, 89, 0.3)',
                    fontWeight: 500
                }}>
                    <div style={{ marginBottom: '4px' }}>Ты учишься понимать своё тело.</div>
                    <div>Это поможет тебе тренироваться лучше и чувствовать,<br />когда тебе нужно восстановление.</div>
                </div>
            )}
        </div>
    );
}