import React from 'react';

interface SnapLinesProps {
  vertical: number[];
  horizontal: number[];
  containerWidth: number;
  containerHeight: number;
}

export const SnapLines: React.FC<SnapLinesProps> = ({
  vertical,
  horizontal,
  containerWidth,
  containerHeight,
}) => {
  return (
    <>
      {/* Vertical snap lines */}
      {vertical.map((x) => (
        <div
          key={`v-${x}`}
          style={{
            position: 'absolute',
            top: 0,
            left: x,
            width: 1,
            height: containerHeight,
            backgroundColor: '#1a73e8',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Horizontal snap lines */}
      {horizontal.map((y) => (
        <div
          key={`h-${y}`}
          style={{
            position: 'absolute',
            top: y,
            left: 0,
            width: containerWidth,
            height: 1,
            backgroundColor: '#1a73e8',
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
};
