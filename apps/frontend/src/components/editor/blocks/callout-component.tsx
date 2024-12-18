import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Info, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

const calloutStyles = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Info,
    iconColor: 'text-blue-500',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
  tip: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-200 dark:border-purple-800',
    icon: Lightbulb,
    iconColor: 'text-purple-500',
  },
};

export const CalloutComponent = ({ node }: { node: any }) => {
  const type = node.attrs.type || 'info';
  const style = calloutStyles[type as keyof typeof calloutStyles];
  const Icon = style.icon;

  return (
    <NodeViewWrapper>
      <div
        className={`my-4 flex gap-3 rounded-lg border p-4 ${style.bg} ${style.border}`}
        data-type="callout"
        data-callout-type={type}
      >
        <div className={`mt-1 flex-shrink-0 ${style.iconColor}`}>
          <Icon size={20} />
        </div>
        <NodeViewContent className="min-w-0 flex-1" />
      </div>
    </NodeViewWrapper>
  );
};
