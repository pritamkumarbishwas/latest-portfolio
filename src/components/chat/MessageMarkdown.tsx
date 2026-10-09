"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MessageMarkdown({ text }: { text: string }) {
  return (
    <div className="prose prose-sm max-w-none break-words text-inherit prose-p:my-1.5 prose-p:first:mt-0 prose-p:last:mb-0 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-li:pl-0.5 prose-li:leading-snug prose-a:text-accent-text prose-a:no-underline hover:prose-a:underline dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
