import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CellValidation, TableColumn } from '../table-types';
import { useTableStore } from '../table-store';
import { getTableHistory } from '../utils/table-history';

const validationSchema = z.object({
  required: z.boolean(),
  min: z.string().optional(),
  max: z.string().optional(),
  pattern: z.string().optional(),
  errorMessage: z.string().optional(),
});

interface TableValidationMenuProps {
  column: TableColumn;
}

export const TableValidationMenu: React.FC<TableValidationMenuProps> = ({
  column,
}) => {
  const { data, setData } = useTableStore();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      required: column.validation?.required || false,
      min: column.validation?.min?.toString() || '',
      max: column.validation?.max?.toString() || '',
      pattern: column.validation?.pattern || '',
      errorMessage: column.validation?.errorMessage || '',
    },
  });

  const onSubmit = (values: z.infer<typeof validationSchema>) => {
    const newData = { ...data };
    const targetColumn = newData.columns.find(col => col.id === column.id);
    if (!targetColumn) return;

    const validation: CellValidation = {
      required: values.required,
    };

    if (values.min) {
      validation.min = column.format?.type === 'date' ? 
        new Date(values.min).toISOString() :
        Number(values.min);
    }

    if (values.max) {
      validation.max = column.format?.type === 'date' ?
        new Date(values.max).toISOString() :
        Number(values.max);
    }

    if (values.pattern) {
      validation.pattern = values.pattern;
    }

    if (values.errorMessage) {
      validation.errorMessage = values.errorMessage;
    }

    targetColumn.validation = validation;

    // Validate all existing cells in this column
    newData.rows.forEach(row => {
      const cell = row.cells[column.id];
      if (cell) {
        const error = validateCell(cell.value, validation, column.format);
        if (error) {
          cell.error = error;
        } else {
          delete cell.error;
        }
      }
    });

    setData(newData);
    getTableHistory(data).record(newData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Set Validation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Column Validation Rules</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Required</FormLabel>
                    <FormDescription>
                      Make this field required
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {(column.format?.type === 'number' ||
              column.format?.type === 'currency' ||
              column.format?.type === 'percentage' ||
              column.format?.type === 'date') && (
              <>
                <FormField
                  control={form.control}
                  name="min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Value</FormLabel>
                      <FormControl>
                        <Input
                          type={column.format?.type === 'date' ? 'date' : 'number'}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Value</FormLabel>
                      <FormControl>
                        <Input
                          type={column.format?.type === 'date' ? 'date' : 'number'}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            {column.format?.type === 'text' && (
              <FormField
                control={form.control}
                name="pattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pattern (Regex)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a regular expression pattern for validation
                    </FormDescription>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="errorMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Error Message</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Custom error message to display when validation fails
                  </FormDescription>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save Validation Rules</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
