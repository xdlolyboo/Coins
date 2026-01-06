import { useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, CalendarDays } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export function SimulationControls() {
    const currentDay = useAppStore(state => state.currentDay);
    const maxDays = useAppStore(state => state.maxDays);
    const isPlaying = useAppStore(state => state.isPlaying);
    const playSpeed = useAppStore(state => state.playSpeed);
    const advanceDay = useAppStore(state => state.advanceDay);
    const togglePlay = useAppStore(state => state.togglePlay);
    const setPlaySpeed = useAppStore(state => state.setPlaySpeed);
    const resetSimulation = useAppStore(state => state.resetSimulation);
    const historicalData = useAppStore(state => state.historicalData);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Get the date for current day
    const currentDate = Object.values(historicalData)[0]?.[currentDay]?.time || '';
    const formattedDate = currentDate ? new Date(currentDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    }) : '';

    // Auto-play effect
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                advanceDay();
            }, playSpeed);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, playSpeed, advanceDay]);

    // Stop playing when reaching end
    useEffect(() => {
        if (currentDay >= maxDays && isPlaying) {
            togglePlay();
        }
    }, [currentDay, maxDays, isPlaying, togglePlay]);

    const progress = ((currentDay + 1) / (maxDays + 1)) * 100;
    const isComplete = currentDay >= maxDays;

    return (
        <div className="glass-card p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Simulation</h3>
                    <p className="text-xs text-gray-500">30-Day Trading Period</p>
                </div>
            </div>

            {/* Day Counter */}
            <div className="text-center mb-5 p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-4xl font-bold text-white">Day {currentDay + 1}</span>
                    <span className="text-gray-500 text-lg">/ {maxDays + 1}</span>
                </div>
                <p className="text-gray-400 text-sm">{formattedDate}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${isComplete
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mb-5">
                {/* Reset */}
                <button
                    onClick={resetSimulation}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                    title="Reset to Day 1"
                >
                    <RotateCcw className="w-5 h-5 text-gray-400" />
                </button>

                {/* Play/Pause */}
                <button
                    onClick={togglePlay}
                    disabled={isComplete}
                    className={`p-4 rounded-xl transition-all ${isPlaying
                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                            : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        } disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed`}
                >
                    {isPlaying ? (
                        <Pause className="w-6 h-6" />
                    ) : (
                        <Play className="w-6 h-6" />
                    )}
                </button>

                {/* Next Day */}
                <button
                    onClick={advanceDay}
                    disabled={isComplete}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next Day"
                >
                    <SkipForward className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Speed Control */}
            <div>
                <label className="text-xs text-gray-500 block mb-2">Playback Speed</label>
                <div className="flex gap-2">
                    {[
                        { speed: 2000, label: '0.5x' },
                        { speed: 1000, label: '1x' },
                        { speed: 500, label: '2x' },
                        { speed: 250, label: '4x' },
                    ].map(({ speed, label }) => (
                        <button
                            key={speed}
                            onClick={() => setPlaySpeed(speed)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${playSpeed === speed
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-white/5 text-gray-400 border border-transparent hover:text-white'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
