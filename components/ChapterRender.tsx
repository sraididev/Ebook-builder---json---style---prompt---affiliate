import React from 'react';
import { Chapter, Theme, AffiliateLink } from '../types';
import { CheckSquare, Square, ExternalLink } from 'lucide-react';

interface Props {
  chapter: Chapter;
  chapterNumber: number;
  theme: Theme;
  affiliateLinks?: AffiliateLink[];
}

export const ChapterRender: React.FC<Props> = ({ chapter, chapterNumber, theme, affiliateLinks = [] }) => {
  const s = theme.styles;

  // Helper to process text and auto-linkify markdown-style [text](url) for native affiliate links
  // A simple regex replacer for display purposes
  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        return (
          <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer" className={`underline font-bold ${s.subtitleColor} hover:opacity-80`}>
            {match[1]}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={`w-full max-w-[800px] mx-auto ${s.pageBg} p-16 shadow-lg mb-8 print:shadow-none print:mb-0 page-break`}>
      
      {/* Chapter Header */}
      <div className={`border-b-4 ${s.primaryBorder} pb-5 mb-8`}>
        <span className={`block ${s.headingFont} text-sm uppercase tracking-[2px] ${s.subtitleColor} font-bold mb-1`}>
          Chapter {chapterNumber}
        </span>
        <h1 className={`text-[32px] ${s.titleColor} m-0 leading-[1.2] ${s.headingFont}`}>
          {chapter.chapter_title}
        </h1>
      </div>

      {/* Overview Box */}
      {chapter.overview && (
        <div className={`${s.highlightBg} border-l-[5px] ${s.accentBorder} p-5 italic mb-8 ${s.bodyColor} ${s.bodyFont}`}>
          <strong className="opacity-80 not-italic">Overview:</strong> {renderTextWithLinks(chapter.overview)}
        </div>
      )}

      {/* Key Concepts */}
      {chapter.key_concepts.length > 0 && (
        <div className="mb-10">
          <div className="flex flex-wrap gap-2">
            {chapter.key_concepts.map((concept, idx) => (
              <span 
                key={idx} 
                className={`inline-block ${s.tagBg} ${s.tagText} px-3 py-1 rounded-full text-xs ${s.headingFont}`}
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      <hr className="border-0 border-t border-[#eee] my-8" />

      {/* Practical Sections */}
      {chapter.practical_sections.map((section, idx) => (
        <div key={idx} className="mb-10 avoid-break">
          <div className={`${s.headingFont} text-[22px] ${s.titleColor} mb-4 font-bold`}>
            {idx + 1}. {section.section_title}
          </div>
          
          {section.explanation && (
            <p className={`mb-4 ${s.bodyColor} leading-[1.6] ${s.bodyFont}`}>
              {renderTextWithLinks(section.explanation)}
            </p>
          )}

          {/* Section Level Example (Detailed Prompt) */}
          {section.example && (
            <div className={`bg-gray-50 p-4 rounded text-[0.95em] my-4 border-l-4 ${s.primaryBorder}`}>
              <span className={`font-bold ${s.subtitleColor} uppercase text-[0.8em] block mb-1 ${s.headingFont}`}>
                Real Life Example
              </span>
              <p className={s.bodyFont}>{renderTextWithLinks(section.example)}</p>
            </div>
          )}

          {/* Section Level Action Steps (Detailed Prompt) */}
          {section.action_steps && section.action_steps.length > 0 && (
            <div className="mt-4">
              <span className={`font-bold block mb-2 ${s.titleColor} ${s.headingFont}`}>Action Steps:</span>
              <ul className={`list-disc pl-5 space-y-2 ${s.bodyColor} ${s.bodyFont}`}>
                {section.action_steps.map((step, sIdx) => (
                  <li key={sIdx}>{renderTextWithLinks(step)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* --- CHAPTER LEVEL WRAP-UP (Holistic Prompt) --- */}
      
      {/* Chapter Level Example */}
      {chapter.example && (
         <div className={`bg-gray-50 p-6 rounded my-8 border-l-4 ${s.primaryBorder} avoid-break`}>
            <span className={`font-bold ${s.subtitleColor} uppercase text-[0.9em] block mb-2 ${s.headingFont}`}>
              Chapter Example
            </span>
            <p className={`${s.bodyFont} ${s.bodyColor} leading-relaxed`}>{renderTextWithLinks(chapter.example)}</p>
         </div>
      )}

      {/* Chapter Level Action Steps */}
      {chapter.action_steps && chapter.action_steps.length > 0 && (
        <div className="mb-10 avoid-break">
           <div className={`p-6 border-2 border-dashed ${s.primaryBorder} rounded-lg`}>
              <h3 className={`mt-0 ${s.titleColor} font-bold text-xl mb-4 ${s.headingFont}`}>
                Chapter Action Plan
              </h3>
              <ul className={`space-y-3 ${s.bodyColor} ${s.bodyFont}`}>
                {chapter.action_steps.map((step, idx) => (
                   <li key={idx} className="flex items-start gap-3">
                     <span className={`${s.tagBg} ${s.tagText} w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5`}>{idx + 1}</span>
                     <span>{renderTextWithLinks(step)}</span>
                   </li>
                ))}
              </ul>
           </div>
        </div>
      )}

      {/* Case Study */}
      {chapter.case_study && (
        <div className={`border-2 ${s.primaryBorder} p-6 my-10 ${s.pageBg} relative avoid-break`}>
          <div className={`${s.tagBg} ${s.tagText} px-4 py-1 absolute -top-4 left-5 ${s.headingFont} text-sm font-bold uppercase`}>
            Case Study
          </div>
          <div className={`mt-2 whitespace-pre-wrap leading-relaxed ${s.bodyColor} ${s.bodyFont}`}>
             {renderTextWithLinks(chapter.case_study)}
          </div>
        </div>
      )}

      {/* Checklist */}
      {chapter.checklist.length > 0 && (
        <div className={`${s.pageBg} border border-dashed ${s.accentBorder} p-6 mb-10 avoid-break`}>
          <h3 className={`mt-0 ${s.subtitleColor} font-bold text-lg mb-4 ${s.headingFont} uppercase`}>
            Chapter {chapterNumber} Checklist
          </h3>
          <div className="space-y-3">
            {chapter.checklist.map((item, idx) => (
              <div key={idx} className={`flex items-start ${s.bodyFont} ${s.bodyColor}`}>
                <Square className={`w-5 h-5 ${s.subtitleColor} mr-3 mt-0.5 flex-shrink-0`} />
                <span>{renderTextWithLinks(item)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {chapter.summary && (
        <div className={`${s.tagBg} ${s.tagText} p-8 text-center rounded avoid-break`}>
          <span className={`uppercase tracking-widest font-bold mb-3 block ${s.subtitleColor} text-sm ${s.headingFont}`}>
            Chapter Summary
          </span>
          <p className={`italic leading-relaxed ${s.bodyFont}`}>
            {renderTextWithLinks(chapter.summary)}
          </p>
        </div>
      )}

      {/* --- AFFILIATE / RECOMMENDED RESOURCES (Explicit Button/Section) --- */}
      {affiliateLinks.length > 0 && (
        <div className={`mt-12 p-8 border ${s.primaryBorder} bg-gray-50 rounded-lg avoid-break text-center`}>
           <h4 className={`${s.headingFont} font-bold text-xl ${s.titleColor} mb-2 uppercase tracking-wide`}>
             Recommended Tools & Resources
           </h4>
           <p className={`text-sm ${s.bodyColor} mb-6 opacity-80 ${s.bodyFont}`}>
             To help you implement what you've learned in this chapter, we recommend these specific tools.
           </p>
           
           <div className="flex flex-col gap-3">
             {affiliateLinks.map((link) => (
               <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer"
                className={`block w-full py-4 px-6 ${s.tagBg} ${s.tagText} font-bold text-lg rounded shadow hover:opacity-90 transition-opacity flex items-center justify-center gap-2 no-underline`}
               >
                 {link.text}
                 <ExternalLink className="w-5 h-5" />
               </a>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};