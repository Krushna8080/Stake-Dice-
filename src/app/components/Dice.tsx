import React from 'react';

interface DiceProps {
  value: number | null;
  rolling: boolean;
}

const DicePattern = {
  1: [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ],
  2: [
    [1, 0, 0],
    [0, 0, 0],
    [0, 0, 1],
  ],
  3: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  4: [
    [1, 0, 1],
    [0, 0, 0],
    [1, 0, 1],
  ],
  5: [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1],
  ],
  6: [
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
  ],
};

const Dice: React.FC<DiceProps> = ({ value, rolling }) => {
  const pattern = value !== null ? DicePattern[value as keyof typeof DicePattern] : null;

  return (
    <div className={`w-24 h-24 bg-gray-800 rounded-lg p-4 flex items-center justify-center shadow-lg transition-transform duration-200 ${rolling ? 'animate-spin' : ''}`}>
      {pattern ? (
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full">
          {pattern.flat().map((dot, index) => (
            <div
              key={index}
              className={`rounded-full ${dot ? 'bg-white' : 'bg-transparent'}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-3xl">?</div>
      )}
    </div>
  );
};

export default Dice; 