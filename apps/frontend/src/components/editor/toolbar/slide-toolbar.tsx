'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Layout,
  LayoutTemplate,
  Copy, 
  Trash2,
  FileText,
  Eye,
  Grid,
  PanelLeft,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ToolbarButton } from './toolbar-button';
import { LayoutPicker } from '../slides/layout-picker';
import { SlideLayout } from '../slides/types';

interface SlideToolbarProps {
  editor: Editor;
  onToggleNotes?: () => void;
  showNotes?: boolean;
}

export function SlideToolbar({ editor, onToggleNotes, showNotes }: SlideToolbarProps) {
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);

  const handleLayoutSelect = (layout: SlideLayout) => {
    // TODO: Apply the selected layout to the current slide
    editor.chain().focus().updateAttributes('slide', {
      layout: layout.id,
      structure: layout.structure,
    }).run();
  };

  const duplicateSlide = () => {
    const attrs = editor.getAttributes('slide');
    editor.chain().focus().insertContentAt(editor.state.selection.to + 1, {
      type: 'slide',
      attrs: { ...attrs },
    }).run();
  };

  const deleteSlide = () => {
    editor.chain().focus().deleteSlide().run();
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Layout */}
        <ToolbarButton
          icon={Layout}
          tooltip="Change Layout"
          onClick={() => setShowLayoutPicker(true)}
        />
        <ToolbarButton
          icon={LayoutTemplate}
          tooltip="Save as Template"
          onClick={() => {/* TODO: Implement save as template */}}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Grid and Guides */}
        <ToolbarButton
          icon={Grid}
          tooltip="Toggle Grid"
          onClick={() => {/* TODO: Implement grid toggle */}}
        />
        <ToolbarButton
          icon={PanelLeft}
          tooltip="Toggle Guides"
          onClick={() => {/* TODO: Implement guides toggle */}}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Notes */}
        <ToolbarButton
          icon={FileText}
          tooltip="Speaker Notes"
          onClick={onToggleNotes}
          isActive={showNotes}
        />
        <ToolbarButton
          icon={Eye}
          tooltip="Preview"
          onClick={() => {/* TODO: Implement preview */}}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Slide Actions */}
        <ToolbarButton
          icon={Copy}
          tooltip="Duplicate Slide"
          onClick={duplicateSlide}
        />
        <ToolbarButton
          icon={Trash2}
          tooltip="Delete Slide"
          onClick={deleteSlide}
        />
      </div>

      <LayoutPicker
        open={showLayoutPicker}
        onOpenChange={setShowLayoutPicker}
        onSelectLayout={handleLayoutSelect}
      />
    </>
  );
}
