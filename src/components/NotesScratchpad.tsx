import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save } from 'lucide-react';
import { Note } from '../types';

interface NotesScratchpadProps {
  notes: Note[];
  onAddNote: (title: string, content: string, tag: string) => void;
  onUpdateNote: (id: string, title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesScratchpad: React.FC<NotesScratchpadProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('Draft');
  const [newContent, setNewContent] = useState('');

  const currentNote = notes.find((n) => n.id === selectedNoteId);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddNote(newTitle.trim(), newContent.trim(), newTag.trim() || 'General');
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
  };

  return (
    <div id="notes-container" className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Scratchpad & Notes</h2>
          <p className="text-xs text-zinc-500">Quick ideas, architectural notes & drafts</p>
        </div>
        <button
          id="btn-new-note"
          onClick={() => setIsCreating(true)}
          className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {isCreating ? (
        <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input
              id="note-input-title"
              type="text"
              placeholder="Note title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
              autoFocus
            />
            <input
              id="note-input-tag"
              type="text"
              placeholder="Tag (e.g. Plan)"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="w-28 px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
            />
          </div>
          <textarea
            id="note-input-content"
            placeholder="Write markdown or thoughts..."
            rows={4}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 resize-none font-mono"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 font-medium rounded-lg hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              id="btn-save-new-note"
              type="submit"
              className="px-3.5 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800"
            >
              Save Note
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 border-r border-zinc-100 md:col-span-1">
            {notes.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">No notes yet.</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  id={`note-item-tab-${note.id}`}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                    selectedNoteId === note.id
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold truncate max-w-[120px]">{note.title}</span>
                    <span
                      className={`text-[9px] px-1 py-0.5 rounded font-mono ${
                        selectedNoteId === note.id ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {note.tag}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] truncate mt-1 ${
                      selectedNoteId === note.id ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {note.content || 'Empty note'}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="md:col-span-2">
            {currentNote ? (
              <div className="flex flex-col h-full space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <div>
                    <input
                      id="note-edit-title"
                      type="text"
                      value={currentNote.title}
                      onChange={(e) => onUpdateNote(currentNote.id, e.target.value, currentNote.content)}
                      className="text-sm font-semibold text-zinc-900 bg-transparent border-none focus:outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 block">
                      Updated: {new Date(currentNote.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    id="btn-delete-active-note"
                    onClick={() => onDeleteNote(currentNote.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  id="note-edit-content"
                  value={currentNote.content}
                  onChange={(e) => onUpdateNote(currentNote.id, currentNote.title, e.target.value)}
                  placeholder="Type anything here..."
                  rows={8}
                  className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg p-3 focus:outline-none focus:border-zinc-900 leading-relaxed resize-none"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-zinc-400 text-xs">
                Select a note or create one to view details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
