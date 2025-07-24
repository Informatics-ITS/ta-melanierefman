interface ToggleProps {
  pressed?: boolean;
  onPressedChange: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Toggle({ pressed = false, onPressedChange, children, className }: ToggleProps) {
  return (
    <button
      onClick={onPressedChange}
      className={`px-2 py-1 ${className} ${pressed ? "text-primary" : "text-typo"}`}
    >
      {children}
    </button>
  );
}