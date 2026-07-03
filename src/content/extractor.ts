export interface ExtractedContent {
  title: string;
  url: string;
  content: string;
  selectedText?: string;
}

export function extractPageContent(): ExtractedContent {
  const title = document.title;
  const url = window.location.href;
  const selectedText = window.getSelection()?.toString();

  // Elements to ignore
  const ignoreTags = ['script', 'style', 'noscript', 'iframe', 'ad', 'footer', 'nav', 'header', 'aside'];
  const ignoreClasses = ['ad', 'banner', 'cookie', 'navigation', 'footer', 'social-share'];

  function isVisible(el: HTMLElement): boolean {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function shouldIgnore(el: Element): boolean {
    const tagName = el.tagName.toLowerCase();
    if (ignoreTags.includes(tagName)) return true;

    const className = el.className;
    if (typeof className === 'string') {
      const lowerClass = className.toLowerCase();
      if (ignoreClasses.some(cls => lowerClass.includes(cls))) return true;
    }

    const role = el.getAttribute('role');
    if (role && ['complementary', 'navigation', 'contentinfo', 'banner'].includes(role)) return true;

    return false;
  }

  const sections: string[] = [];

  function traverse(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (!isVisible(el) || shouldIgnore(el)) return;

      const tagName = el.tagName.toLowerCase();
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        sections.push(`# ${el.innerText.trim()}`);
      } else if (tagName === 'p') {
        const text = el.innerText.trim();
        if (text.length > 20) sections.push(text);
      } else if (tagName === 'table') {
         // Basic table extraction
         const tableText = Array.from(el.querySelectorAll('tr'))
          .map(tr => Array.from(tr.querySelectorAll('td, th')).map(td => (td as HTMLElement).innerText.trim()).join(' | '))
          .join('\n');
         if (tableText) sections.push(tableText);
      } else if (tagName === 'pre' || tagName === 'code') {
         const codeText = el.innerText.trim();
         if (codeText) sections.push(`\`\`\`\n${codeText}\n\`\`\``);
      } else {
        for (const child of Array.from(node.childNodes)) {
          traverse(child);
        }
      }
    }
  }

  // Try to target main content area if possible
  const main = document.querySelector('main') || document.querySelector('article') || document.body;
  traverse(main);

  return {
    title,
    url,
    content: sections.join('\n\n'),
    selectedText
  };
}
