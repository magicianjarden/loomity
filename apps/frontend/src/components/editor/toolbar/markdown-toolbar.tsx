'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading,
  Link,
  Image,
  Code,
  Eye,
  Download
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function MarkdownToolbar({ editor }: { editor: any }) {
  return (
    <div className="flex items-center gap-2 p-2">
      {/* Text Formatting */}
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="w-4 h-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-2" />

      {/* Lists */}
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="w-4 h-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-2" />

      {/* Block Elements */}
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="w-4 h-4" />
      </Button>

      {/* Heading Level */}
      <Select onValueChange={(value) => editor.chain().focus().toggleHeading({ level: parseInt(value) }).run()}>
        <SelectTrigger className="w-[130px]">
          <Heading className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Heading" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Heading 1</SelectItem>
          <SelectItem value="2">Heading 2</SelectItem>
          <SelectItem value="3">Heading 3</SelectItem>
          <SelectItem value="4">Heading 4</SelectItem>
        </SelectContent>
      </Select>

      <div className="h-6 w-px bg-border mx-2" />

      {/* Insert Elements */}
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleLink().run()}>
        <Link className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.commands.addImage()}>
        <Image className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code className="w-4 h-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-2" />

      {/* View Options */}
      <Button variant="ghost" size="sm" onClick={() => editor.commands.togglePreview()}>
        <Eye className="w-4 h-4 mr-2" />
        Preview
      </Button>

      <Button variant="ghost" size="sm" onClick={() => editor.commands.exportMarkdown()}>
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </div>
  );
}
