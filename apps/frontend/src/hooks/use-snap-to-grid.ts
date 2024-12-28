import { useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface SnapResult {
  x: number;
  y: number;
  snapLines: {
    vertical: number[];
    horizontal: number[];
  };
}

interface UseSnapToGridOptions {
  gridSize?: number;
  threshold?: number;
  elements: Array<{
    id: string;
    position: Position;
    size: Size;
  }>;
}

export const useSnapToGrid = ({
  gridSize = 8,
  threshold = 5,
  elements,
}: UseSnapToGridOptions) => {
  const snapToGrid = useCallback(
    (currentId: string, position: Position, size: Size): SnapResult => {
      const snapLines = {
        vertical: [] as number[],
        horizontal: [] as number[],
      };

      let { x, y } = position;

      // Snap to grid
      const snapToGridValue = (value: number) => {
        const remainder = value % gridSize;
        if (remainder < threshold) {
          return value - remainder;
        }
        if (remainder > gridSize - threshold) {
          return value + (gridSize - remainder);
        }
        return value;
      };

      x = snapToGridValue(x);
      y = snapToGridValue(y);

      // Snap to other elements
      const currentRight = x + size.width;
      const currentBottom = y + size.height;
      const currentCenter = {
        x: x + size.width / 2,
        y: y + size.height / 2,
      };

      elements
        .filter((el) => el.id !== currentId)
        .forEach((element) => {
          const elementRight = element.position.x + element.size.width;
          const elementBottom = element.position.y + element.size.height;
          const elementCenter = {
            x: element.position.x + element.size.width / 2,
            y: element.position.y + element.size.height / 2,
          };

          // Vertical snap lines
          const verticalSnapPoints = [
            { value: element.position.x, target: x }, // Left to left
            { value: elementRight, target: currentRight }, // Right to right
            { value: elementCenter.x, target: currentCenter.x }, // Center to center
            { value: element.position.x, target: currentRight }, // Right to left
            { value: elementRight, target: x }, // Left to right
          ];

          verticalSnapPoints.forEach(({ value, target }) => {
            if (Math.abs(value - target) < threshold) {
              x += value - target;
              snapLines.vertical.push(value);
            }
          });

          // Horizontal snap lines
          const horizontalSnapPoints = [
            { value: element.position.y, target: y }, // Top to top
            { value: elementBottom, target: currentBottom }, // Bottom to bottom
            { value: elementCenter.y, target: currentCenter.y }, // Center to center
            { value: element.position.y, target: currentBottom }, // Bottom to top
            { value: elementBottom, target: y }, // Top to bottom
          ];

          horizontalSnapPoints.forEach(({ value, target }) => {
            if (Math.abs(value - target) < threshold) {
              y += value - target;
              snapLines.horizontal.push(value);
            }
          });
        });

      return { x, y, snapLines };
    },
    [gridSize, threshold, elements]
  );

  return snapToGrid;
};
