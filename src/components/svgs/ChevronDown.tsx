interface ChevronDownProps {
  className?: string
}

const ChevronDown: React.FC<ChevronDownProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    focusable="false"
    aria-hidden="true"
    width="24"
    height="24"
    className={className ?? ""}
  >
    <path
      fill="currentColor"
      d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
    ></path>
  </svg>
)

export default ChevronDown
