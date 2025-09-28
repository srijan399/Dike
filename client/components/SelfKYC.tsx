import { useEffect, useState } from "react";
import { countries, SelfQRcodeWrapper } from "@selfxyz/qrcode";
import { SelfAppBuilder } from "@selfxyz/qrcode";
import { useAccount } from "wagmi";
import { SELF_CONFIG, FRONTEND_DISCLOSURES } from "@/lib/self-config";

export default function Verify() {
  const [selfApp, setSelfApp] = useState<any | null>(null);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!address || !isConnected) {
      setSelfApp(null);
      return;
    }

    // Ensure address is properly formatted
    const formattedAddress = address.startsWith("0x")
      ? address
      : `0x${address}`;

    console.log("Original address:", address);
    console.log("Formatted address:", formattedAddress);

    // Validate address format (should be 42 characters including 0x)
    if (formattedAddress.length !== 42) {
      console.error(
        "Invalid address format:",
        formattedAddress,
        "Length:",
        formattedAddress.length
      );
      setSelfApp(null);
      return;
    }

    const app = new SelfAppBuilder({
      version: 2,
      appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Dike",
      scope: SELF_CONFIG.SCOPE,
      endpoint: SELF_CONFIG.ENDPOINT,
      logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
      userId: formattedAddress.toLowerCase(),
      endpointType: "staging_celo",
      userIdType: SELF_CONFIG.USER_ID_TYPE,
      userDefinedData: "Hello from the Docs!!",
      disclosures: FRONTEND_DISCLOSURES,
    }).build();

    setSelfApp(app);
  }, [address, isConnected]);

  const handleSuccessfulVerification = () => {
    console.log("Verified!");
  };

  return (
    <div>
      {!isConnected ? (
        <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">
            Please connect your wallet to generate the verification QR code
          </p>
        </div>
      ) : !address ? (
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">
            Unable to get wallet address. Please try reconnecting your wallet.
          </p>
        </div>
      ) : selfApp ? (
        <SelfQRcodeWrapper
          key={address} // Force re-render when address changes
          selfApp={selfApp}
          onSuccess={handleSuccessfulVerification}
          onError={() => {
            console.error("Error: Failed to verify identity");
          }}
        />
      ) : (
        <div className="text-center p-8">
          <p className="text-gray-600">Loading QR Code...</p>
        </div>
      )}
    </div>
  );
}
