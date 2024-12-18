'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Download,
  Image as ImageIcon,
  Layout,
  Palette,
  Play,
  Type,
  FileText,
  MonitorPlay,
  Plus,
  Presentation,
  Settings,
  PanelLeft,
  Grid,
  LayoutTemplate,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ToolbarButton } from './toolbar-button';

interface PresentationToolbarProps {
  editor: Editor;
  onOpenManager: () => void;
}

export function PresentationToolbar({ editor, onOpenManager }: PresentationToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Slide Management */}
      <ToolbarButton
        icon={Plus}
        tooltip="Add New Slide"
        onClick={() => editor.commands.setSlide()}
      />
      <ToolbarButton
        icon={PanelLeft}
        tooltip="Slide Manager"
        onClick={onOpenManager}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Slide Design */}
      <ToolbarButton
        icon={Layout}
        tooltip="Slide Layout"
        onClick={() => {/* TODO: Implement layout selection */}}
      />
      <ToolbarButton
        icon={LayoutTemplate}
        tooltip="Slide Template"
        onClick={() => {/* TODO: Implement template selection */}}
      />
      <ToolbarButton
        icon={Palette}
        tooltip="Theme"
        onClick={() => {/* TODO: Implement theme selection */}}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Content */}
      <ToolbarButton
        icon={Type}
        tooltip="Add Text"
        onClick={() => editor.chain().focus().setTextSelection(editor.state.selection.from).run()}
      />
      <ToolbarButton
        icon={ImageIcon}
        tooltip="Add Image"
        onClick={() => {/* TODO: Implement image upload */}}
      />
      <ToolbarButton
        icon={Grid}
        tooltip="Add Grid"
        onClick={() => {/* TODO: Implement grid insertion */}}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Actions */}
      <ToolbarButton
        icon={Play}
        tooltip="Preview"
        onClick={() => {/* TODO: Implement preview */}}
      />
      <ToolbarButton
        icon={MonitorPlay}
        tooltip="Present"
        onClick={() => {/* TODO: Implement presentation mode */}}
      />
      <ToolbarButton
        icon={Download}
        tooltip="Export"
        onClick={() => {/* TODO: Implement export */}}
      />
      <ToolbarButton
        icon={Settings}
        tooltip="Settings"
        onClick={() => {/* TODO: Implement settings */}}
      />
    </div>
  );
}
