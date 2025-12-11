import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedEbook, Theme, AffiliateLink } from './types';
import { CoverPage } from './components/CoverPage';
import { CopyrightPage } from './components/CopyrightPage';
import { TableOfContents } from './components/TableOfContents';
import { ChapterRender } from './components/ChapterRender';
import { Printer, FileText, Sparkles, Loader2, ArrowLeft, Upload, FileJson, Trash2, Palette, Check, PenTool, Layout, BookOpen, Link as LinkIcon, Plus, AlertCircle } from 'lucide-react';

// --- THEME DEFINITIONS ---
const THEMES: Theme[] = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Trusted navy blue and energetic red accents.',
    previewColor: '#2c3e50',
    styles: {
      headingFont: 'font-sans', // Arial (from css)
      bodyFont: 'font-serif',   // Georgia (from css)
      titleColor: 'text-[#2c3e50]',
      subtitleColor: 'text-[#e74c3c]',
      bodyColor: 'text-[#333333]',
      pageBg: 'bg-white',
      primaryBorder: 'border-[#2c3e50]',
      accentBorder: 'border-[#e74c3c]',
      highlightBg: 'bg-[#f9f9f9]',
      tagBg: 'bg-[#2c3e50]',
      tagText: 'text-white'
    }
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Clean emerald greens and stark blacks. High readability.',
    previewColor: '#10b981',
    styles: {
      headingFont: 'font-sans',
      bodyFont: 'font-sans',
      titleColor: 'text-black',
      subtitleColor: 'text-emerald-600',
      bodyColor: 'text-slate-700',
      pageBg: 'bg-white',
      primaryBorder: 'border-black',
      accentBorder: 'border-emerald-500',
      highlightBg: 'bg-emerald-50',
      tagBg: 'bg-emerald-600',
      tagText: 'text-white'
    }
  },
  {
    id: 'elegant',
    name: 'Elegant Serif',
    description: 'Sophisticated dark grays and luxury gold accents.',
    previewColor: '#d4af37',
    styles: {
      headingFont: 'font-serif',
      bodyFont: 'font-serif',
      titleColor: 'text-gray-900',
      subtitleColor: 'text-[#d4af37]', // Gold
      bodyColor: 'text-gray-800',
      pageBg: 'bg-[#fffdf5]', // Very light cream
      primaryBorder: 'border-gray-800',
      accentBorder: 'border-[#d4af37]',
      highlightBg: 'bg-[#fdfbf7]', // Light warm grey
      tagBg: 'bg-gray-800',
      tagText: 'text-[#d4af37]'
    }
  }
];

// --- PROMPT DEFINITIONS ---
interface PromptOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  template: (jsonContent: string, affiliateContext: string) => string;
}

