import fs from 'fs';
import path from 'path';

import { Plugin } from 'vite';
import { counter } from './counter';

export interface OptimizeCssModuleOptions {
  dictionary?: string;
  apply?: 'build' | 'serve';
}

export function optimizeCssModules (options?: OptimizeCssModuleOptions): Plugin {
  const next = counter(options?.dictionary);
  // Create a mapping object to hold original and hashed class names
  const classNameMap: Record<string, string> = {};
  return {
    name: 'custom-optimize-css-modules',
    apply: options?.apply ?? 'build',
    enforce: 'pre',
    transform: (code: string, fileName: string) => {
      if (fileName.includes('.css')) {

        // retrieve each class from the filename
        const classes = extractClassNames(code).sort((a,b) => a.length < b.length ? 1 : -1);
        let modifiedCode = code

        for (let i = 0; i < classes.length; i++) {
          const key = classes[i];
          let hash = classNameMap[key];
          if (!hash) {
            hash = next();
            classNameMap[key] = hash;
          }
          modifiedCode = replaceWordInSourceCode(modifiedCode, key, hash)
        }

        return modifiedCode;
      }
    },

    // Add a hook to write the classNameMap to a file after the build
    buildEnd: () => {
      // Output the mapping to a JSON file
      fs.writeFileSync(path.join(__dirname, 'clsm.json'), JSON.stringify(classNameMap, null, 2));
    }
  };
};

function extractClassNames(css: string): string[] {
  const classNames: Set<string> = new Set();
  const regex = /(?<!\S)\.([a-zA-Z0-9-_]+)(?::[a-zA-Z0-9-_]*)?(?=\s*[,{>\s])|(?<!\S)\.([a-zA-Z0-9-_]+)(?=\s*[(,])/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(css)) !== null) {
    const className = match[1] || match[2]; // Get the class name from matched groups
    if (className && isNaN(Number(className))) { // Exclude numeric strings
      classNames.add(className); // Add the class name to the set
    }
  }

  return Array.from(classNames); // Convert the set to an array
}

function replaceWordInSourceCode(sourceCode: string, wordToReplace: string, replacementWord: string): string {
  const regex = new RegExp(`\\b${wordToReplace}\\b`, 'g'); // Use word boundaries to ensure full word match
  return sourceCode.replace(regex, replacementWord);
}
