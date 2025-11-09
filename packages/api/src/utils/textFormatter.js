/**
 * Text formatting utility to clean and format Gemini API responses
 * Removes markdown formatting while preserving readability
 */

/**
 * Clean markdown formatting from text
 * @param {string} text - Raw text with markdown
 * @returns {string} - Cleaned text
 */
export function cleanMarkdown(text) {
  if (!text) return '';

  let cleaned = text;

  // First pass: Remove markdown bold (**text** or __text__)
  // Handle multiple occurrences on the same line
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');

  // Remove markdown italic (*text* or _text_) but only if not part of bold
  cleaned = cleaned.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '$1');
  cleaned = cleaned.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '$1');

  // Remove markdown code blocks (```code```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
    // Extract code content and format it nicely
    const code = match.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
    return code;
  });

  // Remove markdown inline code (`code`)
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Remove markdown links but keep the text [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove markdown headers (# Header -> Header)
  cleaned = cleaned.replace(/^#{1,6}\s+(.+)$/gm, '$1');

  // Convert markdown lists to readable format (after cleaning bold/italic)
  cleaned = formatMarkdownLists(cleaned);

  // Clean up multiple consecutive newlines (more than 2)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Final pass: Remove any remaining markdown artifacts
  cleaned = cleaned.replace(/\*\*/g, '');
  cleaned = cleaned.replace(/__/g, '');
  
  // Remove standalone asterisks and underscores that might be leftover
  // But be careful not to remove them if they're part of content
  cleaned = cleaned.replace(/\*\s+/g, '');
  cleaned = cleaned.replace(/\s+\*/g, '');

  // Trim whitespace but preserve intentional spacing
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Convert markdown lists to readable text format
 * Processes lists after markdown formatting has been removed
 * @param {string} text - Text with markdown lists
 * @returns {string} - Text with formatted lists
 */
function formatMarkdownLists(text) {
  // Split into lines to process list items properly
  const lines = text.split('\n');
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a list item by matching the pattern directly
    // Match: optional leading spaces, then *, -, or +, then spaces, then content
    const unorderedMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    if (unorderedMatch) {
      const leadingSpaces = unorderedMatch[1];
      const content = unorderedMatch[2].trim();
      // Determine indentation level (4+ spaces = nested)
      const indentLevel = leadingSpaces.length;
      const bullet = indentLevel >= 4 ? '    ◦' : '  •';
      processedLines.push(`${bullet} ${content}`);
      continue;
    }

    // Check if this is a list item (ordered: 1., 2., etc.)
    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (orderedMatch) {
      const leadingSpaces = orderedMatch[1];
      const content = orderedMatch[2].trim();
      // Determine indentation level (4+ spaces = nested)
      const indentLevel = leadingSpaces.length;
      const bullet = indentLevel >= 4 ? '    ◦' : '  •';
      processedLines.push(`${bullet} ${content}`);
      continue;
    }

    // Regular line - keep as is
    processedLines.push(line);
  }

  return processedLines.join('\n');
}

/**
 * Format text for better display in chat interface
 * Preserves structure while making it more readable
 * @param {string} text - Raw text from API
 * @returns {string} - Formatted text
 */
export function formatTextForDisplay(text) {
  if (!text) return '';

  // First clean markdown
  let formatted = cleanMarkdown(text);

  // Ensure consistent line breaks
  formatted = formatted.replace(/\r\n/g, '\n');
  formatted = formatted.replace(/\r/g, '\n');

  // Clean up spacing around bullet points
  formatted = formatted.replace(/\n\s*[•◦]/g, (match) => {
    // Ensure consistent spacing before bullets
    return '\n  •';
  });

  // Fix spacing issues: remove extra spaces but preserve intentional spacing
  // Don't remove spaces at the start of lines (for indentation)
  formatted = formatted.replace(/[ \t]+$/gm, ''); // Remove trailing spaces

  // Ensure proper spacing after punctuation (but not if it's already there)
  formatted = formatted.replace(/([.,!?;:])([A-Za-z])/g, '$1 $2');

  // Remove HTML tags if any (safety)
  formatted = formatted.replace(/<[^>]+>/g, '');

  // Final cleanup: remove any remaining markdown artifacts
  formatted = formatted.replace(/\*\*/g, '');
  formatted = formatted.replace(/__/g, '');
  
  // Clean up orphaned asterisks/underscores
  formatted = formatted.replace(/\s+\*\s+/g, ' ');
  formatted = formatted.replace(/\s+_\s+/g, ' ');

  return formatted.trim();
}

/**
 * Simple text cleaning - removes markdown but keeps structure
 * This is a lighter version for quick cleaning
 */
export function simpleClean(text) {
  if (!text) return '';

  return text
    // Remove bold
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '$1')
    .replace(/(?<!_)_([^_]+?)_(?!_)/g, '$1')
    // Remove code blocks but keep content
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '$1')
    // Remove inline code markers
    .replace(/`([^`]+)`/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Convert lists to bullets
    .replace(/^[\s]*[-*+]\s+/gm, '  • ')
    .replace(/^[\s]*\d+\.\s+/gm, '  • ')
    // Clean up extra spaces
    .replace(/\n{3,}/g, '\n\n')
    // Remove remaining markdown
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .trim();
}
