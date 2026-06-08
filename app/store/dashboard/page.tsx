'use client';

import React, { useState, useEffect } from 'react';
import StoreSopViewer from '../../../components/StoreSopViewer';
import { CheckSquare, ArrowRightCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  sopId: string | null;
}

export default function StoreManagerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedSopId, setFocusedSopId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/tasks');
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks || []);
        }
      } catch (err) {
        console.error('Failed to load tasks', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const handleToggleTask = (id: string) => {
    // Optimistic UI update. In a real app, send a PUT/PATCH request to update the DB.
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const handleViewProcedure = (sopId: string) => {
    setFocusedSopId(sopId);
    // Smooth scroll to the SOP viewer component if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Daily Checklist Column */}
      <section style={{ 
        backgroundColor: '#f9fafb', 
        padding: '1.5rem', 
        borderRadius: '12px', 
        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem' }}>
          <CheckSquare size={28} color="#059669" />
          Manager's Daily Checklist
        </h2>

        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No tasks assigned for today. Add some to the database.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.map(task => (
              <div 
                key={task.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="checkbox" 
                    checked={task.isCompleted} 
                    onChange={() => handleToggleTask(task.id)}
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <span style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '500',
                    color: task.isCompleted ? '#9ca3af' : '#1f2937',
                    textDecoration: task.isCompleted ? 'line-through' : 'none'
                  }}>
                    {task.title}
                  </span>
                </div>

                {task.sopId && (
                  <button 
                    onClick={() => handleViewProcedure(task.sopId as string)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    View Procedure <ArrowRightCircle size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SOP Viewer Column */}
      <section>
        <StoreSopViewer 
          focusedSopId={focusedSopId} 
          onCloseFocus={() => setFocusedSopId(null)} 
        />
      </section>

    </div>
  );
}
