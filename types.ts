export interface PracticalSection {
  section_title: string;
  explanation: string;
  example?: string;
  action_steps?: string[];
}

export interface Chapter {
  chapter_title: string;
  overview: string;
  key_concepts: string[];
  practical_sections: PracticalSection[];
  case_study: string;
  checklist: string[];
  summary: string;
  // New fields for Holistic/Chapter-level prompt
  example?: string;
  action_steps?: string[];
}

export interface CoverPage {
  title: string;
  subtitle: string;
  author: string;
}

export interface CopyrightPage {
  copyright_notice: string;
  disclaimer: string;
  website_or_contact: string;
}

export interface TableOfContents {
  chapters: string[];
}

export interface EbookMetadata {
  cover_page: CoverPage;
  copyright_page: CopyrightPage;
  table_of_contents: TableOfContents;
}

export interface EbookData {
  ebook: EbookMetadata;
}

export interface ChaptersData {
  chapters: Chapter[];
}

export interface GeneratedEbook {
  ebook: EbookMetadata;
  chapters: Chapter[];
}

export interface ThemeStyles {
  headingFont: string;
  bodyFont: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  pageBg: string;
  primaryBorder: string;
  accentBorder: string;
  highlightBg: string;
  tagBg: string;
  tagText: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  styles: ThemeStyles;
}

export interface AffiliateLink {
  id: string;
  text: string;
  url: string;
}