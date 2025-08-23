// client/src/utils/markdown.js
import { marked } from 'marked';
import Prism from 'prismjs';

import 'prismjs/themes/prism.css'; 
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-ruby';
// Add more Prism language support if needed

marked.setOptions({
  highlight: (code, lang) => {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  },
});

export const renderMarkdown = (text) => marked.parse(text || '');
