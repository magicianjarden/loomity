import React from 'react';
import { BaseElement, BaseElementProps } from './base-element';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const TableElement: React.FC<BaseElementProps> = (props) => {
  return (
    <BaseElement {...props}>
      <div className="w-full h-full overflow-auto p-2">
        <Table>
          <TableHeader>
            <TableRow>
              {props.element.content.data[0].map((cell: string, index: number) => (
                <TableHead key={index}>{cell}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.element.content.data.slice(1).map((row: string[], rowIndex: number) => (
              <TableRow key={rowIndex}>
                {row.map((cell: string, cellIndex: number) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </BaseElement>
  );
};
