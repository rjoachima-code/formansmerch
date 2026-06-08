'use client'

import React, { useState, useRef } from 'react'
import { Upload, Calendar, AlertCircle, CheckCircle, Camera } from 'lucide-react'

interface PlanogramForm {
  title: string
  description: string
  department: string
  startDate: string
  endDate: string
  requiredFixtures: string
}

const FIXTURE_OPTIONS = [
  '2-tier fixture',
  '4-tier fixture',
  'Gondola',
  'Pegboard',
  'Wall display',
  'Endcap',
  'Tabletop'
]

export default function CreatePlanogramPage() {
  const [form, setForm] = useState<PlanogramForm>({
    title: '',
    description: '',
    department: '',
    startDate: '',
    endDate: '',
    requiredFixtures: ''
  })
  const [selectedFixtures, setSelectedFixtures] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFixtureToggle = (fixture: string) => {
    setSelectedFixtures(prev =>
      prev.includes(fixture)
        ? prev.filter(f => f !== fixture)
        : [...prev, fixture]
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) {
      setMessage({ type: 'error', text: 'Please select an image' })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      // Upload image
      const uploadForm = new FormData()
      uploadForm.append('file', imageFile)
      uploadForm.append('folder', 'planograms')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm
      })

      if (!uploadRes.ok) throw new Error('Image upload failed')
      const { imageUrl, key } = await uploadRes.json()

      // Create directive
      const createRes = await fetch('/api/planograms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          requiredFixtures: selectedFixtures,
          referenceImage: imageUrl,
          s3Key: key
        })
      })

      if (createRes.ok) {
        setMessage({ type: 'success', text: 'Planogram directive created successfully!' })
        setForm({ title: '', description: '', department: '', startDate: '', endDate: '', requiredFixtures: '' })
        setSelectedFixtures([])
        setImageFile(null)
        setPreviewUrl('')
      } else {
        const data = await createRes.json()
        throw new Error(data.error || 'Failed to create directive')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Submission failed';
      setMessage({ type: 'error', text: message });
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Camera size={32} />
        Create Planogram Directive
      </h1>

      {message && (
        <div style={{
          padding: '1rem',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {message.type === 'success' ? <CheckCircle /> : <AlertCircle />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
              placeholder="e.g., Men's Denim Wall Reset - June 2026"
            />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={3}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
              placeholder="Additional instructions for merchandising team..."
            />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Department</label>
            <select
              name="department"
              value={form.department}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="">Select Department...</option>
              <option value="Men's Apparel">Men's Apparel</option>
              <option value="Women's Apparel">Women's Apparel</option>
              <option value="Kids">Kids</option>
              <option value="Home">Home</option>
              <option value="All Departments">All Departments</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                <Calendar size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                <Calendar size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Required Fixtures</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {FIXTURE_OPTIONS.map(fixture => (
                <button
                  key={fixture}
                  type="button"
                  onClick={() => handleFixtureToggle(fixture)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: selectedFixtures.includes(fixture) ? '2px solid #2563eb' : '1px solid #ccc',
                    backgroundColor: selectedFixtures.includes(fixture) ? '#eff6ff' : '#f9fafb',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {fixture}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              Reference Image
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              required
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Upload /> Select Reference Image
            </button>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ marginTop: '1rem', maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !imageFile}
            style={{
              padding: '1rem 2rem',
              backgroundColor: submitting ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {submitting ? 'Creating...' : 'Create Directive'}
          </button>
        </div>
      </form>
    </div>
  )
}