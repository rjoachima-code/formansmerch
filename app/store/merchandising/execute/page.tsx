import React, { useState, useRef, useEffect } from 'react'
import { Camera, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import { compressImage } from '@/lib/imageProcessor'

interface PlanogramDirective {
  id: string
  title: string
  description: string
  department: string
  referenceImage: string
  startDate: string
  endDate: string
  requiredFixtures: string[]
}

interface ComplianceStatus {
  submitted: boolean
  score?: number
  imageUrl?: string
}

export default function ExecutePlanogramPage() {
  const [directive, setDirective] = useState<PlanogramDirective | null>(null)
  const [loading, setLoading] = useState(true)
  const [compliance, setCompliance] = useState<ComplianceStatus>({ submitted: false })
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    fetchActiveDirective()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const fetchActiveDirective = async () => {
    try {
      const res = await fetch('/api/planograms')
      if (res.ok) {
        const data = await res.json()
        if (data.directives && data.directives.length > 0) {
          setDirective(data.directives[0])
        }
      }
    } catch {
      console.error('Failed to fetch directive')
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraActive(true)
    } catch {
      setMessage({ type: 'error', text: 'Camera access denied. Please allow camera permissions.' })
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedImage(dataUrl)
        stopCamera()
      }
    }
  }

  const uploadCompliancePhoto = async () => {
    if (!capturedImage || !directive) return

    setUploading(true)
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      const file = new File([blob], 'compliance.jpg', { type: 'image/jpeg' })

      // Compress image before upload
      const compressedBlob = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.8,
        format: 'jpeg'
      })

      const formData = new FormData()
      formData.append('file', compressedBlob, 'compliance.jpg')
      formData.append('folder', 'compliance')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) throw new Error('Upload failed')
      const { imageUrl, key } = await uploadRes.json()

      // Submit compliance
      const complianceRes = await fetch('/api/planograms/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directiveId: directive.id,
          storeId: 'current-store-id',
          managerId: 'current-manager-id',
          complianceImage: imageUrl,
          s3Key: key,
          notes
        })
      })

      if (complianceRes.ok) {
        setCompliance({ submitted: true, score: 85, imageUrl })
        setMessage({ type: 'success', text: 'Compliance photo submitted!' })
      } else {
        const data = await complianceRes.json()
        throw new Error(data.error || 'Submission failed')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      setMessage({ type: 'error', text: message })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading planogram directive...
      </div>
    )
  }

  if (!directive) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Calendar size={48} style={{ margin: '0 auto 1rem', color: '#9ca3af' }} />
        <h2>No Active Planogram Directives</h2>
        <p style={{ color: '#6b7280' }}>No merchandising directives are currently active for your store.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      {compliance.submitted ? (
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
          <h2 style={{ color: '#065f46' }}>Compliance Submitted</h2>
          <p>Score: {compliance.score}%</p>
          {compliance.imageUrl && (
            <img
              src={compliance.imageUrl}
              alt="Compliance"
              style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '1rem' }}
            />
          )}
        </div>
      ) : (
        <>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Camera /> {directive.title}
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            {directive.description}
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <p><strong>Department:</strong> {directive.department}</p>
            <p><strong>Active Period:</strong> {new Date(directive.startDate).toLocaleDateString()} - {new Date(directive.endDate).toLocaleDateString()}</p>
            {directive.requiredFixtures.length > 0 && (
              <p><strong>Required Fixtures:</strong> {directive.requiredFixtures.join(', ')}</p>
            )}
          </div>

          {message && (
            <div style={{
              padding: '1rem',
              backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              {message.type === 'success' ? <CheckCircle /> : <AlertCircle />}
              {message.text}
            </div>
          )}

          {cameraActive ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={capturePhoto}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : capturedImage ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <img
                src={capturedImage}
                alt="Captured"
                style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about compliance..."
                rows={3}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={uploadCompliancePhoto}
                  disabled={uploading}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Submit Compliance'}
                </button>
                <button
                  onClick={() => setCapturedImage('')}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #ccc',
                    borderRadius: '8px'
                  }}
                >
                  Retake
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startCamera}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <Camera /> Start Camera - Take Compliance Photo
            </button>
          )}

          <div style={{ marginTop: '2rem' }}>
            <h3>Reference Image</h3>
            <img
              src={directive.referenceImage}
              alt="Reference"
              style={{ maxWidth: '100%', borderRadius: '8px', border: '2px solid #e5e7eb' }}
            />
          </div>
        </>
      )}
    </div>
  )
}