const PROMPT_OPTIONS: PromptOption[] = [
  {
    id: 'detailed',
    name: 'Detailed Sections',
    description: 'Each subchapter gets its own specific example and action steps. Best for workbooks and step-by-step guides.',
    icon: Layout,
    template: (json: string, affiliateContext: string) => `Act as a professional ebook author.
      
      I am providing a JSON blueprint for an ebook below. This JSON contains the structure, titles, author info, and chapters that I want.
      
      Your task is to WRITE THE CONTENT for this ebook structure. 
      
      Instructions:
      1. Respect the provided structure (titles, chapter names, etc.) exactly.
      2. Fill in all the content fields with detailed, high-quality, educational, and engaging text:
         - 'overview': Write a compelling introduction for the chapter.
         - 'key_concepts': Extract relevant keywords.
         - 'explanation': Write deep, practical explanations for the section.
         - 'example': Provide a concrete, realistic example or scenario.
         - 'action_steps': Provide 3-5 clear actionable steps.
         - 'case_study': Write a narrative case study illustrating the chapter's main point.
         - 'checklist': Create a practical checklist for the reader.
         - 'summary': Summarize the key takeaways.
      
      3. If the input JSON has empty strings for these fields, fill them. If it already has content, improve and expand upon it to make it professional book quality.

      ${affiliateContext}
      
      INPUT JSON BLUEPRINT:
      ${json}`
  },
  {
    id: 'holistic',
    name: 'Holistic Chapters',
    description: 'Subchapters focus on theory. Examples and actions are consolidated at the end of the chapter. Best for narrative flow.',
    icon: BookOpen,
    template: (json: string, affiliateContext: string) => `Act as a professional ebook author.

I am providing a JSON blueprint for an ebook below. This JSON contains the structure, titles, author info, chapters, and subchapters.

Your task is to WRITE HIGH-QUALITY EBOOK CONTENT based on this structure.

IMPORTANT STRUCTURE RULE:
- For EACH CHAPTER:
  - The chapter contains multiple subchapters/sections.
  - ONLY AT THE END OF THE CHAPTER, include:
    - 'example'
    - 'action_steps'
    - 'case_study'
    - 'checklist'
    - 'summary'
- DO NOT repeat these elements in every subchapter.

CONTENT RULES:

1. Respect the provided JSON structure EXACTLY (titles, chapter names, nesting, and keys).
2. Generate long, detailed, professional book-quality content.
3. Follow these writing rules by content type:

SUBCHAPTER LEVEL:
- 'overview': Write a clear and engaging introduction for the subchapter.
- 'key_concepts': Extract concise, relevant keywords or phrases.
- 'explanation': Write deep, practical, educational explanations focused on clarity and real-world usefulness.
- Do NOT include examples, action steps, case studies, checklists, or summaries at subchapter level.

CHAPTER END (ONLY ONCE PER CHAPTER):
- 'example': Provide ONE concrete, realistic example that ties together the entire chapter.
- 'action_steps': Provide 3–5 clear, practical actions the reader can apply immediately.
- 'case_study': Write a short narrative case study illustrating the chapter’s main transformation or lesson.
- 'checklist': Create a concise, practical checklist summarizing the chapter.
- 'summary': Summarize the chapter’s key takeaways in a motivating, reader-friendly way.

4. If any fields in the input JSON are empty, fill them.
5. If fields already contain text, improve, expand, and refine them to professional ebook quality.
6. Maintain logical flow, avoid repetition, and ensure each chapter feels cohesive and complete.
7. Write in a clear, engaging, reader-centered tone suitable for a premium paid ebook.

${affiliateContext}

INPUT JSON BLUEPRINT:
${json}`
  }
];

// --- SCHEMA DEFINITION FOR GEMINI (SUPERSET) ---
const EBOOK_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    ebook: {
      type: Type.OBJECT,
      properties: {
        cover_page: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            author: { type: Type.STRING }
          },
          required: ['title', 'subtitle', 'author']
        },
        copyright_page: {
          type: Type.OBJECT,
          properties: {
            copyright_notice: { type: Type.STRING },
            disclaimer: { type: Type.STRING },
            website_or_contact: { type: Type.STRING }
          },
          required: ['copyright_notice', 'disclaimer', 'website_or_contact']
        },
        table_of_contents: {
          type: Type.OBJECT,
          properties: {
            chapters: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['chapters']
        }
      },
      required: ['cover_page', 'copyright_page', 'table_of_contents']
    },
    chapters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          chapter_title: { type: Type.STRING },
          overview: { type: Type.STRING },
          key_concepts: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          practical_sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                section_title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                example: { type: Type.STRING },
                action_steps: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                }
              },
              required: ['section_title', 'explanation'] 
            }
          },
          case_study: { type: Type.STRING },
          checklist: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          summary: { type: Type.STRING },
          example: { type: Type.STRING },
          action_steps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['chapter_title', 'overview', 'key_concepts', 'practical_sections', 'case_study', 'checklist', 'summary']
      }
    }
  },
  required: ['ebook', 'chapters']
};

interface JsonInputFile {
  name: string;
  content: string;
}

