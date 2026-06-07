'use client';

import React, { useEffect, useState } from 'react';

// Mock context for the logged-in retail associate
const currentUser = {
  id: 'usr_retail_99812',
  name: 'Alex Retailer',
  store: {
    state: 'CA' // Example state. The backend will assemble specific "CA" and "ALL" sections.
  }
};

interface HandbookSection {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
}

export default function EmployeeHandbookViewer() {
  const [sections, setSections] = useState<HandbookSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [acknowledgment, setAcknowledgment] = useState<{ hash: string; timestamp: string } | null>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    async function fetchHandbook() {
      try {
        const res = await fetch(`/api/handbook?state=${currentUser.store.state}`);
        if (res.ok) {
          const data = await res.json();
          setSections(data.sections || []);
        }
      } catch (err) {
        console.error('Failed to load handbook', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHandbook();
  }, []);

  const handleAcknowledge = async () => {
    setSigning(true);
    try {
      const res = await fetch('/api/handbook/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAcknowledgment({
          hash: data.hash,
          timestamp: new Date(data.timestamp).toLocaleString()
        });
      } else {
        alert('Failed to record acknowledgment: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error signing document', err);
      alert('Network error while recording acknowledgment.');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box'
    }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Employee Handbook</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Prepared for {currentUser.name} (Store Region: {currentUser.store.state})
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading handbook...</div>
      ) : sections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No handbook sections available for your region at this time.
        </div>
      ) : (
        <main>
          {sections.map((section) => (
            <article 
              key={section.id} 
              style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            >
              <h2 style={{ marginTop: 0, fontSize: '1.4rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                {section.title}
              </h2>
              <div 
                style={{ lineHeight: '1.6', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}
              >
                {section.content}
              </div>
            </article>
          ))}

          <section style={{
            marginTop: '3rem',
            padding: '2rem 1rem',
            borderTop: '2px dashed #ccc',
            textAlign: 'center'
          }}>
            {acknowledgment ? (
              <div style={{
                backgroundColor: '#d1fae5',
                color: '#065f46',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #34d399'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>✅ Digitally Signed & Acknowledged</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', wordBreak: 'break-all' }}>
                  <strong>Receipt Hash:</strong> {acknowledgment.hash}<br/>
                  <strong>Timestamp:</strong> {acknowledgment.timestamp}
                </p>
              </div>
            ) : (
              <div>
                <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                  By clicking below, you acknowledge that you have read and agree to comply with the policies outlined in this handbook.
                </p>
                <button
                  onClick={handleAcknowledge}
                  disabled={signing}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '1rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    backgroundColor: signing ? '#9ca3af' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: signing ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    touchAction: 'manipulation' // Mobile optimization
                  }}
                >
                  {signing ? 'Processing Signature...' : 'Acknowledge & Sign'}
                </button>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
