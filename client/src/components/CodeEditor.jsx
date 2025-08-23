import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';

const languageExtensions = {
  javascript: javascript(),
  python: python(),
  java: java(),
  c: cpp(),
};

export default function CodeEditor({ value, onChange, language = 'javascript' }) {
  const extension = languageExtensions[language.toLowerCase()] || javascript();

  return (
    <div className="border rounded overflow-hidden">
      <CodeMirror
        value={value}
        height="200px"
        theme={oneDark}
        extensions={[extension]}
        onChange={(val) => onChange(val)}
      />
    </div>
  );
}
