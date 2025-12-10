import React from 'react';
import { CoverPage as CoverPageType, Theme } from '../types';

interface Props {
  data: CoverPageType;
  theme: Theme;
}

export const CoverPage: React.FC<Props> = ({ data, theme }) => {
  const s = theme.styles;
  
  return (
    <div className={`w-full max-w-[800px] mx-auto ${s.pageBg} p-16 min-h-[1123px] flex flex-col justify-center items-center text-center shadow-lg mb-8 print:shadow-none print:mb-0 print:h-screen page-break`}>
      <div className={`border-8 ${s.primaryBorder} p-12 w-full h-full flex flex-col justify-center items-center`}>
        <h1 className={`text-6xl font-bold ${s.titleColor} mb-6 leading-tight ${s.headingFont}`}>
          {data.title}
        </h1>
        <h2 className={`text-2xl ${s.subtitleColor} uppercase tracking-widest mb-12 ${s.headingFont}`}>
          {data.subtitle}
        </h2>
        <div className="mt-auto">
          <p className={`${s.bodyColor} italic mb-2 ${s.bodyFont} opacity-80`}>Written by</p>
          <p className={`text-xl font-bold ${s.bodyColor} ${s.headingFont}`}>{data.author}</p>
        </div>
      </div>
    </div>
  );
};