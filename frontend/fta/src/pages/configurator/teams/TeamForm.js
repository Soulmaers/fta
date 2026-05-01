import React, { useEffect, useMemo, useState } from "react";
import styles from "./TeamForm.module.css";
import { FaCamera } from "react-icons/fa";
import { FaPeopleRoof } from "react-icons/fa6";

export default function TeamForm({
    title,
    submitText,
    initial = { nameTeam: "", foundedYear: "", logoUrl: "" },
    maxLen = 30,
    busy = false,
    error = "",
    onPickLogo,     // (file) => void (необязательно)
    onSubmit,       // ({ nameTeam, foundedYear }) => void/Promise
    onBack,         // () => void
}) {
    const [name, setName] = useState(initial.nameTeam ?? "");
    const [foundedYear, setFoundedYear] = useState(initial.foundedYear ?? "");
    const [logoPreview, setLogoPreview] = useState(initial.logoUrl ?? "");
    const [pickedFile, setPickedFile] = useState(null);

    console.log(foundedYear)
    // если initial поменялся (пришли другие данные) — обновим поля
    useEffect(() => {
        setName(initial.nameTeam ?? "");
        setFoundedYear(initial.foundedYear ?? "");
        setLogoPreview(initial.logoUrl ?? "");
        setPickedFile(null);
    }, [initial]);

    // локальное превью файла (только UI)
    useEffect(() => {
        if (!pickedFile) return;
        const url = URL.createObjectURL(pickedFile);
        setLogoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [pickedFile]);

    const remaining = useMemo(() => `${name.length} / ${maxLen}`, [name.length, maxLen]);

    const canSubmit =
        !busy &&
        name.trim().length > 0 &&
        name.trim().length <= maxLen &&
        String(foundedYear).trim().length > 0;

    const handlePick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setPickedFile(f);
        onPickLogo?.(f);
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;
        await onSubmit?.({
            nameTeam: name.trim(),
            foundedYear: foundedYear,
            logoUrl: logoPreview,
            file: pickedFile
        });
    };

    return (
        <div className={`${styles.screen} page-enter`}>
            <header className={styles.header}>
                <button className={styles.back} type="button" onClick={onBack}>
                    <span className={styles.backArrow} aria-hidden="true">‹</span>
                    <span className={styles.backText}>Назад</span>
                </button>

                <div className={styles.title}>{title}</div>
                <div className={styles.headerSpacer} />
            </header>

            <main className={styles.content}>
                <div className={styles.emblemWrap} aria-hidden="true">
                    <div className={styles.emblemBadge}>
                        {logoPreview ? (
                            <img className={styles.emblemImg} src={logoPreview} alt="" />
                        ) : (
                            <FaPeopleRoof className={styles.emblemIcon} />
                        )}
                    </div>
                </div>

                <div className={styles.rowCard}>
                    <label className={styles.addEmblem} role="button" tabIndex={0}>
                        <span className={styles.addEmblemLeft}>
                            <span className={styles.camBox} aria-hidden="true">
                                <FaCamera className={styles.camIcon} />
                            </span>
                            <span className={styles.addEmblemText}>Добавить эмблему</span>
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

                <div className={styles.formBlock}>
                    <div className={styles.label}>Название команды</div>
                    <div className={styles.inputWrap}>
                        <input
                            className={styles.input}
                            placeholder="Название команды"
                            value={name}
                            maxLength={maxLen}
                            onChange={(e) => setName(e.target.value)}
                            autoCorrect="off"
                            autoCapitalize="sentences"
                            disabled={busy}
                        />
                        <div className={styles.counter}>{remaining}</div>
                    </div>
                </div>

                <div className={styles.formBlock}>
                    <div className={styles.label}>Возрастная категория</div>
                    <div className={styles.inputWrap}>
                        <input
                            className={styles.input}
                            placeholder="Возрастная категория"
                            value={foundedYear}
                            maxLength={maxLen}
                            onChange={(e) => setFoundedYear(e.target.value)}
                            autoCorrect="off"
                            autoCapitalize="sentences"
                            disabled={busy}
                            inputMode="numeric" // Показывает цифровую клавиатуру
                            pattern="[0-9]*"
                        />
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
