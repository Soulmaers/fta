import React, { useEffect, useMemo, useState } from "react";
import styles from "./PersonalForm.module.css";
import { FaCamera } from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";
import { FaRegCalendarAlt } from "react-icons/fa";

export default function PersonalForm({
    title,
    submitText,
    initial = { fullName: "", profession: "", birthDate: "", photoUrl: "" },
    maxLen = 60,
    busy = false,
    error = "",
    onPickPhoto,
    onSubmit,
    onBack,
}) {
    const [fullName, setFullName] = useState(initial.fullName ?? "");
    const [profession, setProfession] = useState(initial.profession ?? "");
    const [birthDate, setBirthDate] = useState(
        initial.birthDate ? String(initial.birthDate).slice(0, 10) : ""
    ); // YYYY-MM-DD
    const [photoPreview, setPhotoPreview] = useState(initial.photoUrl ?? "");
    const [pickedFile, setPickedFile] = useState(null);

    // если initial поменялся (edit открыл другого) — обновим поля
    useEffect(() => {
        setFullName(initial.fullName ?? "");
        setProfession(initial.profession ?? "");
        setBirthDate(initial.birthDate ? String(initial.birthDate).slice(0, 10) : "");
        setPhotoPreview(initial.photoUrl ?? "");
        setPickedFile(null);
    }, [initial]);

    // локальное превью файла
    useEffect(() => {
        if (!pickedFile) return;
        const url = URL.createObjectURL(pickedFile);
        setPhotoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [pickedFile]);


    const canSubmit =
        !busy &&
        fullName.trim().length > 0 &&
        fullName.trim().length <= maxLen &&
        profession.trim().length > 0 &&
        String(birthDate).trim().length > 0;

    const handlePick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setPickedFile(f);
        onPickPhoto?.(f);
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;
        await onSubmit?.({
            fullName: fullName.trim(),
            profession: profession.trim(),
            birthDate,          // "YYYY-MM-DD"
            photoUrl: photoPreview, // пока так, как у тебя (preview URL / url)
            file: pickedFile
        });
    };

    const formatRuDate = (iso) => {
        if (!iso) return "";
        const [y, m, d] = iso.split("-");
        if (!y || !m || !d) return "";
        return `${d}.${m}.${y}`;
    };

    return (
        <div className={`${styles.screen} page-enter`}>
            {/* Header */}
            <header className={styles.header}>
                <button className={styles.back} type="button" onClick={onBack}>
                    <span className={styles.backArrow} aria-hidden="true">‹</span>
                    <span className={styles.backText}>Назад</span>
                </button>

                <div className={styles.title}>{title}</div>
                <div className={styles.headerSpacer} />
            </header>

            <main className={styles.content}>
                {/* photo / emblem */}
                <div className={styles.emblemWrap} aria-hidden="true">
                    <div className={styles.emblemBadge}>
                        {photoPreview ? (
                            <>
                                <img className={styles.bgBlur} src={photoPreview} alt="" />
                                <img className={styles.emblemImg} src={photoPreview} alt="" />
                            </>
                        ) : (
                            <IoPeopleSharp className={styles.emblemIcon} />
                        )}
                    </div>
                </div>

                {/* Add photo */}
                <div className={styles.rowCard}>
                    <label className={styles.addPhoto} role="button" tabIndex={0}>
                        <span className={styles.addPhotoLeft}>
                            <span className={styles.camBox} aria-hidden="true">
                                <FaCamera className={styles.camIcon} />
                            </span>
                            <span className={styles.addPhotoText}>Добавить фото</span>
                        </span>

                        <span className={styles.chev} aria-hidden="true">›</span>

                        <input
                            className={styles.fileInput}
                            type="file"
                            accept="image/*"
                            onChange={handlePick}
                            disabled={busy}
                        />
                    </label>
                </div>

                {/* Full name */}
                <div className={styles.formBlock}>
                    <div className={styles.label}>Фамилия Имя Отчество*</div>
                    <div className={styles.inputWrap}>
                        <input
                            className={styles.input}
                            placeholder="Фамилия Имя Отчество"
                            value={fullName}
                            maxLength={maxLen}
                            onChange={(e) => setFullName(e.target.value)}
                            autoCorrect="off"
                            autoCapitalize="words"
                            disabled={busy}
                        />
                    </div>
                </div>

                {/* Birthdate */}
                <div className={styles.formBlock}>
                    <div className={styles.label}>Дата рождения*</div>

                    <div className={styles.inputWrap}>
                        {/* видимый формат ДД.ММ.ГГГГ */}
                        <input
                            className={styles.input}
                            placeholder="ДД.ММ.ГГГГ"
                            value={birthDate ? formatRuDate(birthDate) : ""}
                            readOnly
                            disabled={busy}
                        />

                        {/* иконка + настоящий input date */}
                        <label className={styles.iconBtn} aria-label="Открыть календарь">
                            <FaRegCalendarAlt className={styles.icon} />
                            <input
                                className={styles.dateNativeIcon}
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                disabled={busy}
                            />
                        </label>
                    </div>
                </div>

                {/* Profession */}
                <div className={styles.formBlock}>
                    <div className={styles.label}>Специальность*</div>

                    <div className={styles.selectWrap}>
                        <select
                            className={styles.select}
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            disabled={busy}
                        >
                            <option value="" disabled>Выберите...</option>
                            <option value="Тренер ОФП">Тренер ОФП</option>
                            <option value="Администратор">Администратор</option>
                            <option value="Врач">Врач</option>
                        </select>
                        <span className={styles.selectChevron} aria-hidden="true">▾</span>
                    </div>
                </div>

                {error ? <div className={styles.error}>{error}</div> : null}
            </main>

            <footer className={styles.footer}>
                <button
                    className={`${styles.createBtn} ${!canSubmit ? styles.createBtnDisabled : ""}`}
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                >
                    {submitText}
                </button>
            </footer>
        </div>
    );
}
