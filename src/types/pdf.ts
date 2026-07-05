export interface PdfFile {
  id: string;
  name: string;
  size: number;
  uploadTime: number;
  status: 'uploading' | 'parsing' | 'ready' | 'error';
  pageCount?: number;
  blobUrl?: string;
}

export interface AiSummary {
  pdfId: string;
  keyPoints: string[];
  knowledgePoints: string[];
  coreConcepts: string[];
  easyMistakes: string[];
  mindMap: string;
  chapterSummaries: { chapter: string; summary: string }[];
  /** 各板块原始 Markdown 内容，用于 MarkdownViewer 渲染 */
  rawSections: {
    keyPoints: string;
    knowledgePoints: string;
    coreConcepts: string;
    easyMistakes: string;
    mindMap: string;
    chapterSummaries: string;
  };
  generatedAt: number;
}