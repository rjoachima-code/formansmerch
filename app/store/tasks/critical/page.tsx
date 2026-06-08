"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, MapPin, Loader2 } from 'lucide-react';

type TaskTemplate = {
  title: string;
  description: string;
  requiredSteps: { label: string; details: string }[];
};

type TaskInstance = {
  id: string;
  currentStep: number;
  template: TaskTemplate;
};

export default function CriticalTaskFlow() {
  const [task, setTask] = useState<TaskInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [geoError, setGeoError] = useState("");

  useEffect(() => {
    fetchTask();
  }, []);

  const fetchTask = async () => {
    try {
      const res = await fetch('/api/tasks/critical');
      const data = await res.json();
      setTask(data.task);
    } catch {
      console.error('Failed to fetch task');
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (stepIndex: number, isFinalStep: boolean) => {
    setSyncing(true);
    setGeoError("");

    try {
      let lat = null;
      let lng = null;

      if (isFinalStep) {
        // Request geolocation
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
              resolve();
            },
            (err) => {
              reject(err);
            },
            { enableHighAccuracy: true }
          );
        }).catch(() => {
            throw new Error("Geolocation access denied or failed.");
          });
      }

      const res = await fetch('/api/tasks/critical-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task!.id,
          stepIndex: isFinalStep ? stepIndex : stepIndex + 1, // Advance if not final
          isFinalStep,
          lat,
          lng
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to synchronize step with server");
      }

      const data = await res.json();
      setTask(data.task);

    } catch (error: unknown) {
      setGeoError(error instanceof Error ? error.message : "Failed to synchronize step with server");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-red-600 w-8 h-8" /></div>;

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center mt-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">No Critical Tasks Pending</h2>
        <p className="text-gray-600 mt-2">All required critical operations have been completed.</p>
      </div>
    );
  }

  type Step = {
  label: string;
  details: string;
};

let steps: Step[] = [];
  try {
    steps = typeof task.template.requiredSteps === 'string' 
      ? JSON.parse(task.template.requiredSteps as string) 
      : task.template.requiredSteps;
    if (!Array.isArray(steps)) steps = [];
  } catch {
    steps = [];
  }

  const currentStepData = steps[task.currentStep];
  const isFinalStep = task.currentStep === steps.length - 1;

  if (!currentStepData) {
    return <div>Configuration Error: No steps defined for this task.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-6">
      <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg shadow-md mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          <h1 className="text-2xl font-bold text-red-900">{task.template.title}</h1>
        </div>
        <p className="text-red-700">{task.template.description}</p>
        <div className="mt-4 text-sm font-semibold text-red-800">
          Step {task.currentStep + 1} of {steps.length}
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-red-200 rounded-full h-2.5 mt-2">
          <div className="bg-red-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${((task.currentStep) / steps.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-8 shadow-lg text-center">
        <h2 className="text-3xl font-extrabold mb-4">{currentStepData.label}</h2>
        <p className="text-xl text-gray-600 mb-8">{currentStepData.details}</p>

        {geoError && (
          <div className="mb-6 p-4 bg-orange-50 text-orange-800 border border-orange-200 rounded text-left">
            <span className="font-bold flex items-center gap-2"><MapPin className="w-4 h-4"/> Location Error</span>
            {geoError}
          </div>
        )}

        <button
          onClick={() => completeStep(task.currentStep, isFinalStep)}
          disabled={syncing}
          className={`w-full py-4 rounded-lg text-xl font-bold flex items-center justify-center gap-3 transition-colors ${
            syncing 
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
              : isFinalStep 
                ? 'bg-black text-white hover:bg-gray-800' 
                : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {syncing ? (
             <><Loader2 className="animate-spin" /> Synchronizing...</>
          ) : isFinalStep ? (
             <><MapPin /> Verify Location & Complete</>
          ) : (
             <>Confirm & Proceed</>
          )}
        </button>
      </div>
    </div>
  );
}
