import React, { useEffect, useMemo, useState } from "react";
import styles from "./LineupForm.module.css";
import { FaLayerGroup } from "react-icons/fa6";
import { FaArrowsDownToPeople } from "react-icons/fa6";
export default function LineupForm({
    title,
    submitText,
    initial = { lineupName: "" },
    maxLen = 6,
    busy = false,
    error = "",
    onSubmit,
    onBack,
}) {
    const [lineupName, setLineupName] = useState(initial.lineupName ?? "");

    useEffect(() => {
        console.log(lineupName)
        setLineupName(initial.lineupName ?? "");
    }, [initial]);

    const remaining = useMemo(() => `${lineupName.length} / ${maxLen}`, [lineupName.length, maxLen]);

    const canSubmit = !busy && lineupName.trim().length > 0 && lineupName.trim().length <= maxLen;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        await onSubmit?.({ lineupName: lineupName.trim() });
    };

    console.log(lineupName)
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
                        <FaArrowsDownToPeople className={styles.emblemIcon} />
                    </div>
                </div>

                <div className={styles.formBlock}>
                    <div className={styles.label}>Признак состава *</div>
                    <div className={styles.inputWrap}>
                        <input
                            className={styles.input}
                            placeholder="Напр. АПЛ"
                            value={lineupName}
                            maxLength={maxLen}
                            onChange={(e) => setLineupName(e.target.value)}
                            autoCorrect="off"
                            autoCapitalize="sentences"
                            disabled={busy}
                        />
                        <div className={styles.counter}>{remaining}</div>
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
