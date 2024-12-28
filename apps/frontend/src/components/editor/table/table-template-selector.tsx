import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { tableTemplates } from './table-templates';
import { Icon } from '@/components/ui/client-icon';

interface TableTemplateSelectorProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

export const TableTemplateSelector: React.FC<TableTemplateSelectorProps> = ({
  editor,
  isOpen,
  onClose,
}) => {
  const handleTemplateSelect = (templateKey: string) => {
    editor.chain().focus().setTable({ data: tableTemplates[templateKey] }).run();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose a Table Template</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-auto flex-col items-center justify-start p-6 space-y-4"
            onClick={() => handleTemplateSelect('basic')}
          >
            <Icon name="Table" className="h-8 w-8" />
            <div className="space-y-2 text-left">
              <h3 className="font-semibold">Basic Table</h3>
              <p className="text-sm text-muted-foreground">
                A simple table with three columns
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-center justify-start p-6 space-y-4"
            onClick={() => handleTemplateSelect('taskList')}
          >
            <Icon name="CheckSquare" className="h-8 w-8" />
            <div className="space-y-2 text-left">
              <h3 className="font-semibold">Task List</h3>
              <p className="text-sm text-muted-foreground">
                Track tasks with status and priority
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-center justify-start p-6 space-y-4"
            onClick={() => handleTemplateSelect('schedule')}
          >
            <Icon name="Calendar" className="h-8 w-8" />
            <div className="space-y-2 text-left">
              <h3 className="font-semibold">Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Weekly schedule with time slots
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-center justify-start p-6 space-y-4"
            onClick={() => handleTemplateSelect('budgetTracker')}
          >
            <Icon name="DollarSign" className="h-8 w-8" />
            <div className="space-y-2 text-left">
              <h3 className="font-semibold">Budget Tracker</h3>
              <p className="text-sm text-muted-foreground">
                Track income and expenses
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-center justify-start p-6 space-y-4"
            onClick={() => handleTemplateSelect('projectTimeline')}
          >
            <Icon name="Timeline" className="h-8 w-8" />
            <div className="space-y-2 text-left">
              <h3 className="font-semibold">Project Timeline</h3>
              <p className="text-sm text-muted-foreground">
                Track project phases and progress
              </p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