// Utility to delay promise
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const App: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<JsonInputFile | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "complete" | "error">("idle");
  const [generatedData, setGeneratedData] = useState<GeneratedEbook | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptOption>(PROMPT_OPTIONS[0]);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  
  // New Link Inputs
  const [newLinkText, setNewLinkText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          JSON.parse(content);
          setJsonInput({ name: file.name, content });
          setErrorMessage(null);
        } catch (err) {
          setErrorMessage("Invalid JSON file. Please check the file content and try again.");
          setJsonInput(null);
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearFile = () => {
    setJsonInput(null);
    setErrorMessage(null);
  };

  const addLink = () => {
    if (newLinkText && newLinkUrl) {
      setAffiliateLinks([...affiliateLinks, { id: Date.now().toString(), text: newLinkText, url: newLinkUrl }]);
      setNewLinkText("");
      setNewLinkUrl("");
    }
  };

  const removeLink = (id: string) => {
    setAffiliateLinks(affiliateLinks.filter(l => l.id !== id));
  };

  const generateEbook = async () => {
    if (!jsonInput) return;

    setStatus("generating");
    setErrorMessage(null);

    try {
      // 1. Check for API Key presence
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "" || apiKey === "undefined") {
        throw new Error("Missing API Key. Ensure 'API_KEY' is set in your Vercel Environment Variables and that you have redeployed after setting it.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Construct Affiliate Context
      let affiliateContext = "";
      if (affiliateLinks.length > 0) {
        affiliateContext = `
        STRATEGIC RESOURCE INTEGRATION:
        The following tools/resources are highly recommended by the author (affiliate/partner links).
        
        RESOURCES LIST:
        ${affiliateLinks.map(l => `- Name/Call-to-Action: "${l.text}", URL: "${l.url}"`).join('\n')}

        INSTRUCTIONS:
        1. You are STRONGLY ENCOURAGED to naturally mention these specific resources in the text (especially in 'action_steps', 'explanation', or 'checklist') when they solve a problem being discussed.
        2. When mentioning them, use Markdown link format: [${affiliateLinks[0].text}](${affiliateLinks[0].url}).
        3. Do not be spammy, but be helpful. Position them as the best solution.
        `;
      }

      const prompt = selectedPrompt.template(jsonInput.content, affiliateContext);

      // RETRY LOGIC for 503 errors
      let response;
      const maxRetries = 3;
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: EBOOK_SCHEMA,
              temperature: 0.7,
            }
          });
          // If successful, break loop
          break;
        } catch (err: any) {
          lastError = err;
          const errorStr = err.message || JSON.stringify(err);
          
          // Check if error is retryable (503 Service Unavailable or 500 Internal Error)
          const isRetryable = errorStr.includes('503') || errorStr.includes('overloaded') || errorStr.includes('500');
          
          if (attempt < maxRetries && isRetryable) {
            console.log(`Attempt ${attempt} failed with 503. Retrying in ${attempt * 2} seconds...`);
            // Exponential backoff: 2s, 4s, 6s...
            await delay(attempt * 2000);
            continue;
          }
          
          // If not retryable or max retries reached, throw the error
          throw err;
        }
      }

      let text = response?.text;
      if (!text) throw new Error("No content generated from API. The model might have been blocked.");

      // Clean up potential markdown blocks even in JSON mode
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");

      let data: GeneratedEbook;
      try {
        data = JSON.parse(text) as GeneratedEbook;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Raw Text snippet:", text.substring(0, 500) + "...");
        throw new Error("Generated content was cut off or malformed. This usually happens if the Ebook is too long for a single generation. Try reducing the number of chapters in your JSON input.");
      }

      setGeneratedData(data);
      setStatus("complete");
    } catch (error: any) {
      console.error("Full Error Object:", error);
      
      let friendlyMessage = "An unexpected error occurred.";
      const errorStr = error.message || JSON.stringify(error);
      
      if (errorStr.includes("503") || errorStr.includes("overloaded")) {
          friendlyMessage = "Server Busy (503): The AI model is currently overloaded. We tried multiple times but it is still busy. Please wait a moment and try again.";
      } else if (errorStr.includes("403")) {
          friendlyMessage = "API Key Invalid or Quota Exceeded (403). Please check your Vercel API_KEY variable.";
      } else if (errorStr.includes("400")) {
          friendlyMessage = "Bad Request (400). The prompt or JSON structure might be invalid.";
      } else {
        // Attempt to parse user-facing message from raw JSON string errors
        try {
          const jsonError = JSON.parse(errorStr);
          if (jsonError?.error?.message) {
            friendlyMessage = jsonError.error.message;
          }
        } catch(e) {
          friendlyMessage = error.message || "Unknown error";
        }
      }

      setErrorMessage(friendlyMessage);
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setJsonInput(null);
    setGeneratedData(null);
  };

  // --- VIEW: INPUT / HERO ---
  if (status === "idle" || status === "generating" || status === "error") {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white p-8 md:p-12 rounded-lg shadow-xl border-t-8 border-[#2c3e50]">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 bg-[#f0f9ff] rounded-full flex items-center justify-center border-2 border-[#2c3e50] mb-4">
              <FileJson className="w-8 h-8 text-[#2c3e50]" />
            </div>
            <h1 className="text-3xl font-bold text-[#2c3e50] text-center font-sans">
              JSON to Ebook Builder
            </h1>
            <p className="text-gray-500 text-center mt-2 max-w-lg">
              Generate a professionally formatted ebook from your JSON structure.
            </p>
          </div>

          {/* SECTION 1: THEME SELECTION */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#2c3e50] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <h2 className="text-lg font-bold text-[#2c3e50] uppercase tracking-wide">Choose Your Style</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {THEMES.map((theme) => {
                const isSelected = selectedTheme.id === theme.id;
                return (
                  <div 
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all relative overflow-hidden group ${isSelected ? 'border-[#2c3e50] bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" 
                        style={{ backgroundColor: theme.previewColor }}
                      ></div>
                      <span className={`font-bold ${isSelected ? 'text-[#2c3e50]' : 'text-gray-600'}`}>
                        {theme.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {theme.description}
                    </p>
                    {isSelected && (
                      <div className="absolute top-2 right-2 text-[#2c3e50]">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* SECTION 2: PROMPT SELECTION */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#2c3e50] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <h2 className="text-lg font-bold text-[#2c3e50] uppercase tracking-wide">Content Strategy</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROMPT_OPTIONS.map((prompt) => {
                const isSelected = selectedPrompt.id === prompt.id;
                const Icon = prompt.icon;
                return (
                  <div 
                    key={prompt.id}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all relative overflow-hidden group ${isSelected ? 'border-[#2c3e50] bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-md ${isSelected ? 'bg-[#2c3e50] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`font-bold ${isSelected ? 'text-[#2c3e50]' : 'text-gray-600'}`}>
                        {prompt.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {prompt.description}
                    </p>
                    {isSelected && (
                      <div className="absolute top-2 right-2 text-[#2c3e50]">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* SECTION 3: MONETIZATION / LINKS */}
           <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#2c3e50] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <h2 className="text-lg font-bold text-[#2c3e50] uppercase tracking-wide">Monetization & Links (Optional)</h2>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
               <div className="flex flex-col md:flex-row gap-4 mb-4">
                 <div className="flex-1">
                   <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Link Text / CTA</label>
                   <input 
                      type="text" 
                      placeholder="e.g. Get The Ultimate Tool" 
                      className="w-full p-2 border border-gray-300 rounded focus:border-[#2c3e50] outline-none"
                      value={newLinkText}
                      onChange={(e) => setNewLinkText(e.target.value)}
                   />
                 </div>
                 <div className="flex-1">
                   <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Destination URL</label>
                   <input 
                      type="text" 
                      placeholder="https://affiliate-link.com" 
                      className="w-full p-2 border border-gray-300 rounded focus:border-[#2c3e50] outline-none"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                   />
                 </div>
                 <div className="flex items-end">
                   <button 
                    onClick={addLink}
                    disabled={!newLinkText || !newLinkUrl}
                    className="bg-[#2c3e50] text-white p-2 rounded hover:bg-[#34495e] disabled:opacity-50 transition-colors flex items-center gap-2 h-[42px]"
                   >
                     <Plus className="w-5 h-5" />
                     <span className="hidden md:inline">Add</span>
                   </button>
                 </div>
               </div>

               {affiliateLinks.length > 0 && (
                 <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
                   {affiliateLinks.map(link => (
                     <div key={link.id} className="p-3 flex items-center justify-between group hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                          <div className="flex flex-col">
                             <span className="font-bold text-[#2c3e50] text-sm">{link.text}</span>
                             <span className="text-xs text-gray-400">{link.url}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeLink(link.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   ))}
                 </div>
               )}
               {affiliateLinks.length === 0 && (
                 <p className="text-xs text-gray-400 text-center italic">No links added. Your ebook will be generated without promotional links.</p>
               )}
            </div>
          </div>

          {/* SECTION 4: FILE UPLOAD */}
          <div className="mb-8">
             <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#2c3e50] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <h2 className="text-lg font-bold text-[#2c3e50] uppercase tracking-wide">Upload Blueprint</h2>
            </div>

            {/* File Upload Area */}
            {!jsonInput ? (
              <div 
                className="border-4 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#e74c3c] hover:bg-red-50 transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-gray-400 group-hover:text-[#e74c3c] mb-3 transition-colors" />
                <span className="font-bold text-[#2c3e50]">Click to Upload JSON File</span>
                <span className="text-xs text-gray-400 mt-1">Supports standard JSON structure</span>
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="bg-[#f8f9fa] border border-[#e0e0e0] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-[#2c3e50] p-2 rounded text-white shrink-0">
                    <FileJson className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-[#2c3e50] truncate">{jsonInput.name}</span>
                    <span className="text-xs text-gray-500">Ready to build</span>
                  </div>
                </div>
                <button 
                  onClick={clearFile}
                  disabled={status === "generating"}
                  className="text-gray-400 hover:text-red-500 p-2 transition-colors disabled:opacity-50"
                  title="Remove file"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Error Generating Ebook:</span>
                {errorMessage}
              </div>
            </div>
          )}

          <button
            onClick={generateEbook}
            disabled={status === "generating" || !jsonInput}
            className="w-full bg-[#2c3e50] hover:bg-[#34495e] disabled:bg-gray-400 text-white font-bold py-4 rounded-md text-lg transition-all flex items-center justify-center gap-3 shadow-lg disabled:shadow-none"
          >
            {status === "generating" ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Drafting Content...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-[#e74c3c]" />
                Build Ebook
              </>
            )}
          </button>
        </div>
        <p className="mt-8 text-gray-400 text-sm">Powered by Gemini API</p>
      </div>
    );
  }

  // --- VIEW: PREVIEW & PRINT ---
  return (
    <div className="min-h-screen bg-[#e0e0e0] py-10 print:p-0 print:bg-white">
      
      {/* Control Bar (Hidden in Print) */}
      <div className="fixed top-0 left-0 w-full bg-[#2c3e50] text-white p-4 shadow-md z-50 flex justify-between items-center no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Start Over
          </button>
          <div className="h-6 w-px bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#e74c3c]" />
            <span className="text-sm text-gray-300">Theme: <span className="text-white font-bold">{selectedTheme.name}</span></span>
          </div>
          <div className="h-6 w-px bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-[#e74c3c]" />
            <span className="text-sm text-gray-300">Style: <span className="text-white font-bold">{selectedPrompt.name}</span></span>
          </div>
        </div>
        
        <button 
          onClick={handlePrint}
          className="bg-[#e74c3c] hover:bg-[#c0392b] text-white px-6 py-2 rounded font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Save as PDF</span>
        </button>
      </div>

      {/* Main Content Area */}
      {generatedData && (
        <div className="mt-12 print:mt-0">
          
          {/* Cover Page */}
          <CoverPage data={generatedData.ebook.cover_page} theme={selectedTheme} />

          {/* Copyright Page */}
          <CopyrightPage data={generatedData.ebook.copyright_page} theme={selectedTheme} />

          {/* Table of Contents */}
          <TableOfContents data={generatedData.ebook.table_of_contents} theme={selectedTheme} />

          {/* Chapters */}
          {generatedData.chapters.map((chapter, index) => (
            <ChapterRender 
              key={index} 
              chapter={chapter} 
              chapterNumber={index + 1} 
              theme={selectedTheme}
              affiliateLinks={affiliateLinks}
            />
          ))}

        </div>
      )}

      <div className="text-center text-gray-500 mt-10 no-print pb-10">
        <p>End of Preview</p>
      </div>
    </div>
  );
};

export default App;