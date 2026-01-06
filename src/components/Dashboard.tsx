import { Header } from './Header';
import { CoinSelector } from './CoinSelector';
import { PriceChart } from './PriceChart';
import { TradingPanel } from './TradingPanel';
import { WalletTable } from './WalletTable';
import { SimulationControls } from './SimulationControls';

export function Dashboard() {
    return (
        <div className="min-h-screen p-4 lg:p-6">
            <div className="max-w-[1600px] mx-auto">
                <Header />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                    {/* Left Column - Coin Selection */}
                    <div className="lg:col-span-12">
                        <CoinSelector />
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-4 lg:space-y-6">
                        {/* Chart */}
                        <PriceChart />

                        {/* Wallet */}
                        <WalletTable />
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4 space-y-4 lg:space-y-6">
                        {/* Simulation Controls */}
                        <SimulationControls />

                        {/* Trading Panel */}
                        <TradingPanel />
                    </div>
                </div>
            </div>
        </div>
    );
}
