import { cn } from "@/lib/utils";

interface TextHighlightProps {
  text: string;
  query?: string;
  className?: string;
}

export function TextHighlight({ text, query = '', className }: TextHighlightProps) {
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  // First, get all the matches and their positions
  const matches: { text: string, index: number }[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let lastIndex = 0;

  while (lastIndex >= 0) {
    const index = lowerText.indexOf(lowerQuery, lastIndex);
    if (index === -1) break;
    matches.push({
      text: text.slice(index, index + query.length),
      index
    });
    lastIndex = index + query.length;
  }

  // Now build the parts array
  const parts: string[] = [];
  let currentIndex = 0;

  matches.forEach(match => {
    if (currentIndex < match.index) {
      parts.push(text.slice(currentIndex, match.index));
    }
    parts.push(match.text);
    currentIndex = match.index + match.text.length;
  });

  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }

  return (
    <span className={className}>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span 
            key={i} 
            className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}
