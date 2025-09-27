import { useEffect, useState } from "react";
import { countries, SelfQRcodeWrapper } from "@selfxyz/qrcode";
import { SelfAppBuilder } from "@selfxyz/qrcode";
import { useAccount } from "wagmi";
import { SELF_CONFIG, FRONTEND_DISCLOSURES } from "@/lib/self-config";

export default function Verify() {
  const [selfApp, setSelfApp] = useState<any | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    const userId = address;

    const app = new SelfAppBuilder({
      version: 2,
      appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Dike",
      scope: SELF_CONFIG.SCOPE,
      endpoint: SELF_CONFIG.ENDPOINT,
      logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
      userId: userId,
      endpointType: "staging_celo",
      userIdType: SELF_CONFIG.USER_ID_TYPE,
      userDefinedData: "Hello from the Docs!!",
      disclosures: FRONTEND_DISCLOSURES,
    }).build();

    setSelfApp(app);
  }, []);

  const handleSuccessfulVerification = () => {
    console.log("Verified!");
  };

  return (
    <div>
      {selfApp ? (
        <SelfQRcodeWrapper
          selfApp={selfApp}
          onSuccess={handleSuccessfulVerification}
          onError={() => {
            console.error("Error: Failed to verify identity");
          }}
        />
      ) : (
        <div>
          <p>Loading QR Code...</p>
        </div>
      )}
    </div>
  );
}
