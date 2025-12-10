import React from 'react';
import { CopyrightPage as CopyrightPageType, Theme } from '../types';

interface Props {
  data: CopyrightPageType;
  theme: Theme;
}

export const CopyrightPage: React.FC<Props> = ({ data, theme }) => {
  const s = theme.styles;

  return (
    <div className={`w-full max-w-[800px] mx-auto ${s.pageBg} p-16 min-h-[1123px] flex flex-col justify-end shadow-lg mb-8 print:shadow-none print:mb-0 print:h-screen page-break`}>
      <div className={`text-sm ${s.bodyColor} ${s.bodyFont}`}>
        <p className="font-bold mb-4">{data.copyright_notice}</p>
        <p className="mb-4 leading-relaxed">{data.disclaimer}</p>
        <p className={`${s.subtitleColor} font-bold`}>{data.website_or_contact}</p>
      </div>
    </div>
  );
};