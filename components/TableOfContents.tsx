import React from 'react';
import { TableOfContents as TOCType, Theme } from '../types';

interface Props {
  data: TOCType;
  theme: Theme;
}

export const TableOfContents: React.FC<Props> = ({ data, theme }) => {
  const s = theme.styles;

  return (
    <div className={`w-full max-w-[800px] mx-auto ${s.pageBg} p-16 min-h-[1123px] shadow-lg mb-8 print:shadow-none print:mb-0 print:h-screen page-break`}>
      <h2 className={`text-3xl font-bold ${s.titleColor} border-b-4 ${s.primaryBorder} pb-4 mb-10 ${s.headingFont}`}>
        Table of Contents
      </h2>
      <ul className="space-y-4">
        {data.chapters.map((title, index) => (
          <li key={index} className="flex items-baseline border-b border-gray-200 pb-2">
            <span className={`${s.subtitleColor} font-bold mr-4 ${s.headingFont} w-8`}>
              {index + 1}.
            </span>
            <span className={`text-lg ${s.bodyColor} ${s.bodyFont} flex-1`}>
              {title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};