export interface Task {
  id: string;
  title: string;
  category: 'Feature' | 'Design' | 'Bug' | 'Idea';
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tag: string;
}

export interface ActivityLog {
  id: string;
  text: string;
  timestamp: string;
  type: 'task' | 'note' | 'timer';
}
