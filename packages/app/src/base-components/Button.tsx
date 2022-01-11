import { useCallback, HTMLAttributes } from "react";
import style from "./Button.scss";

export interface ButtonProps extends HTMLAttributes<HTMLElement> {
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactChild;
}

export default function Button({
  children,
  onClick,
  disabled = false,
  className,
  ...rest
}: ButtonProps) {
  const handleClick = useCallback(
    event => {
      if (disabled) {
        return;
      }

      onClick && onClick(event);
    },
    [onClick]
  );

  return (
    <button
      {...rest}
      className={cn(style.Button, className)}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
