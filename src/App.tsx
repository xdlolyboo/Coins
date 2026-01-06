import { useEffect, useState } from 'react';
import { ProfileSelector, Dashboard } from './components';
import { useAppStore } from './stores/appStore';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  const isDataLoaded = useAppStore(state => state.isDataLoaded);
  const currentProfileId = useAppStore(state => state.currentProfileId);
  const loadData = useAppStore(state => state.loadData);

  // Load data on mount
  useEffect(() => {
    const init = async () => {
      await loadData();
      setIsInitializing(false);
    };
    init();
  }, [loadData]);

  // Loading screen
  if (isInitializing || !isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading CTIS v2</h2>
          <p className="text-gray-400">Initializing market data...</p>
          <div className="mt-4 w-48 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shimmer" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  // Show profile selector if no profile is active
  if (!currentProfileId) {
    return <ProfileSelector />;
  }

  // Show main dashboard
  return <Dashboard />;
}

export default App;
