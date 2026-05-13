"use client";

export async function extractFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const ext = name.slice(name.lastIndexOf("."));

  if (ext === ".txt" || ext === ".md" || file.type === "text/plain") {
    return await file.text();
  }

  if (ext === ".pdf" || file.type === "application/pdf") {
    return await extractPdfText(file);
  }

  if (
    ext === ".docx" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await extractDocxText(file);
  }

  throw new Error(
    `Unsupported file type: ${ext || file.type || "unknown"}. Please upload .pdf, .docx, or .txt.`
  );
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");
  // Use the CDN worker matching the installed pdfjs-dist version.
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const out: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((it: any) => ("str" in it ? it.str : ""))
      .join(" ");
    out.push(text);
  }
  return out.join("\n\n").replace(/[ \t]+/g, " ").trim();
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth: any = await import("mammoth/mammoth.browser");
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return String(result.value || "").trim();
}
