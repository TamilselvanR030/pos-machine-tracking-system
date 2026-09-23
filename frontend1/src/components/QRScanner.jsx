import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { Camera, CameraOff, X } from 'lucide-react'

export default function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setScanning(true)
        rafRef.current = requestAnimationFrame(tick)
      }
    } catch (e) {
      setError('Camera access denied. Please allow camera permission and try again.')
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
  }

  function tick() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick)
      return
    }
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' })
    if (code && code.data) {
      stopCamera()
      onScan(code.data)
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Camera size={18} color="var(--accent)" />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Scan QR Code</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px 8px' }}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          {error ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CameraOff size={40} color="var(--t3)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 500 }}>{error}</p>
            </div>
          ) : (
            <div>
              <div className="scanner-viewport" style={{ height: 300 }}>
                <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                {scanning && <div className="scan-line" />}
                {/* Corners */}
                {[
                  { top: 12, left: 12, borderWidth: '3px 0 0 3px' },
                  { top: 12, right: 12, borderWidth: '3px 3px 0 0' },
                  { bottom: 12, left: 12, borderWidth: '0 0 3px 3px' },
                  { bottom: 12, right: 12, borderWidth: '0 3px 3px 0' },
                ].map((s, i) => (
                  <div key={i} className="scan-corner" style={s} />
                ))}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <p style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 12.5, marginTop: 14 }}>
                Point the camera at a QR code to scan automatically
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
