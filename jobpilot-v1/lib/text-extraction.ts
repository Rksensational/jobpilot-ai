/**
 * Extracts raw text from an uploaded resume file (PDF or DOCX).
 * Runs server-side only (Node runtime), inside the upload API route.
 */

export class UnsupportedFileTypeError extends Error {}

export async function extractText(
  buffer: Buffer,
  fileName: string
): Promise<{ text: string; fileType: "pdf" | "docx" }> {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    return { text: result.text.trim(), fileType: "pdf" };
  }

  if (lower.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value.trim(), fileType: "docx" };
  }

  throw new UnsupportedFileTypeError(
    `Unsupported file type for "${fileName}". Only .pdf and .docx are supported.`
  );
}
