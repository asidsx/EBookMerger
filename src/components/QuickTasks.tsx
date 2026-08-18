import React, { useState } from 'react';
import { Plus, Check, Trash2, Tag, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface QuickTasksProps {
  tasks: Task[];
  onAddTask: (title: string, category: Task['category'], priority: Task['priority']) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const QuickTasks: React.FC<QuickTasksProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState<Task['category']>('Feature');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), category, priority);
    setNewTitle('');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const getPriorityColor = (p: Task['priority']) => {
    switch (p) {
      case 'high':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div id="tasks-container" className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Task Tracker</h2>
          <p className="text-xs text-zinc-500">Manage deliverables and feature ideas</p>
        </div>
        <div className="flex items-center space-x-1 bg-zinc-100 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'pending' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'completed' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Done
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          id="task-input-title"
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new task or action item..."
          className="flex-1 px-3.5 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
        />

        <div className="flex gap-2">
          <select
            id="task-select-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Task['category'])}
            className="px-2.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none focus:border-zinc-900"
          >
            <option value="Feature">Feature</option>
            <option value="Design">Design</option>
            <option value="Bug">Bug</option>
            <option value="Idea">Idea</option>
          </select>

          <select
            id="task-select-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task['priority'])}
            className="px-2.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none focus:border-zinc-900"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button
            id="task-btn-submit"
            type="submit"
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs">
            No tasks in this view. Add one above!
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              id={`task-item-${t.id}`}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                t.completed
                  ? 'bg-zinc-50/60 border-zinc-200 text-zinc-400'
                  : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0 mr-2">
                <button
                  id={`btn-toggle-task-${t.id}`}
                  onClick={() => onToggleTask(t.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    t.completed
                      ? 'bg-zinc-900 border-zinc-900 text-white'
                      : 'border-zinc-300 hover:border-zinc-900'
                  }`}
                >
                  {t.completed && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-sm truncate ${
                      t.completed ? 'line-through text-zinc-400' : 'text-zinc-800 font-medium'
                    }`}
                  >
                    {t.title}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium">
                      {t.category}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase ${getPriorityColor(
                        t.priority
                      )}`}
                    >
                      {t.priority}
                    </span>
                  </div>
                </div>
              </div>

              <button
                id={`btn-delete-task-${t.id}`}
                onClick={() => onDeleteTask(t.id)}
                className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
