import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Profile, WalletEntry } from '../types';
import { loadCryptoData, getPriceForDay } from '../services/dataParser';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Initial balance for new profiles
const INITIAL_BALANCE = 10000;

// Create the store
export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Data
            coins: [],
            historicalData: {},
            isDataLoaded: false,

            // Profiles
            profiles: [],
            currentProfileId: null,

            // Simulation
            currentDay: 0,
            maxDays: 29, // 30 days of data (0-29)
            isPlaying: false,
            playSpeed: 1000,

            // UI State
            selectedCoin: 'BTC',
            comparisonCoins: [],
            tradeMode: 'buy',

            // Actions
            loadData: async () => {
                const { coins, historicalData } = await loadCryptoData();
                set({
                    coins,
                    historicalData,
                    isDataLoaded: true,
                    selectedCoin: coins[0]?.symbol || 'BTC',
                });
            },

            createProfile: (name: string) => {
                const { coins } = get();
                const wallet: WalletEntry[] = coins.map(coin => ({
                    symbol: coin.symbol,
                    name: coin.name,
                    amount: 0,
                    avgBuyPrice: 0,
                }));

                const newProfile: Profile = {
                    id: generateId(),
                    username: name,
                    balance: INITIAL_BALANCE,
                    initialBalance: INITIAL_BALANCE,
                    wallet,
                    createdAt: Date.now(),
                };

                set(state => ({
                    profiles: [...state.profiles, newProfile],
                    currentProfileId: newProfile.id,
                    currentDay: 0,
                    isPlaying: false,
                }));
            },

            deleteProfile: (id: string) => {
                set(state => ({
                    profiles: state.profiles.filter(p => p.id !== id),
                    currentProfileId: state.currentProfileId === id ? null : state.currentProfileId,
                }));
            },

            selectProfile: (id: string) => {
                set({
                    currentProfileId: id,
                    currentDay: 0,
                    isPlaying: false,
                });
            },

            logout: () => {
                set({
                    currentProfileId: null,
                    isPlaying: false,
                });
            },

            selectCoin: (symbol: string) => {
                set({ selectedCoin: symbol });
            },

            toggleComparison: (symbol: string) => {
                set(state => {
                    const coins = state.comparisonCoins;
                    if (coins.includes(symbol)) {
                        return { comparisonCoins: coins.filter(s => s !== symbol) };
                    }
                    if (coins.length >= 4) {
                        return state; // Max 4 comparison coins
                    }
                    return { comparisonCoins: [...coins, symbol] };
                });
            },

            setTradeMode: (mode: 'buy' | 'sell') => {
                set({ tradeMode: mode });
            },

            executeTrade: (amount: number): boolean => {
                const state = get();
                const { currentProfileId, profiles, selectedCoin, tradeMode, historicalData, currentDay } = state;

                if (!currentProfileId || amount <= 0) return false;

                const profileIndex = profiles.findIndex(p => p.id === currentProfileId);
                if (profileIndex === -1) return false;

                const profile = profiles[profileIndex];
                const coinData = historicalData[selectedCoin];
                if (!coinData) return false;

                const currentPrice = getPriceForDay(coinData, currentDay);
                if (currentPrice <= 0) return false;

                const walletIndex = profile.wallet.findIndex(w => w.symbol === selectedCoin);
                if (walletIndex === -1) return false;

                const totalCost = amount * currentPrice;
                const updatedProfiles = [...profiles];
                const updatedProfile = { ...profile, wallet: [...profile.wallet] };
                const updatedWalletEntry = { ...updatedProfile.wallet[walletIndex] };

                if (tradeMode === 'buy') {
                    if (totalCost > profile.balance) return false;

                    // Update average buy price
                    const currentValue = updatedWalletEntry.amount * updatedWalletEntry.avgBuyPrice;
                    const newValue = amount * currentPrice;
                    const totalAmount = updatedWalletEntry.amount + amount;
                    updatedWalletEntry.avgBuyPrice = totalAmount > 0 ? (currentValue + newValue) / totalAmount : currentPrice;
                    updatedWalletEntry.amount = totalAmount;
                    updatedProfile.balance -= totalCost;
                } else {
                    if (amount > updatedWalletEntry.amount) return false;

                    updatedWalletEntry.amount -= amount;
                    if (updatedWalletEntry.amount === 0) {
                        updatedWalletEntry.avgBuyPrice = 0;
                    }
                    updatedProfile.balance += totalCost;
                }

                updatedProfile.wallet[walletIndex] = updatedWalletEntry;
                updatedProfiles[profileIndex] = updatedProfile;

                set({ profiles: updatedProfiles });
                return true;
            },

            advanceDay: () => {
                set(state => {
                    if (state.currentDay >= state.maxDays) {
                        return { isPlaying: false };
                    }
                    return { currentDay: state.currentDay + 1 };
                });
            },

            togglePlay: () => {
                set(state => ({ isPlaying: !state.isPlaying }));
            },

            setPlaySpeed: (speed: number) => {
                set({ playSpeed: speed });
            },

            resetSimulation: () => {
                set({
                    currentDay: 0,
                    isPlaying: false,
                });
            },
        }),
        {
            name: 'coins-storage',
            partialize: (state) => ({
                profiles: state.profiles,
                currentProfileId: state.currentProfileId,
            }),
        }
    )
);

// Selectors
export const useCurrentProfile = () => {
    const profiles = useAppStore(state => state.profiles);
    const currentProfileId = useAppStore(state => state.currentProfileId);
    return profiles.find(p => p.id === currentProfileId) || null;
};

export const useSelectedCoinData = () => {
    const coins = useAppStore(state => state.coins);
    const selectedCoin = useAppStore(state => state.selectedCoin);
    return coins.find(c => c.symbol === selectedCoin);
};

export const useCurrentPrice = (symbol: string) => {
    const historicalData = useAppStore(state => state.historicalData);
    const currentDay = useAppStore(state => state.currentDay);
    const coinData = historicalData[symbol];
    return coinData ? getPriceForDay(coinData, currentDay) : 0;
};

export const useTotalPortfolioValue = () => {
    const profile = useCurrentProfile();
    const historicalData = useAppStore(state => state.historicalData);
    const currentDay = useAppStore(state => state.currentDay);

    if (!profile) return 0;

    let total = profile.balance;
    for (const entry of profile.wallet) {
        if (entry.amount > 0) {
            const coinData = historicalData[entry.symbol];
            const price = coinData ? getPriceForDay(coinData, currentDay) : 0;
            total += entry.amount * price;
        }
    }
    return total;
};
