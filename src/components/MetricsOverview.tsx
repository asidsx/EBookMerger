import React from 'react';
import { CheckCircle2, FileText, Timer, Flame } from 'lucide-react';
import { Task, Note } from '../types';

interface MetricsOverviewProps {
  tasks: Task[];
  notes: Note[];
  focusSeconds: number;
  streakCount: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  tasks,
  notes,
  focusSeconds,
  streakCount,
}) => {
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const focusMinutes = Math.floor(focusSeconds / 60);

  return (
    <div id="metrics-overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Completed</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-semibold text-zinc-900">{completedTasks}</span>
          <span className="text-xs text-zinc-500">of {totalTasks} tasks</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Saved Notes</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-semibold text-zinc-900">{notes.length}</span>
          <span className="text-xs text-zinc-500">scratchpads</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Focus Time</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Timer className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-semibold text-zinc-900">{focusMinutes}m</span>
          <span className="text-xs text-zinc-500">total tracked</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Daily Streak</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-semibold text-zinc-900">{streakCount}</span>
          <span className="text-xs text-zinc-500">days active</span>
        </div>
      </div>
    </div>
  );
};
