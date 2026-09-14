import React from 'react';

interface BilingualTextProps {
  text?: string;
  className?: string;
  subClassName?: string;
  layout?: 'stacked' | 'inline' | 'tag';
  langCode?: string;
}

/**
 * Cleanly renders text in the chosen language:
 * - If langCode is 'en' (English): only shows the primary English portion.
 * - If langCode is a specific regional language: shows only the regional language translation if available, or the cleanest single representation.
 */
export const BilingualText: React.FC<BilingualTextProps> = ({
  text,
  className = '',
  subClassName = '',
  layout = 'stacked',
  langCode,
}) => {
  if (!text) return null;

  const isEnglishOnly = Boolean(langCode && langCode.toLowerCase().startsWith('en'));

  if (text.includes(' / ') || text.includes(' /')) {
    const parts = text.split(/\s*\/\s*/);
    const primary = parts[0]?.trim();
    const secondary = parts.slice(1).join(' / ').trim();

    // If farmer specifically selected English, display only the English text
    if (isEnglishOnly) {
      return <span className={className || 'font-semibold text-gray-900'}>{primary}</span>;
    }

    // If a regional language is selected, display only the regional text (secondary) if present, else primary
    const regionalOnly = secondary || primary;

    if (layout === 'tag') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold">
          <span className={className || 'text-gray-900 font-bold'}>{regionalOnly}</span>
        </span>
      );
    }

    return (
      <span className={className || 'font-semibold text-gray-900'}>
        {regionalOnly}
      </span>
    );
  }

  return <span className={className}>{text}</span>;
};
