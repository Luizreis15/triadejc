import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  lineClamp?: number;
}

/**
 * A simple Markdown preview that strips heavy formatting and shows clean text
 */
export function MarkdownPreview({ content, className, lineClamp = 3 }: MarkdownPreviewProps) {
  // Strip markdown syntax for preview (simpler display)
  const stripMarkdown = (text: string): string => {
    return text
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove horizontal rules
      .replace(/^[-*_]{3,}$/gm, '')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove blockquotes
      .replace(/^>\s+/gm, '')
      // Remove bullet points but keep text
      .replace(/^[-*+]\s+/gm, '• ')
      // Remove numbered lists markers
      .replace(/^\d+\.\s+/gm, '')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const cleanText = stripMarkdown(content);

  return (
    <p className={cn(
      "text-sm text-muted-foreground",
      lineClamp === 3 && "line-clamp-3",
      lineClamp === 4 && "line-clamp-4",
      lineClamp === 5 && "line-clamp-5",
      className
    )}>
      {cleanText}
    </p>
  );
}

// Full Markdown renderer with styled components
const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="font-serif text-2xl font-bold mb-4 mt-6 text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="font-serif text-xl font-semibold mt-8 mb-4 text-foreground border-b border-border/30 pb-2">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="font-serif text-lg font-medium mt-6 mb-3 text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="font-medium mt-4 mb-2 text-foreground">
      {children}
    </h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-foreground/90 leading-relaxed mb-4">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="space-y-2 my-4 ml-1">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="space-y-2 my-4 ml-1 list-decimal list-inside">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="flex items-start gap-3 text-foreground/90 leading-relaxed">
      <span className="w-2 h-2 bg-primary/60 rounded-full mt-2 flex-shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary/40 pl-4 py-2 my-6 bg-muted/30 rounded-r-lg italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-foreground/80">{children}</em>
  ),
  hr: () => (
    <hr className="my-8 border-border/50" />
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
    >
      {children}
    </a>
  ),
};

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("max-w-none", className)}>
      <ReactMarkdown components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
