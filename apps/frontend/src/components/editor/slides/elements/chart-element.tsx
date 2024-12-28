import React from 'react';
import { BaseElement, BaseElementProps } from './base-element';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const ChartElement: React.FC<BaseElementProps> = (props) => {
  const getChartComponent = () => {
    switch (props.element.content.type) {
      case 'bar':
        return Bar;
      case 'line':
        return Line;
      case 'pie':
        return Pie;
      case 'doughnut':
        return Doughnut;
      default:
        return Bar;
    }
  };

  const ChartComponent = getChartComponent();

  return (
    <BaseElement {...props}>
      <div className="w-full h-full p-4">
        <ChartComponent
          data={props.element.content.data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Chart',
              },
            },
          }}
        />
      </div>
    </BaseElement>
  );
};
