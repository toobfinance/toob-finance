interface TwoLineProps {
  className?: string
}

const TwoLine: React.FC<TwoLineProps> = ({ className }) => (
  <svg
    width="16"
    height="10"
    viewBox="0 0 16 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    focusable="false"
    aria-hidden="true"
    className={className ?? ""}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 4C3.10457 4 4 3.10457 4 2C4 0.895431 3.10457 0 2 0C0.895431 0 0 0.895431 0 2C0 3.10457 0.895431 4 2 4ZM14 10C15.1046 10 16 9.10457 16 8C16 6.89543 15.1046 6 14 6C12.8954 6 12 6.89543 12 8C12 9.10457 12.8954 10 14 10ZM6 2C6 1.44772 6.44772 1 7 1H15C15.5523 1 16 1.44772 16 2C16 2.55228 15.5523 3 15 3H7C6.44772 3 6 2.55228 6 2ZM1 7C0.447715 7 0 7.44772 0 8C0 8.55229 0.447715 9 1 9H9C9.55229 9 10 8.55229 10 8C10 7.44772 9.55228 7 9 7H1Z"
      fill="currentColor"
    ></path>
  </svg>
)

export default TwoLine
