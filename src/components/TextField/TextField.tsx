import { ChangeEvent, useState } from "react";
import styles from "./TextField.module.css";

interface TextFieldProps {
  id: string;
  label: string;
  type: "text" | "url" | "password" | "email" | "number";
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  assistiveText?: string;
  errorText?: string; // Add this line
}

export default function TextField({
  id,
  label,
  type,
  value,
  onChange,
  leadingIcon,
  trailingIcon,
  assistiveText,
  errorText,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isError = !!errorText;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <>
      <div className={styles.wrapper}>
        <div className={`${styles.textField} ${isError ? styles.error : ""}`}>
          {leadingIcon && <div className={styles.icon}>{leadingIcon}</div>}
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={styles.input}
            placeholder=" "
          />
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
          {trailingIcon && <div className={styles.icon}>{trailingIcon}</div>}
        </div>
        <div
          className={`${styles.assistiveText} ${isError ? styles.error : ""}`}
        >
          {isError ? errorText : assistiveText}
        </div>
      </div>
    </>
  );
}
