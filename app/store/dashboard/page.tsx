"use client";

import React, { useState, useEffect } from 'react';
import StoreSopViewer from '../../../components/StoreSopViewer';
import { CheckSquare, ArrowRightCircle } from 'lucide-react';
import styles from './Dashboard.module.css';

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
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const handleViewProcedure = (sopId: string) => {
    setFocusedSopId(sopId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      
      <section className={styles.checklistSection}>
        <h2 className={styles.sectionTitle}>
          <CheckSquare size={28} color="#059669" />
          Manager's Daily Checklist
        </h2>

        {loading ? (
          <p className={styles.loadingText}>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className={styles.emptyText}>No tasks assigned for today. Add some to the database.</p>
        ) : (
          <div className={styles.taskList}>
            {tasks.map(task => (
              <div key={task.id} className={styles.taskItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="checkbox" 
                    checked={task.isCompleted} 
                    onChange={() => handleToggleTask(task.id)}
                    className={styles.taskCheckbox}
                  />
                  <span style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '500',
                    color: task.isCompleted ? '#9ca3af' : '#1f2937',
                    textDecoration: task.isCompleted ? 'line-through' : 'none'
                  }} className={task.isCompleted ? styles.taskTitleCompleted : styles.taskTitle}>
                    {task.title}
                  </span>
                </div>

                {task.sopId && (
                  <button 
                    onClick={() => handleViewProcedure(task.sopId as string)}
                    className={styles.procedureButton}
                  >
                    View Procedure <ArrowRightCircle size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <StoreSopViewer 
          focusedSopId={focusedSopId} 
          onCloseFocus={() => setFocusedSopId(null)} 
        />
      </section>

    </div>
  );
}
