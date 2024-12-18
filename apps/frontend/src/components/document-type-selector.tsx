'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, FileCode, Presentation, FileMarkdown } from 'lucide-react';

interface DocumentTypeSelectorProps {
  currentType: string;
  documentId: string;
}

export function DocumentTypeSelector({ currentType, documentId }: DocumentTypeSelectorProps) {
  const router = useRouter();

  const handleTypeChange = (newType: string) => {
    router.push(`/documents/${newType}/${documentId}`);
  };

  return (
    <Select value={currentType} onValueChange={handleTypeChange}>
      <SelectTrigger className="w-[180px]">
        {currentType === 'default' && <FileText className="w-4 h-4 mr-2" />}
        {currentType === 'code' && <FileCode className="w-4 h-4 mr-2" />}
        {currentType === 'powerpoint' && <Presentation className="w-4 h-4 mr-2" />}
        {currentType === 'markdown' && <FileMarkdown className="w-4 h-4 mr-2" />}
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Default
          </div>
        </SelectItem>
        <SelectItem value="code">
          <div className="flex items-center">
            <FileCode className="w-4 h-4 mr-2" />
            Code
          </div>
        </SelectItem>
        <SelectItem value="powerpoint">
          <div className="flex items-center">
            <Presentation className="w-4 h-4 mr-2" />
            PowerPoint
          </div>
        </SelectItem>
        <SelectItem value="markdown">
          <div className="flex items-center">
            <FileMarkdown className="w-4 h-4 mr-2" />
            Markdown
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
