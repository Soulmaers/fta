import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCamera, FaSave, FaSignOutAlt, FaCogs, FaRegCalendarAlt } from 'react-icons/fa';
import { IoPerson } from 'react-icons/io5';
import { useAuth } from '../../context/AuthProvider';
import { useTeams } from '../../context/EntityContext';
import styles from './ProfilePage.module.css';
import { apiFetch, uploadFile } from '../../api/http';

const POSITION_LABELS = {
    GK: "Goalkeeper",
    DF: "Defender",
    MF: "Midfielder",
    FW: "Forward"
};

const LEG_LABELS = {
    right: "Правая",
    left: "Левая",
    any: "Обе"
};

export default function ProfilePage() {
    const nav = useNavigate();
    const { auth, logout } = useAuth();
    const { clearData } = useTeams();
    const role = auth?.role;

    const [profile, setProfile] = useState({
        id: null,
        photoUrl: null,
        fullName: 'Загрузка...',
        birthDate: '',
        // Player specific
        number: 0,
        height: 0,
        weight: 0,
        leg: '',
        position: '',
        status: 'READY',
        // Coach specific
        profession: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({ ...profile });
    const [isLoading, setIsLoading] = useState(true);
    const [pickedFile, setPickedFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Update preview when file changes
    useEffect(() => {
        if (!pickedFile) return;
        const url = URL.createObjectURL(pickedFile);
        setPhotoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [pickedFile]);

    useEffect(() => {
        if (!auth?.id) return;
        setIsLoading(true);

        const endpoint = role === 'PLAYER'
            ? `/api/players/profile/${auth.id}`
            : `/api/coaches/profile/${auth.id}`; // Предполагаем такой маршрут для тренеров/менеджеров

        apiFetch(endpoint, { token: auth?.token })
            .then(data => {
                setProfile(data);
                setEditedProfile(data);
                setPhotoPreview(data.photoUrl);
            })
            .catch(err => {
                console.error("Failed to load profile", err);
                if (err.status === 404) {
                    alert("Профиль не найден.");
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [auth, role]);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            let endpoint, body;

            let finalPhotoUrl = isEditing ? editedProfile.photoUrl : profile.photoUrl;

            // Если был выбран новый файл - сначала грузим его
            if (pickedFile) {
                finalPhotoUrl = await uploadFile(pickedFile);
            }

            if (role === 'PLAYER') {
                endpoint = `/api/players/${profile.id}`;
                body = {
                    fullName: editedProfile.fullName,
                    birthDate: editedProfile.birthDate,
                    position: profile.position,
                    leg: profile.leg,
                    height: Number(editedProfile.height),
                    weight: Number(editedProfile.weight),
                    number: Number(editedProfile.number),
                    photoUrl: finalPhotoUrl
                };
            } else {
                // Менеджеры и тренеры
                endpoint = `/api/coaches/${profile.id}`;
                body = {
                    fullName: editedProfile.fullName,
                    birthDate: editedProfile.birthDate,
                    photoUrl: finalPhotoUrl,
                    profession: editedProfile.profession || ''
                };
            }

            const updated = await apiFetch(endpoint, {
                method: 'PUT',
                body,
                token: auth.token
            });

            setProfile(updated);
            setEditedProfile(updated);
            setPhotoPreview(updated.photoUrl);
            setPickedFile(null);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            alert("Ошибка сохранения: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (role !== 'PLAYER') return;
        const prevStatus = profile.status;
        setProfile(prev => ({ ...prev, status: newStatus }));

        try {
            await apiFetch(`/api/players/profile/${auth.id}`, {
                method: 'PUT',
                body: { status: newStatus },
                token: auth.token
            });
        } catch (e) {
            console.error("Status update failed", e);
            setProfile(prev => ({ ...prev, status: prevStatus }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPickedFile(file);
        // Reset value to allow picking same file again
        e.target.value = '';
    };

    const handleLogout = () => {
        logout();
        clearData(); // Очищаем закэшированные данные команд и игроков!
        nav('/auth/login');
    };

    const formatRuDate = (iso) => {
        if (!iso) return "";
        const [y, m, d] = iso.split("-");
        if (!y || !m || !d) return iso;
        return `${d}.${m}.${y}`;
    };

    return (
        <div className={styles.container}>
            {isLoading && (
                <div className={styles.loaderContainer}>
                    <div className={styles.spinner}></div>
                    <div>Загрузка...</div>
                </div>
            )}

            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => nav('/app')}>
                    <FaArrowLeft />
                </button>
                <div className={styles.title}>Мой профиль</div>
                <button className={styles.logoutIconBtn} onClick={handleLogout}>
                    <FaSignOutAlt />
                </button>
            </div>

            <div className={styles.scrollContent}>
                <div className={styles.card}>
                    <div className={styles.avatarSection}>
                        <label className={styles.avatarLabel} style={{ cursor: isEditing ? 'pointer' : 'default' }}>
                            <input
                                type="file"
                                className={styles.fileInput}
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={!isEditing}
                            />
                            <div className={styles.avatar}>
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Avatar" className={styles.avatarImg} />
                                ) : (
                                    <div className={styles.emptyAvatar}><IoPerson /></div>
                                )}
                            </div>
                            {isEditing && !photoPreview && (
                                <div className={styles.avatarOverlay}>
                                    <FaCamera />
                                </div>
                            )}
                        </label>
                    </div>

                    <div className={styles.infoStatic}>
                        {role === 'PLAYER' ? (
                            <>
                                <div className={styles.name}>{profile.fullName}</div>
                                <div className={styles.metaRow}>
                                    <div className={styles.numberInputWrap}>
                                        <span className={styles.numberPrefix}>#</span>
                                        <input
                                            className={isEditing ? styles.inputNumber : styles.numberStatic}
                                            type="number"
                                            value={isEditing ? editedProfile.number : profile.number}
                                            onChange={e => setEditedProfile({ ...editedProfile, number: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <span className={styles.position}>{POSITION_LABELS[profile.position]}</span>
                                </div>
                            </>
                        ) : (
                            <div className={styles.name}>
                                {(isEditing ? editedProfile.fullName : profile.fullName) && (isEditing ? editedProfile.fullName : profile.fullName) !== 'Загрузка...'
                                    ? (isEditing ? editedProfile.fullName : profile.fullName)
                                    : ""}
                            </div>
                        )}
                    </div>
                </div>

                {role === 'PLAYER' && (
                    <>
                        <div className={styles.sectionTitle}>Текущий статус</div>
                        <div className={styles.statusGrid}>
                            {['READY', 'SICK', 'INJURED'].map(s => {
                                const isActive = profile.status === s;
                                return (
                                    <button
                                        key={s}
                                        className={styles.statusBtn}
                                        style={{
                                            borderColor: isActive ? '#8bc34a' : 'rgba(255,255,255,0.1)',
                                            boxShadow: isActive ? '0 0 15px #8bc34a, inset 0 0 5px #8bc34a' : 'none',
                                            background: isActive ? 'rgba(139, 195, 74, 0.2)' : 'transparent',
                                            color: isActive ? '#8bc34a' : '#888'
                                        }}
                                        onClick={() => handleStatusChange(s)}
                                    >
                                        {{ READY: 'Готов', SICK: 'Болен', INJURED: 'Травма' }[s]}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className={styles.statsCard}>
                    {role === 'PLAYER' && (
                        <>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Рост (см)</span>
                                <input
                                    className={styles.inputSmall}
                                    type="number"
                                    value={isEditing ? editedProfile.height : profile.height}
                                    onChange={e => setEditedProfile({ ...editedProfile, height: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Вес (кг)</span>
                                <input
                                    className={styles.inputSmall}
                                    type="number"
                                    value={isEditing ? editedProfile.weight : profile.weight}
                                    onChange={e => setEditedProfile({ ...editedProfile, weight: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Ведущая нога</span>
                                <div className={styles.selectWrap} style={{ width: '120px' }}>
                                    <select
                                        className={styles.select}
                                        value={isEditing ? editedProfile.leg : profile.leg}
                                        onChange={e => setEditedProfile({ ...editedProfile, leg: e.target.value })}
                                        disabled={!isEditing}
                                    >
                                        <option value="right">Правая</option>
                                        <option value="left">Левая</option>
                                        <option value="any">Обе</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {role !== 'PLAYER' && (
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>ФИО</span>
                            <input
                                className={styles.profileInput}
                                value={isEditing ? editedProfile.fullName : (profile.fullName === 'Загрузка...' ? '' : profile.fullName)}
                                onChange={e => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                                disabled={!isEditing}
                                placeholder={role === 'MANAGER' ? "укажите ФИО" : "Фамилия Имя Отчество"}
                            />
                        </div>
                    )}

                    {role === 'COACH' && (
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>Специализация</span>
                            <div className={styles.selectWrap}>
                                <select
                                    className={styles.select}
                                    value={isEditing ? editedProfile.profession : (profile.profession || "")}
                                    onChange={e => setEditedProfile({ ...editedProfile, profession: e.target.value })}
                                    disabled={!isEditing}
                                    style={{ textAlign: 'right', paddingRight: isEditing ? '25px' : '10px' }}
                                >
                                    <option value="" disabled>Не указана</option>
                                    <option value="Тренер ОФП">Тренер ОФП</option>
                                    <option value="Администратор">Администратор</option>
                                    <option value="Врач">Врач</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className={styles.statRow}>
                        <span className={styles.statLabel}>Дата рождения</span>
                        <div className={styles.dateInputWrap}>
                            <input
                                className={styles.profileInput}
                                style={{ paddingRight: isEditing ? '40px' : '12px' }}
                                value={isEditing
                                    ? formatRuDate(editedProfile.birthDate ? String(editedProfile.birthDate).slice(0, 10) : "")
                                    : formatRuDate(profile.birthDate ? String(profile.birthDate).slice(0, 10) : "")
                                }
                                readOnly
                                disabled={!isEditing}
                                placeholder="ДД.ММ.ГГГГ"
                            />
                            {isEditing && (
                                <label className={styles.calendarIconBtn}>
                                    <FaRegCalendarAlt />
                                    <input
                                        type="date"
                                        className={styles.hiddenDateInput}
                                        value={editedProfile.birthDate ? String(editedProfile.birthDate).slice(0, 10) : ""}
                                        onChange={e => setEditedProfile({ ...editedProfile, birthDate: e.target.value })}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {role === 'MANAGER' && (
                    <button className={styles.configLink} onClick={() => nav('/config')}>
                        <FaCogs /> Перейти в конфигуратор
                    </button>
                )}
            </div>

            <div className={styles.actions}>
                {isEditing ? (
                    <div className={styles.actionsRow}>
                        <button className={styles.cancelBtn} onClick={() => {
                            setIsEditing(false);
                            setPhotoPreview(profile.photoUrl);
                            setPickedFile(null);
                        }}>
                            Отмена
                        </button>
                        <button className={styles.saveBtn} onClick={handleSave} style={{
                            background: 'rgba(139, 195, 74, 0.2)',
                            border: '1px solid #8bc34a',
                            boxShadow: '0 0 15px #8bc34a',
                            color: '#8bc34a',
                            flex: 2
                        }}>
                            Сохранить
                        </button>
                    </div>
                ) : (
                    <button className={styles.editBtn} onClick={() => {
                        setEditedProfile({ ...profile });
                        setPickedFile(null);
                        setIsEditing(true);
                    }}>
                        Редактировать
                    </button>
                )}
            </div>
        </div>
    );
}
