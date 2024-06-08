interface MoonProps {
  className?: string
}

const Moon: React.FC<MoonProps> = ({ className }) => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    height="200px"
    width="200px"
    xmlns="http://www.w3.org/2000/svg"
    className={className ?? ""}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
)

export default Moon
