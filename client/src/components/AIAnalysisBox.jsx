import React from 'react';
import PropTypes from 'prop-types';
import { renderMarkdown } from '../utils/markdown';

export default function AIAnalysisBox({ content, isCoding = false }) {
  // Handle different content types safely
  const getSafeContent = () => {
    if (!content) return 'No content available';
    
    // If content is already a string
    if (typeof content === 'string') return content;
    
    // If content is an object, try to stringify it
    if (typeof content === 'object') {
      try {
        return JSON.stringify(content, null, 2);
      } catch (e) {
        return 'Could not parse content';
      }
    }
    
    // For any other type, convert to string
    return String(content);
  };

  // Safely render markdown with fallback
  const renderContent = () => {
    try {
      return renderMarkdown(getSafeContent());
    } catch (e) {
      console.error('Markdown rendering error:', e);
      return `<div class="error">Could not render content</div>`;
    }
  };

  const baseClass = "prose max-w-none p-4 rounded text-sm";
  const codingClass = "bg-blue-50 font-mono text-blue-900";

  return (
    <div className={`${baseClass} ${isCoding ? codingClass : "bg-gray-100"}`}>
      <div dangerouslySetInnerHTML={{ __html: renderContent() }} />
    </div>
  );
}

AIAnalysisBox.propTypes = {
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  isCoding: PropTypes.bool,
};
