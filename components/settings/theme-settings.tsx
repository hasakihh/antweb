"use client";

import { Check } from "lucide-react";
import {
  APP_THEMES,
  setAppTheme,
  useAppTheme,
} from "@/components/theme/theme-store";
import styles from "./theme-settings.module.css";

export function ThemeSettings() {
  const activeTheme = useAppTheme();

  return (
    <section className={styles.section} aria-labelledby="theme-settings-title">
      <div className={styles.heading}>
        <p>APPEARANCE</p>
        <h2 id="theme-settings-title">界面主题</h2>
      </div>

      <fieldset className={styles.options}>
        <legend className={styles.srOnly}>选择界面主题</legend>
        {APP_THEMES.map((theme) => {
          const isActive = activeTheme === theme.id;

          return (
            <label
              className={styles.option}
              data-theme-preview={theme.id}
              data-active={isActive ? "true" : undefined}
              key={theme.id}
            >
              <input
                className={styles.radio}
                type="radio"
                name="interface-theme"
                value={theme.id}
                checked={isActive}
                onChange={() => setAppTheme(theme.id)}
              />

              <span className={styles.preview} aria-hidden="true">
                <i className={styles.previewRail} />
                <i className={styles.previewOrbit} />
                <i className={styles.previewCard} />
                <i className={styles.previewLine} />
              </span>

              <span className={styles.optionCopy}>
                <span>
                  <strong>{theme.label}</strong>
                  <small>{theme.englishLabel}</small>
                </span>
                <em>{theme.description}</em>
              </span>

              <span className={styles.selectedMark} aria-hidden="true">
                <Check size={12} strokeWidth={2} />
              </span>
            </label>
          );
        })}
      </fieldset>
    </section>
  );
}
