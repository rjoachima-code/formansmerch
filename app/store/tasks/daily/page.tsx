"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

type TaskInstance = {
  id: string;
  status: string;
  template: {
    title: string;
    description: string;
    scheduledTime: string | null;
    isCritical: boolean;
  };
};

export default function DailyTasksPage() {
  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [blockingTask, setBlockingTask] = useState<string | null>(null);
  const [blockerReason, setBlockerReason] = useState("");
  const [blockerDesc, setBlockerDesc] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks/daily');
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        setServerTime(data.serverTime);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    if (status === "COMPLETED") {
       const res = await fetch('/api/tasks/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, status })
       });
       if (res.ok) fetchTasks();
       else alert(await res.text());
    }
  };

  const submitBlocker = async () => {
    if (!blockingTask) return;
    const res = await fetch('/api/tasks/update', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ 
         taskId: blockingTask, 
         status: "BLOCKED",
         blockerReasonCode: blockerReason,
         blockerExplanation: blockerDesc
       })
    });
    if (res.ok) {
       setBlockingTask(null);
       fetchTasks();
    } else {
       alert("Failed to submit blocker");
    }
  };

  const isTimeLocked = (scheduledTime: string | null) => {
    if (!scheduledTime || !serverTime) return false;
    const serverDate = new Date(serverTime);
    const [h, m] = scheduledTime.split(':').map(Number);
    const scheduledDate = new Date(serverDate);
    scheduledDate.setHours(h, m, 0, 0);
    return serverDate < scheduledDate;
  };

  if (loading) return <div className="p-8">Loading tasks...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Clock className="w-8 h-8 text-blue-600" />
        Daily Store Operations
      </h1>

      <div className="space-y-4">
        {tasks.map(task => {
          const locked = isTimeLocked(task.template.scheduledTime);
          const isBlocked = task.status === "BLOCKED";
          const isCompleted = task.status === "COMPLETED";

          return (
            <div key={task.id} className={`border rounded-lg p-5 shadow-sm bg-white ${isBlocked ? 'border-red-500 bg-red-50' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    {task.template.title}
                    {task.template.isCritical && <ShieldAlert className="w-5 h-5 text-red-600" />}
                  </h3>
                  <p className="text-gray-600 mt-1">{task.template.description}</p>
                  {task.template.scheduledTime && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Scheduled: {task.template.scheduledTime}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" /> Completed
                    </span>
                  ) : isBlocked ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                      <AlertCircle className="w-4 h-4" /> Blocked
                    </span>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                        disabled={locked}
                        className={`px-4 py-2 rounded font-medium text-white ${locked ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {locked ? "Locked (Too Early)" : "Complete Task"}
                      </button>
                      <button 
                        onClick={() => setBlockingTask(task.id)}
                        className="px-4 py-2 rounded font-medium text-red-600 border border-red-600 hover:bg-red-50"
                      >
                        Report Blocker
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {blockingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" /> Report Task Blocker
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              This will update the store's daily health score and notify the District Manager if unresolved.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason Code</label>
                <select 
                  value={blockerReason} 
                  onChange={e => setBlockerReason(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Select Reason...</option>
                  <option value="STAFF_SHORTAGE">Staff Shortage</option>
                  <option value="EQUIPMENT_FAILURE">Equipment Failure</option>
                  <option value="INVENTORY_MISSING">Inventory Missing</option>
                  <option value="SYSTEM_OUTAGE">System Outage</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                <textarea 
                  value={blockerDesc} 
                  onChange={e => setBlockerDesc(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 h-24 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Provide specific details..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setBlockingTask(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitBlocker}
                  disabled={!blockerReason || !blockerDesc}
                  className="px-4 py-2 bg-red-600 text-white rounded font-medium disabled:opacity-50 hover:bg-red-700"
                >
                  Submit Blocker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
