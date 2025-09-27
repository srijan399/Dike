"use client";
import SelfKYC from "@/components/SelfKYC";

export default function KYCTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Self Identity Verification
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Verify your identity using Self&apos;s decentralized identity system
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Verification Requirements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">
                  Accepted Documents:
                </h3>
                <ul className="space-y-1">
                  <li>• Passport</li>
                  <li>• Biometric ID Card</li>
                  <li>• Aadhaar Card</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">
                  Requirements:
                </h3>
                <ul className="space-y-1">
                  <li>• Minimum age: 18</li>
                  <li>• OFAC compliance check</li>
                  <li>• Country restrictions apply</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Scan QR Code to Verify
          </h2>
          <SelfKYC />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by Self Identity • Decentralized • Privacy-Preserving
          </p>
        </div>
      </div>
    </div>
  );
}
