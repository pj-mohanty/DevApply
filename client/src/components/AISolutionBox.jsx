import React from 'react';
import { renderMarkdown } from '../utils/markdown';

export default function AISolutionBox({ content, isCoding = false }) {
  if (!content) return null;

  const baseClass = "prose max-w-none p-4 rounded text-sm";
  const codingClass = "bg-blue-50 font-mono text-blue-900";

  return (
    <div
      className={`${baseClass} ${isCoding ? codingClass : "bg-yellow-50"}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
