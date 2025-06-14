'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, UploadCloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// Use a specific version of PDF.js worker from CDN
const PDFJS_WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// Lazy load PDF.js to avoid SSR issues
let pdfjs: any;

async function getPdfJs() {
  if (typeof window === 'undefined') return null;
  if (!pdfjs) {
    pdfjs = await import('pdfjs-dist/build/pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
  }
  return pdfjs;
}

export function FileUploadForm({
  title,
  description,
  submitButtonText = "Process Material",
  isLoading,
}: {
  title: string;
  description: string;
  submitButtonText?: string;
  isLoading: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [isParsing, setIsParsing] = useState(false);

  async function parsePDF(file: File): Promise<string> {
    if (typeof window === 'undefined') return ''; // Skip on server
    
    try {
      const pdfjs = await getPdfJs();
      if (!pdfjs) return '';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ 
        data: arrayBuffer,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@2.16.105/cmaps/',
        cMapPacked: true 
      }).promise;
      
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return text;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF. Please try another file.');
    }
  }

  async function parsePPTX(file: File): Promise<string> {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
      let text = '';
      const slideFiles = Object.keys(zip.files).filter(name => name.match(/ppt\/slides\/slide[0-9]+.xml/));
      for (const name of slideFiles) {
        const xml = await zip.files[name].async('string');
        const matches = Array.from(xml.matchAll(/<a:t>(.*?)<\/a:t>/g));
        for (const m of matches) text += m[1] + ' ';
      }
      return text.trim();
    } catch (err) {
      throw new Error('Failed to parse PPTX.');
    }
  }

  function storeMaterial(filename: string, content: string) {
    const key = `course_material_${filename}`;
    localStorage.setItem(key, content);
    localStorage.setItem('latest_course_material', filename);
  }

  function isSupportedFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ext === 'pdf' || ext === 'pptx';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'Empty Material',
        description: 'Please select a file.',
        variant: 'destructive',
      });
      return;
    }
    if (!isSupportedFile(file)) {
      toast({
        title: 'Unsupported File',
        description: 'Only PDF and PPTX files are supported.',
        variant: 'destructive',
      });
      return;
    }
    setIsParsing(true);
    try {
      let parsed = '';
      if (file.name.endsWith('.pdf')) {
        parsed = await parsePDF(file);
      } else if (file.name.endsWith('.pptx')) {
        parsed = await parsePPTX(file);
      }
      if (!parsed.trim()) throw new Error('No text found in file.');
      storeMaterial(file.name, parsed);
      toast({
        title: 'Material Uploaded',
        description: `Parsed and saved: ${file.name}`,
        variant: 'default',
      });
      setFile(null);
    } catch (err: any) {
      toast({
        title: 'Parse Error',
        description: err.message || 'Failed to parse file. It may be corrupted or unsupported.',
        variant: 'destructive',
      });
    }
    setIsParsing(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <span className="p-3 bg-primary/10 rounded-lg text-primary">
            <UploadCloud className="h-8 w-8" />
          </span>
          <div>
            <CardTitle className="font-headline text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="courseMaterial" className="text-lg font-medium flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Upload Course Material (PDF or PPTX)
            </Label>
            <input
              id="courseMaterial"
              type="file"
              accept=".pdf,.pptx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-base w-full"
              disabled={isLoading || isParsing}
            />
            {file && (
              <div className="text-sm mt-2 text-muted-foreground">Selected: {file.name}</div>
            )}
            {isParsing && (
              <div className="flex items-center gap-2 text-primary mt-2"><Loader2 className="h-4 w-4 animate-spin" /> Parsing file...</div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || isParsing}>
            {(isLoading || isParsing) ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isParsing ? 'Parsing...' : 'Processing...'}
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
