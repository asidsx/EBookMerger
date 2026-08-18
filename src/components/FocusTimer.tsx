import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';

interface FocusTimerProps {
  onSessionComplete: (seconds: number) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete }) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === 'focus') {
        onSessionComplete(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, mode, onSessionComplete]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setIsRunning(false);
    setSecondsLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const progress =
    mode === 'focus'
      ? ((25 * 60 - secondsLeft) / (25 * 60)) * 100
      : ((5 * 60 - secondsLeft) / (5 * 60)) * 100;

  return (
    <div id="focus-timer-card" className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Focus Timer</h2>
            <p className="text-xs text-zinc-500">Pomodoro sprint & break cycles</p>
          </div>
          <div className="flex gap-1 bg-zinc-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => switchMode('focus')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                mode === 'focus' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Sprint</span>
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                mode === 'break' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600'
              }`}
            >
              <Coffee className="w-3 h-3" />
              <span>Break</span>
            </button>
          </div>
        </div>

        <div className="my-6 flex flex-col items-center justify-center">
          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-900">
            {formattedTime}
          </div>
          <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-4 overflow-hidden max-w-xs">
            <div
              className={`h-full transition-all duration-500 ${
                mode === 'focus' ? 'bg-zinc-900' : 'bg-emerald-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          id="btn-timer-toggle"
          onClick={toggleTimer}
          className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-zinc-900 hover:bg-zinc-800 text-white'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>
        <button
          id="btn-timer-reset"
          onClick={resetTimer}
          className="p-2.5 border border-zinc-200 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
