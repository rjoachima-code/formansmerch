'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, FileText, AlertTriangle, CheckCircle, Info, BookOpen } from 'lucide-react';

export interface StoreSOP {
  id: string;
  title: string;
  description: string;
  content: string;
  iconName: string;
}

const IconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="text-blue-500" size={28} />,
  AlertTriangle: <AlertTriangle className="text-amber-500" size={28} />,
  CheckCircle: <CheckCircle className="text-emerald-500" size={28} />,
  Info: <Info className="text-sky-500" size={28} />,
  BookOpen: <BookOpen className="text-indigo-500" size={28} />
};

interface StoreSopViewerProps {
  initialSearchQuery?: string;
  focusedSopId?: string | null;
  onCloseFocus?: () => void;
}

export default function StoreSopViewer({ initialSearchQuery = '', focusedSopId, onCloseFocus }: StoreSopViewerProps) {
  const [query, setQuery] = useState(initialSearchQuery);
  const [sops, setSops] = useState<StoreSOP[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(focusedSopId || null);

  // Sync focusedSopId prop changes
  useEffect(() => {
    if (focusedSopId) {
      setExpandedId(focusedSopId);
      // Fetch specifically this SOP if not in list, or just clear search and fetch all
      fetchSops(''); 
    } else if (initialSearchQuery) {
      fetchSops(initialSearchQuery);
    } else {
      fetchSops('');
    }
  }, [focusedSopId, initialSearchQuery]);

  const fetchSops = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sops?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSops(data.sops || []);
      }
    } catch (err) {
      console.error('Failed to fetch SOPs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSops(query);
  };

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '1.5rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={28} className="text-indigo-600" />
          Standard Operating Procedures
        </h2>
        {focusedSopId && onCloseFocus && (
          <button 
            onClick={onCloseFocus}
            style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Clear Focus
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '2rem' }}>
        <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#9ca3af' }}>
          <Search size={20} />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search procedures (e.g., 'spill response', 'closing shift')..." 
          style={{
            width: '100%',
            padding: '1rem 1rem 1rem 3rem',
            fontSize: '1.1rem',
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
            boxSizing: 'border-box',
            outline: 'none'
          }}
        />
        <button type="submit" style={{ display: 'none' }}>Search</button>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Searching procedures...</div>
      ) : sops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <AlertTriangle size={32} style={{ margin: '0 auto 1rem', color: '#9ca3af' }} />
          <p style={{ margin: 0 }}>No procedures found matching your keywords.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sops.map((sop) => {
            const isExpanded = expandedId === sop.id;
            return (
              <div 
                key={sop.id} 
                style={{
                  border: isExpanded ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <button 
                  onClick={() => toggleAccordion(sop.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    backgroundColor: isExpanded ? '#eff6ff' : '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      padding: '0.5rem', 
                      backgroundColor: isExpanded ? '#dbeafe' : '#f3f4f6', 
                      borderRadius: '8px' 
                    }}>
                      {IconMap[sop.iconName] || <FileText size={28} className="text-gray-500" />}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: '#111827' }}>{sop.title}</h3>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>{sop.description}</p>
                    </div>
                  </div>
                  <div style={{ color: '#9ca3af' }}>
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div style={{ 
                    padding: '1.5rem', 
                    backgroundColor: '#ffffff', 
                    borderTop: '1px solid #e5e7eb',
                    lineHeight: '1.6',
                    color: '#374151'
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {sop.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
