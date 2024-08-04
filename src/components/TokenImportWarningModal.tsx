import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
} from "@headlessui/react";
import ExternalLink from "./svgs/ExternalLink";
import Clipboard from "./svgs/Clipboard";
import Alert from "./svgs/Alert";
import Link from "next/link";
import { useAccount } from "wagmi";
import useNetwork from "@/hooks/useNetwork";
import { ChainId } from "@/packages/chain";

interface TokenImportWarningModalProps {
  token: string;
  onConfirm: any;
  open: boolean;
  onClose: any;
  className?: string;
}

const TokenImportWarningModal: React.FC<TokenImportWarningModalProps> = ({
  token,
  onConfirm,
  open,
  onClose,
  className,
}) => {
  const { chainId } = useAccount();
  const { offWalletChainId, setOffWalletChainId } = useNetwork();
  let connectedChainId =
    chainId === ChainId.ARBITRUM_ONE
      ? ChainId.ARBITRUM_ONE
      : chainId === ChainId.SANKO_MAINNET
      ? ChainId.SANKO_MAINNET
      : undefined;
  if (connectedChainId == undefined) {
    connectedChainId = offWalletChainId;
  } else {
    setOffWalletChainId(connectedChainId);
  }

  const ARBISCAN_URL = "https://arbiscan.io/token/";
  const SANKO_EXPLORER_URL = "https://explorer.sanko.xyz/token/";
  const SCAN_URL =
    connectedChainId === ChainId.ARBITRUM_ONE
      ? ARBISCAN_URL
      : SANKO_EXPLORER_URL;

  const onCopy = () => {
    window.navigator.clipboard.writeText(token);
  };

  return (
    <Transition appear show={open}>
      <Dialog
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={() => {}}
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur"
          aria-hidden="true"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-lg rounded-xl bg-white dark:bg-transparent dark:bg-[linear-gradient(180deg,#000000_52%,rgba(47,54,61,0.3)_100%)] border border-black/30 dark:border-white/20 p-6 backdrop-blur-2xl px-10 py-8">
              <div className="flex justify-center">
                <Alert className="w-8 h-8 text-black dark:text-white" />
              </div>
              <h3 className="font-bold text-lg text-black dark:text-white text-center mt-2">
                Buy at your own risk!
              </h3>
              <p className="mt-2 text-sm text-black/70 dark:text-white/75 text-center">
                Anyone can create a token, including creating fake versions of
                existing tokens that claim to represent projects.
                <br />
                <br />
                <strong>
                  If you purchase this token, you may not be able to sell it
                  back or it might be a scam.
                </strong>
              </p>
              <div className="flex overflow-hidden cursor-pointer bg-black/50 dark:bg-white/15 py-1 px-2 rounded-lg text-white mt-3">
                <Link
                  href={`${SCAN_URL}${token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center overflow-hidden hover:brightness-75 transition-all"
                >
                  <span className="overflow-hidden text-ellipsis text-sm">
                    {SCAN_URL}{token}
                  </span>
                  <button className="ml-1">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  className="ml-1 hover:brightness-75 transition-all"
                  onClick={onCopy}
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              </div>
              <button
                className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl mt-4 hover:brightness-75 transition-all"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                I understand
              </button>
              <div className="flex justify-center text-black dark:text-white">
                <button className="text-sm mt-2" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TokenImportWarningModal;
