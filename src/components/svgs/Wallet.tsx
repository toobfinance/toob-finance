interface WalletProps {
  className?: string
}

const Wallet: React.FC<WalletProps> = ({ className }) => (
  <svg
    width="21"
    height="18"
    viewBox="0 0 21 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    focusable="false"
    aria-hidden="true"
    className={className ?? ""}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 3C0 1.34315 1.34315 0 3 0H16C17.6569 0 19 1.34315 19 3V5.17071C20.1652 5.58254 21 6.69378 21 8V10C21 11.3062 20.1652 12.4175 19 12.8293V15C19 16.6569 17.6569 18 16 18H3C1.34315 18 0 16.6569 0 15V3ZM17 3V5H14C12.3431 5 11 6.34315 11 8V10C11 11.6569 12.3431 13 14 13H17V15C17 15.5523 16.5523 16 16 16H3C2.44772 16 2 15.5523 2 15V3C2 2.44772 2.44772 2 3 2H16C16.5523 2 17 2.44772 17 3ZM14 7C13.4477 7 13 7.44772 13 8V10C13 10.5523 13.4477 11 14 11H18C18.5523 11 19 10.5523 19 10V8C19 7.44772 18.5523 7 18 7H14ZM17 9C17 9.55228 16.5523 10 16 10C15.4477 10 15 9.55228 15 9C15 8.44771 15.4477 8 16 8C16.5523 8 17 8.44771 17 9Z"
      fill="currentColor"
    ></path>
  </svg>
)

export default Wallet
