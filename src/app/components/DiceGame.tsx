"use client"
import React, { useState, useEffect } from 'react';
import { generateRandomString } from '../utils/random';

interface GameState {
  balance: number;
  lastRoll: number | null;
  isWin: boolean | null;
  rolling: boolean;
  history: GameHistoryItem[];
  verificationData: VerificationData | null;
  walletConnected: boolean;
  walletAddress: string | null;
}

interface GameHistoryItem {
  roll: number | null;
  betAmount: number;
  isWin: boolean | null;
  balanceChange: number;
  timestamp: Date;
}

interface VerificationData {
  clientSeed: string;
  serverSeed: string;
  combinedSeed: string;
  hash: string;
  diceRoll: number;
}

// 3D Dice Face component
const DiceFace = ({ value, rolling }: { value: number | null; rolling: boolean }) => {
  // If no value, show a question mark
  if (value === null) {
    return (
      <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300">
        <span className="text-gray-400 text-3xl font-bold">?</span>
      </div>
    );
  }

  // Array of dots positions for each dice face
  const dotPositions = {
    1: [{ top: '50%', left: '50%' }],
    2: [
      { top: '25%', left: '25%' },
      { top: '75%', left: '75%' },
    ],
    3: [
      { top: '25%', left: '25%' },
      { top: '50%', left: '50%' },
      { top: '75%', left: '75%' },
    ],
    4: [
      { top: '25%', left: '25%' },
      { top: '25%', left: '75%' },
      { top: '75%', left: '25%' },
      { top: '75%', left: '75%' },
    ],
    5: [
      { top: '25%', left: '25%' },
      { top: '25%', left: '75%' },
      { top: '50%', left: '50%' },
      { top: '75%', left: '25%' },
      { top: '75%', left: '75%' },
    ],
    6: [
      { top: '25%', left: '25%' },
      { top: '25%', left: '50%' },
      { top: '25%', left: '75%' },
      { top: '75%', left: '25%' },
      { top: '75%', left: '50%' },
      { top: '75%', left: '75%' },
    ],
  };

  const animationClasses = rolling
    ? 'animate-dice-roll'
    : 'transform-gpu transition-all duration-500 hover:rotate-y-180';

  return (
    <div 
      className={`w-32 h-32 bg-gradient-to-br from-white to-gray-200 rounded-xl flex items-center justify-center relative shadow-xl ${animationClasses} dice-3d`}
      style={{ perspective: '1000px' }}
    >
      {dotPositions[value as keyof typeof dotPositions].map((position, index) => (
        <div
          key={index}
          className="absolute w-6 h-6 bg-black rounded-full"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
};

const DiceGame: React.FC = () => {
  // Initialize from localStorage if available
  const getInitialBalance = () => {
    if (typeof window !== 'undefined') {
      const savedBalance = localStorage.getItem('gameBalance');
      return savedBalance ? parseFloat(savedBalance) : 1000;
    }
    return 1000;
  };

  const [gameState, setGameState] = useState<GameState>({
    balance: getInitialBalance(),
    lastRoll: null,
    isWin: null,
    rolling: false,
    history: [],
    verificationData: null,
    walletConnected: false,
    walletAddress: null
  });
  
  const [betAmount, setBetAmount] = useState<string>('10');
  const [clientSeed, setClientSeed] = useState<string>(generateRandomString(16));
  const [showVerification, setShowVerification] = useState<boolean>(false);

  // Save balance to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gameBalance', gameState.balance.toString());
    }
  }, [gameState.balance]);

  // Load game history from localStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('gameHistory');
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          // Restore Date objects which were serialized
          const history = parsedHistory.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setGameState(prev => ({ ...prev, history }));
        } catch (e) {
          console.error('Failed to parse game history:', e);
        }
      }
    }
  }, []);

  // Save game history to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && gameState.history.length > 0) {
      localStorage.setItem('gameHistory', JSON.stringify(gameState.history));
    }
  }, [gameState.history]);

  // Function to reset/top up balance
  const handleTopUpBalance = () => {
    setGameState(prev => ({
      ...prev,
      balance: 1000, // Reset to initial balance
      history: [
        {
          roll: null,
          betAmount: 0,
          isWin: null,
          balanceChange: 1000 - prev.balance,
          timestamp: new Date(),
        },
        ...prev.history,
      ].slice(0, 10),
    }));
  };

  // Function to check if balance is low
  const isBalanceLow = () => {
    return gameState.balance < 100; // Consider balance low if under 100
  };

  // Function to validate bet amount
  const validateBet = (amount: number) => {
    if (amount <= 0) {
      return { valid: false, message: 'Bet amount must be greater than 0' };
    }
    if (amount > gameState.balance) {
      return { valid: false, message: 'Not enough balance for this bet' };
    }
    if (amount > 100000) { // Add maximum bet limit
      return { valid: false, message: 'Bet amount exceeds maximum limit of ₹100,000' };
    }
    return { valid: true, message: '' };
  };

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive numbers with up to 2 decimal places
    if (!isNaN(Number(value)) && Number(value) >= 0) {
      const formatted = Number(value).toFixed(2);
      setBetAmount(formatted);
    }
  };

  const handleHalfBet = () => {
    const newAmount = Math.max(1, Number(betAmount) / 2);
    setBetAmount(newAmount.toFixed(2));
  };

  const handleDoubleBet = () => {
    const newAmount = Math.min(gameState.balance, Number(betAmount) * 2);
    setBetAmount(newAmount.toFixed(2));
  };

  // Simulated Web3 wallet connection
  const connectWallet = async () => {
    try {
      // In a real app, we'd use window.ethereum to request accounts
      // For this demo, we'll simulate it
      setGameState(prev => ({ 
        ...prev, 
        walletConnected: true,
        walletAddress: '0x' + Math.random().toString(16).substring(2, 14) + '...'
      }));
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Make sure you have a Web3 provider installed.');
    }
  };

  const handleRollDice = async () => {
    const betValidation = validateBet(Number(betAmount));
    if (!betValidation.valid) {
      alert(betValidation.message);
      return;
    }

    setGameState(prev => ({ ...prev, rolling: true }));

    try {
      const response = await fetch('/api/roll-dice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          betAmount: Number(betAmount),
          clientSeed
        }),
      });

      if (!response.ok) {
        throw new Error('Error rolling dice');
      }

      const data = await response.json();
      
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          lastRoll: data.diceRoll,
          isWin: data.isWin,
          balance: prev.balance + data.amountChange,
          rolling: false,
          history: [
            {
              roll: data.diceRoll,
              betAmount: Number(betAmount),
              isWin: data.isWin,
              balanceChange: data.amountChange,
              timestamp: new Date(),
            },
            ...prev.history,
          ].slice(0, 10),
          verificationData: data.verificationData,
        }));

        setClientSeed(generateRandomString(16));
      }, 1500);
    } catch (error) {
      console.error('Error rolling dice:', error);
      setGameState(prev => ({ ...prev, rolling: false }));
      alert('Failed to roll dice. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-gradient-to-br from-[#1a2a36] to-[#0f172a] text-white rounded-xl shadow-2xl overflow-hidden">
      {/* Header with balance */}
      <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold gradient-text mb-4 md:mb-0">Dice Game</h1>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center md:items-end">
            <span className="text-gray-400 text-sm">Your Balance</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${isBalanceLow() ? 'text-red-400' : 'text-green-400'}`}>
                ₹{gameState.balance.toFixed(2)}
              </span>
              <button
                onClick={handleTopUpBalance}
                className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-full transition-colors"
                title="Reset balance to ₹1,000"
              >
                Top Up
              </button>
            </div>
            {isBalanceLow() && (
              <span className="text-xs text-red-400 mt-1">Balance is running low!</span>
            )}
          </div>
          {!gameState.walletConnected ? (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium transition-colors"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="px-4 py-2 bg-[#253442] rounded-full text-sm">
              {gameState.walletAddress}
            </div>
          )}
        </div>
      </div>
      
      {/* Main game area */}
      <div className="flex flex-col md:flex-row">
        {/* Left panel - Dice and result */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
          <div className="mb-8">
            <DiceFace value={gameState.lastRoll} rolling={gameState.rolling} />
          </div>
          
          {gameState.lastRoll !== null && !gameState.rolling && (
            <div className={`text-center mb-6 ${gameState.isWin ? 'text-green-400' : 'text-red-400'}`}>
              <p className="text-xl font-bold">
                {gameState.isWin ? 'You Win!' : 'You Lose!'}
              </p>
              <p className="text-sm">
                {gameState.isWin 
                  ? `+₹${(Number(betAmount)).toFixed(2)}` 
                  : `-₹${Number(betAmount).toFixed(2)}`}
              </p>
            </div>
          )}
          
          <div className="p-4 rounded-lg bg-[#253442] max-w-xs mx-auto mb-6">
            <p className="text-center text-sm">
              Roll 4, 5, or 6 to win (2x payout) <br/>
              Roll 1, 2, or 3 to lose your bet
            </p>
          </div>
        </div>
        
        {/* Right panel - Bet controls */}
        <div className="w-full md:w-96 p-8 border-t md:border-t-0 md:border-l border-gray-800 flex flex-col">
          <h2 className="text-xl font-semibold mb-6">Place Your Bet</h2>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Bet Amount</span>
              <div className="flex gap-2">
                <button 
                  onClick={handleHalfBet}
                  className="text-xs bg-[#253442] hover:bg-[#2e404f] px-2 py-1 rounded transition-colors"
                  disabled={gameState.rolling}
                >
                  ½
                </button>
                <button 
                  onClick={handleDoubleBet}
                  className="text-xs bg-[#253442] hover:bg-[#2e404f] px-2 py-1 rounded transition-colors"
                  disabled={gameState.rolling}
                >
                  2×
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                className="w-full bg-[#253442] border border-gray-700 rounded-lg py-3 px-4 text-white pr-12"
                value={betAmount}
                onChange={handleBetAmountChange}
                min="1"
                max={gameState.balance}
                step="0.01"
                disabled={gameState.rolling}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
            </div>
            {Number(betAmount) > gameState.balance && (
              <p className="text-red-400 text-xs mt-1">
                Insufficient balance. {gameState.balance < 100 && 'Consider topping up!'}
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Client Seed</span>
              <button 
                onClick={() => setClientSeed(generateRandomString(16))}
                className="text-xs text-blue-400 hover:underline"
              >
                Refresh
              </button>
            </div>
            <input
              type="text"
              className="w-full bg-[#253442] border border-gray-700 rounded-lg py-3 px-4 text-white text-sm"
              value={clientSeed}
              onChange={(e) => setClientSeed(e.target.value)}
              disabled={gameState.rolling}
            />
          </div>
          
          <button
            onClick={handleRollDice}
            disabled={gameState.rolling || Number(betAmount) > gameState.balance}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {gameState.rolling ? 'Rolling...' : 'Roll Dice'}
          </button>
          
          {/* Game history with top-up records */}
          {gameState.history.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="max-h-60 overflow-y-auto rounded-lg">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#253442]">
                      <th className="p-2 text-left rounded-tl-lg">Roll</th>
                      <th className="p-2 text-left">Bet</th>
                      <th className="p-2 text-left">Result</th>
                      <th className="p-2 text-right rounded-tr-lg">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameState.history.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-black bg-opacity-20' : ''}>
                        <td className="p-2">{item.roll ?? '—'}</td>
                        <td className="p-2">{item.betAmount > 0 ? `₹${item.betAmount.toFixed(2)}` : '—'}</td>
                        <td className="p-2">
                          {item.roll === null ? (
                            <span className="text-blue-400">Top Up</span>
                          ) : (
                            <span className={item.isWin ? 'text-green-400' : 'text-red-400'}>
                              {item.isWin ? 'Win' : 'Loss'}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          <span className={item.balanceChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {item.balanceChange >= 0 ? '+' : ''}₹{item.balanceChange.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Verification footer */}
      {gameState.verificationData && (
        <div className="p-6 bg-[#152028] border-t border-gray-800">
          <button 
            onClick={() => setShowVerification(!showVerification)}
            className="text-blue-400 hover:underline text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {showVerification ? 'Hide Verification' : 'Show Provably Fair Verification'}
          </button>
          
          {showVerification && (
            <div className="mt-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#253442] rounded-lg">
                  <h3 className="font-semibold mb-2">Client Data</h3>
                  <p className="mb-2 text-xs break-all"><span className="text-gray-400">Client Seed:</span> {gameState.verificationData.clientSeed}</p>
                </div>
                <div className="p-4 bg-[#253442] rounded-lg">
                  <h3 className="font-semibold mb-2">Server Data</h3>
                  <p className="mb-2 text-xs break-all"><span className="text-gray-400">Server Seed:</span> {gameState.verificationData.serverSeed}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-[#253442] rounded-lg">
                <h3 className="font-semibold mb-2">Verification</h3>
                <p className="mb-2 text-xs break-all"><span className="text-gray-400">Combined Seed:</span> {gameState.verificationData.combinedSeed}</p>
                <p className="mb-2 text-xs break-all"><span className="text-gray-400">SHA-256 Hash:</span> {gameState.verificationData.hash}</p>
                <p className="mb-2 text-xs"><span className="text-gray-400">Resulting Roll:</span> {gameState.verificationData.diceRoll}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiceGame; 