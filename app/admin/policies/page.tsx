'use client';

import React, { useState } from 'react';
import { z } from 'zod';

const MIN_LENGTH = 50; // Arbitrary character count for sufficient content

const policySchema = z.object({
  title: z.string().min(10),
  purpose: z.string().min(MIN_LENGTH),
  scope: z.string().min(MIN_LENGTH),
  policyStatement: z.string().min(MIN_LENGTH),
  responsibilities: z.string().min(MIN_LENGTH),
  procedures: z.string().min(MIN_LENGTH),
  complianceAndEnforcement: z.string().min(MIN_LENGTH),
  definitions: z.string().min(MIN_LENGTH),
  effectiveDate: z.string().min(10),
  escalationProcess: z.string().min(10), // We will parse this to JSON array on server
});

export default function AdminPoliciesPage() {
  const [formData, setFormData] = useState({
    title: '',
    purpose: '',
    scope: '',
    policyStatement: '',
    responsibilities: '',
    procedures: '',
    complianceAndEnforcement: '',
    definitions: '',
    effectiveDate: '',
    escalationProcess: '',
  });

  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validationResult = policySchema.safeParse(formData);
  const isPublishDisabled = !validationResult.success;

  const handlePublish = async () => {
    if (isPublishDisabled) return;

    try {
      const response = await fetch('/api/policies/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(`Success! Policy published at version ${result.version}`);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (err) {
      setMessage('Failed to publish policy');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Draft Corporate Policy</h1>
      
      {message && <div style={{ padding: '1rem', background: '#e0f7fa', marginBottom: '1rem' }}>{message}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ fontWeight: 'bold' }}>Title</label>
          <input name="title" value={formData.title} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        
        <div>
          <label style={{ fontWeight: 'bold' }}>Purpose (Rich Text / Min {MIN_LENGTH} chars)</label>
          <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} rows={4} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Scope (Min {MIN_LENGTH} chars)</label>
          <textarea name="scope" value={formData.scope} onChange={handleInputChange} rows={4} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Policy Statement (Min {MIN_LENGTH} chars)</label>
          <textarea name="policyStatement" value={formData.policyStatement} onChange={handleInputChange} rows={4} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Responsibilities (Min {MIN_LENGTH} chars)</label>
          <textarea name="responsibilities" value={formData.responsibilities} onChange={handleInputChange} rows={4} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Procedures (Min {MIN_LENGTH} chars)</label>
          <textarea name="procedures" value={formData.procedures} onChange={handleInputChange} rows={4} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Compliance & Enforcement (Min {MIN_LENGTH} chars)</label>
          <textarea name="complianceAndEnforcement" value={formData.complianceAndEnforcement} onChange={handleInputChange} rows={4} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Definitions (Min {MIN_LENGTH} chars)</label>
          <textarea name="definitions" value={formData.definitions} onChange={handleInputChange} rows={4} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Effective Date (YYYY-MM-DD)</label>
          <input name="effectiveDate" type="date" value={formData.effectiveDate} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Escalation Process (JSON format e.g. ["Manager", "Director"])</label>
          <textarea name="escalationProcess" value={formData.escalationProcess} onChange={handleInputChange} rows={2} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <button 
          onClick={handlePublish}
          disabled={isPublishDisabled}
          style={{ 
            padding: '1rem', 
            background: isPublishDisabled ? '#ccc' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            cursor: isPublishDisabled ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          Publish Policy
        </button>

        {isPublishDisabled && (
          <p style={{ color: 'red', fontSize: '0.8rem' }}>
            Please fill out all sections with sufficient character counts.
          </p>
        )}
      </div>
    </div>
  );
}
