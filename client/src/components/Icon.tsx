interface IconProps {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const Icon = ({ name, filled = false, size = 24, className = '', onClick }: IconProps) => {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      }}
      onClick={onClick}
    >
      {name}
    </span>
  );
};

export default Icon;
