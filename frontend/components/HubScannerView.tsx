
import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeResult } from 'html5-qrcode';

interface HubScannerViewProps {
  onVoucherRedeemed: (voucherId: string) => boolean;
}

const HubScannerView: React.FC<HubScannerViewProps> = ({ onVoucherRedeemed }) => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [redemptionStatus, setRedemptionStatus] = useState<'success' | 'failure' | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: 250 },
      false
    );
    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string, decodedResult: Html5QrcodeResult) => {
      scanner.clear();
      setScanResult(decodedText);
      const success = onVoucherRedeemed(decodedText);
      setRedemptionStatus(success ? 'success' : 'failure');
    };

    const onScanFailure = (error: any) => {
        // This is called frequently, so we don't set an error state here
        // to avoid a noisy UI.
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5-qrcode-scanner.", error);
        });
      }
    };
  }, [onVoucherRedeemed]);

  const resetScanner = () => {
    setScanResult(null);
    setScanError(null);
    setRedemptionStatus(null);
    if (scannerRef.current) {
      scannerRef.current.render(
        (decodedText) => {
          scannerRef.current?.clear();
          setScanResult(decodedText);
          const success = onVoucherRedeemed(decodedText);
          setRedemptionStatus(success ? 'success' : 'failure');
        },
        (error) => {}
      );
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-xl flex-grow flex flex-col items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Redeem Voucher</h1>
        
        {redemptionStatus === null && (
          <>
            <div id="qr-reader" className="w-full"></div>
            <p className="text-center text-gray-500 mt-4">Place the QR code inside the box.</p>
          </>
        )}

        {redemptionStatus === 'success' && (
          <div className="text-center py-8">
            <svg className="mx-auto h-20 w-20 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-3xl font-bold text-gray-800">Voucher Redeemed!</h2>
            <p className="mt-2 text-gray-600">Voucher ID: {scanResult}</p>
            <button onClick={resetScanner} className="mt-6 bg-teal-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-teal-600 transition-colors">
              Scan Next
            </button>
          </div>
        )}

        {redemptionStatus === 'failure' && (
          <div className="text-center py-8">
            <svg className="mx-auto h-20 w-20 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-3xl font-bold text-gray-800">Redemption Failed</h2>
            <p className="mt-2 text-gray-600">This voucher is invalid or has already been used.</p>
            <p className="mt-1 text-sm text-gray-500">ID: {scanResult}</p>
            <button onClick={resetScanner} className="mt-6 bg-teal-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-teal-600 transition-colors">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HubScannerView;
