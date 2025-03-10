import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Provably fair dice roll implementation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { betAmount, clientSeed } = body;
    
    if (!betAmount || isNaN(Number(betAmount)) || Number(betAmount) <= 0) {
      return NextResponse.json({ error: 'Invalid bet amount' }, { status: 400 });
    }
    
    // Generate server seed (random value that will be used for rolling)
    const serverSeed = crypto.randomBytes(32).toString('hex');
    
    // Combine client seed and server seed for fairness
    const combinedSeed = clientSeed + serverSeed;
    const hash = crypto.createHash('sha256').update(combinedSeed).digest('hex');
    
    // Use first 8 characters of the hash to determine the dice roll (1-6)
    const decimalValue = parseInt(hash.substring(0, 8), 16);
    // Get a number from 1-6
    const diceRoll = (decimalValue % 6) + 1;
    
    // Determine if the player won (4, 5, or 6 is a win)
    const isWin = diceRoll >= 4;
    const amountChange = isWin ? Number(betAmount) : -Number(betAmount);
    
    return NextResponse.json({
      success: true,
      diceRoll,
      isWin,
      amountChange,
      serverSeed,
      hash,
      verificationData: {
        clientSeed,
        serverSeed,
        combinedSeed,
        hash,
        diceRoll
      }
    });
  } catch (error) {
    console.error('Error in dice roll:', error);
    return NextResponse.json({ error: 'Failed to process bet' }, { status: 500 });
  }
} 