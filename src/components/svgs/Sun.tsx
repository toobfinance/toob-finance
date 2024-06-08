interface SunProps {
  className?: string
}

const Sun: React.FC<SunProps> = ({ className }) => (
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
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 3v1"></path>
    <path d="M12 20v1"></path>
    <path d="M3 12h1"></path>
    <path d="M20 12h1"></path>
    <path d="m18.364 5.636-.707.707"></path>
    <path d="m6.343 17.657-.707.707"></path>
    <path d="m5.636 5.636.707.707"></path>
    <path d="m17.657 17.657.707.707"></path>
  </svg>
)

export default Sun
