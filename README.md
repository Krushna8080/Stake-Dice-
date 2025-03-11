Live-https://stake-dice.vercel.app/

# Provably Fair Dice Game

A simple dice game with provably fair mechanics built with Next.js, featuring a modern slider-based UI.

## Game Rules

- Players enter a bet amount
- Roll the dice to get a random number 1-6, visualized on a 0-100 slider
- If the roll is 4, 5, or 6 (over 50 on slider) → Player wins (2x payout)
- If the roll is 1, 2, or 3 (under 50 on slider) → Player loses (bet is deducted)

## Provably Fair System

This game implements a provably fair system using SHA-256 hashing:

1. The player is assigned a random client seed (or can provide their own)
2. When the player rolls, the server generates a random server seed
3. The client seed and server seed are combined and hashed with SHA-256
4. The resulting hash is used to deterministically generate the dice roll
5. All verification data is provided to the player after each roll

## Features

- Modern slider-based UI with intuitive visualization
- Responsive design for mobile and desktop
- Local storage for persistent balance and game history
- Simulated Web3 wallet connection (optional feature)
- Dark theme with clean, sleek design
- Detailed verification data for provable fairness

## Technologies Used

- Next.js App Router
- TypeScript
- Tailwind CSS
- Web3 wallet simulation
- Local storage for persistence
- SHA-256 cryptographic hashing

## Project Structure

- `src/app/page.tsx` - Main page component
- `src/app/components/DiceGame.tsx` - Main game component with slider UI
- `src/app/api/roll-dice/route.ts` - API endpoint for rolling dice
- `src/app/utils/random.ts` - Utility for generating random strings
- `src/app/globals.css` - Global styles
- `netlify.toml` - Netlify deployment configuration

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to play the game.


## License

MIT License - Feel free to use this code for your projects

## Project Structure

- `src/app/page.tsx` - Main page component
- `src/app/components/DiceGame.tsx` - Main game component
- `src/app/components/Dice.tsx` - Dice visualization component
- `src/app/api/roll-dice/route.ts` - API endpoint for rolling dice
- `src/app/utils/random.ts` - Utility for generating random strings

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
