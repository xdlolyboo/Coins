// Coin snapshot from CSV data
export interface CoinSnapshot {
    rank: number;
    name: string;
    symbol: string;
    price: number;
    change1h: number;
    change24h: number;
    change7d: number;
    change30d: number;
    volume24h: number;
    circulatingSupply: string;
    totalSupply: string;
    marketCap: number;
    iconUrl?: string;
}

// Historical data point for charts (OHLC format)
export interface HistoricalDataPoint {
    time: string; // YYYY-MM-DD format for Lightweight Charts
    open: number;
    high: number;
    low: number;
    close: number;
}

// Wallet entry for a coin
export interface WalletEntry {
    symbol: string;
    name: string;
    amount: number;
    avgBuyPrice: number;
}

// User profile
export interface Profile {
    id: string;
    username: string;
    balance: number;
    initialBalance: number;
    wallet: WalletEntry[];
    createdAt: number;
}

// Transaction record
export interface Transaction {
    id: string;
    type: 'buy' | 'sell';
    symbol: string;
    amount: number;
    price: number;
    total: number;
    timestamp: number;
    day: number;
}

// App state for Zustand
export interface AppState {
    // Data
    coins: CoinSnapshot[];
    historicalData: Record<string, HistoricalDataPoint[]>;
    isDataLoaded: boolean;

    // Profiles
    profiles: Profile[];
    currentProfileId: string | null;

    // Simulation
    currentDay: number;
    maxDays: number;
    isPlaying: boolean;
    playSpeed: number; // ms between days

    // UI State
    selectedCoin: string;
    comparisonCoins: string[];
    tradeMode: 'buy' | 'sell';

    // Actions
    loadData: () => Promise<void>;
    createProfile: (name: string) => void;
    deleteProfile: (id: string) => void;
    selectProfile: (id: string) => void;
    logout: () => void;
    selectCoin: (symbol: string) => void;
    toggleComparison: (symbol: string) => void;
    setTradeMode: (mode: 'buy' | 'sell') => void;
    executeTrade: (amount: number) => boolean;
    advanceDay: () => void;
    togglePlay: () => void;
    setPlaySpeed: (speed: number) => void;
    resetSimulation: () => void;
}

// Current profile helper type
export type CurrentProfile = Profile | null;

// Chart data type for Lightweight Charts
export interface ChartTheme {
    backgroundColor: string;
    textColor: string;
    lineColor: string;
    areaTopColor: string;
    areaBottomColor: string;
}

// Trade result
export interface TradeResult {
    success: boolean;
    message: string;
    newBalance?: number;
}
