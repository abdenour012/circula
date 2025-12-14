import { useEffect, useRef, useState } from 'react'
import { X, ScanLine } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from './Button'

export function BarcodeScanner({
  onScan,
  onClose,
}: {
  onScan: (barcode: string) => void
  onClose: () => void
}) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scanning) return

    const scanner = new Html5Qrcode('barcode-scanner-container')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setScanning(false)
          scanner.stop().then(() => {
            scannerRef.current = null
            onScan(decodedText)
          })
        },
        (errorMessage) => {
          // Ignore not found errors (normal during scanning)
          if (!errorMessage.includes('No QR code')) {
            setError(errorMessage)
          }
        }
      )
      .catch((err) => {
        setError(err.message)
        setScanning(false)
      })

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current = null
          })
          .catch(() => {})
      }
    }
  }, [scanning, onScan])

  const startScanning = () => {
    setError(null)
    setScanning(true)
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null
          setScanning(false)
        })
        .catch(() => {})
    } else {
      setScanning(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md anim-fade-up">
        <div className="relative rounded-3xl overflow-hidden bg-white shadow-elevated">
          <div className="p-4 border-b border-black/10 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">Scan Barcode</div>
              <div className="text-xs text-black/60">Point camera at product barcode</div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close barcode scanner">
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="p-4">
            {!scanning ? (
              <div className="space-y-4">
                <div className="aspect-square bg-black/5 rounded-2xl flex items-center justify-center">
                  <ScanLine className="h-16 w-16 text-black/20" />
                </div>
                <Button variant="primary" className="w-full" onClick={startScanning} aria-label="Start barcode scanning">
                  <ScanLine className="h-4 w-4" aria-hidden="true" /> Start Scanning
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  id="barcode-scanner-container"
                  ref={containerRef}
                  className="aspect-square rounded-2xl overflow-hidden bg-black"
                />
                {error && (
                  <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                    {error}
                  </div>
                )}
                <Button variant="secondary" className="w-full" onClick={stopScanning} aria-label="Stop barcode scanning">
                  Stop Scanning
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
