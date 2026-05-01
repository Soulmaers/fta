import React, { useEffect, useState } from "react";
import styles from "./PlayerForm.module.css";
import { FaChevronDown } from "react-icons/fa";
import { IoPerson } from "react-icons/io5"; // Changed icon to be more generic person
import { FaRegCalendarAlt } from "react-icons/fa";

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

export default function PlayerForm({
    title,
    submitText,
    initial = {
        fullName: "",
        birthDate: "",
        weight: "",
        height: "",
        number: "",
        position: "",
        leg: "",
        photoUrl: ""
    },
    maxLen = 60,
    busy = false,
    error = "",
    onPickPhoto,
    onSubmit,
    onBack,
}) {
    // Form State
    const [fullName, setFullName] = useState(initial.fullName ?? "");
    const [birthDate, setBirthDate] = useState(initial.birthDate ? String(initial.birthDate).slice(0, 10) : "");
    const [weight, setWeight] = useState(initial.weight ?? "");
    const [height, setHeight] = useState(initial.height ?? "");
    const [number, setNumber] = useState(initial.number ?? "");
    const [position, setPosition] = useState(initial.position ?? "");
    const [leg, setFoot] = useState(initial.leg ?? "");
    const [photoPreview, setPhotoPreview] = useState(initial.photoUrl ?? "");
    const [pickedFile, setPickedFile] = useState(null);

    // Update state when initial props change
    useEffect(() => {
        setFullName(initial.fullName ?? "");
        setBirthDate(initial.birthDate ? String(initial.birthDate).slice(0, 10) : "");
        setWeight(initial.weight ?? "");
        setHeight(initial.height ?? "");
        setNumber(initial.number ?? "");
        setPosition(initial.position ?? "");
        setFoot(initial.leg ?? "");
        setPhotoPreview(initial.photoUrl ?? "");
        setPickedFile(null);
    }, [initial]);

    // Preview photo
    useEffect(() => {
        if (!pickedFile) return;
        const url = URL.createObjectURL(pickedFile);
        setPhotoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [pickedFile]);

    const handlePick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setPickedFile(f);
        onPickPhoto?.(f);
    };

    const canSubmit = !busy && fullName.trim().length > 0 && birthDate.length > 0;

    const handleSubmit = async () => {
        if (!canSubmit) return;

        const cleanNumber = (val) => {
            if (val === "" || val === null || val === undefined) return null;
            const n = Number(val);
            return isNaN(n) ? null : n;
        };

        const payload = {
            fullName: fullName.trim(),
            birthDate: birthDate || null,
            weight: cleanNumber(weight),
            height: cleanNumber(height),
            number: cleanNumber(number),
            position: position || null,
            leg: leg || null,
            photoUrl: photoPreview || null,
            file: pickedFile,
        };

        await onSubmit?.(payload);
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

                {/* Top Section: Avatar + 2 Selectors (Custom Design) */}
                <div className={styles.topProfileSection}>

                    {/* Avatar Circle */}
                    <div className={styles.avatarContainer}>
                        <label className={styles.avatarLabel}>
                            <input
                                className={styles.fileInput}
                                type="file"
                                accept="image/*"
                                onChange={handlePick}
                                disabled={busy}
                            />
                            <div className={styles.avatarCircle}>
                                {photoPreview ? (
                                    <img className={styles.avatarImg} src={photoPreview} alt="Player" />
                                ) : (
                                    <IoPerson className={styles.avatarIcon} />
                                )}
                            </div>
                        </label>
                    </div>

                    {/* Right Side: Selectors coming out of avatar */}
                    <div className={styles.selectorsColumn}>

                        {/* Position Selector */}
                        <div className={styles.ribbonSelect}>
                            <span className={styles.ribbonLabel}>
                                {POSITION_LABELS[position] || "Позиция"}
                            </span>
                            <FaChevronDown className={styles.ribbonArrow} />
                            <select
                                className={styles.hiddenSelect}
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                disabled={busy}
                            >
                                <option value="" disabled>Позиция</option>
                                <option value="GK">Goalkeeper</option>
                                <option value="DF">Defender</option>
                                <option value="MF">Midfielder</option>
                                <option value="FW">Forward</option>
                            </select>
                        </div>

                        {/* Foot Selector */}
                        <div className={styles.ribbonSelect}>
                            <span className={styles.ribbonLabel}>
                                {LEG_LABELS[leg] || "Ведущая нога"}
                            </span>
                            <FaChevronDown className={styles.ribbonArrow} />
                            <select
                                className={styles.hiddenSelect}
                                value={leg}
                                onChange={(e) => setFoot(e.target.value)}
                                disabled={busy}
                            >
                                <option value="" disabled>Ведущая нога</option>
                                <option value="right">Правая</option>
                                <option value="left">Левая</option>
                                <option value="any">Обе</option>
                            </select>
                        </div>

                    </div>
                </div>

                {/* Standard Form Fields (Reverted to PersonalForm style) */}

                {/* Full Name */}
                <div className={styles.formBlock}>
                    <div className={styles.label}>Фамилия Имя Отчество*</div>
                    <div className={styles.inputWrap}>
                        <input
                            className={styles.input}
                            placeholder="Иванов Иван Иванович"
                            value={fullName}
                            maxLength={maxLen}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={busy}
                        />
                    </div>
                </div>

                {/* Birth Date */}
                <div className={styles.formBlock}>
                    <div className={styles.label}>Дата рождения:*</div>
                    <div className={styles.inputWrap}>
                        <input
                            className={styles.input}
                            placeholder="ДД.ММ.ГГГГ"
                            value={birthDate ? formatRuDate(birthDate) : ""}
                            readOnly
                            disabled={busy}
                        />
                        <label className={styles.iconBtn}>
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

                {/* Physical Stats */}
                <div className={styles.rowSection}>
                    {/* Weight */}
                    <div className={styles.formBlockHalf}>
                        <div className={styles.label}>Вес:</div>
                        <div className={styles.inputWrap}>
                            <input
                                className={styles.input}
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                disabled={busy}
                            />
                            <span className={styles.suffix}>кг</span>
                        </div>
                    </div>

                    {/* Height */}
                    <div className={styles.formBlockHalf}>
                        <div className={styles.label}>Рост:</div>
                        <div className={styles.inputWrap}>
                            <input
                                className={styles.input}
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                disabled={busy}
                            />
                            <span className={styles.suffix}>см</span>
                        </div>
                    </div>
                </div>

                {/* Number */}
                <div className={styles.formBlock}>
                    <div className={styles.label}>Игровой номер:</div>
                    <div className={styles.inputWrap}>
                        <input
                            className={styles.input}
                            type="number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            disabled={busy}
                        />
                        <span className={styles.suffix}>#</span>
                    </div>
                </div>

                {error ? <div className={styles.error}>{error}</div> : null}
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <button
                    className={`${styles.createBtn} ${!canSubmit ? styles.createBtnDisabled : ""}`}
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                >
                    {submitText}
                </button>
            </footer>
        </div>
    );
}
