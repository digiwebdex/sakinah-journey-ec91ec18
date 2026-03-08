import jsPDF from "jspdf";
import bengaliFontUrl from "@/assets/fonts/NotoSansBengali-Regular.ttf";

let fontBase64Cache: string | null = null;

async function loadFontAsBase64(): Promise<string> {
  if (fontBase64Cache) return fontBase64Cache;

  const response = await fetch(bengaliFontUrl);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  fontBase64Cache = btoa(binary);
  return fontBase64Cache;
}

export async function registerBengaliFont(doc: jsPDF): Promise<void> {
  try {
    const base64 = await loadFontAsBase64();
    doc.addFileToVFS("NotoSansBengali-Regular.ttf", base64);
    doc.addFont("NotoSansBengali-Regular.ttf", "NotoSansBengali", "normal");
    doc.setFont("NotoSansBengali");
  } catch (e) {
    console.warn("Failed to load Bengali font, falling back to helvetica:", e);
  }
}

/**
 * Sets font to Bengali if available, otherwise helvetica.
 * Use this before writing text that may contain Bengali characters.
 */
export function setBengaliFont(doc: jsPDF, style: "normal" | "bold" = "normal") {
  try {
    doc.setFont("NotoSansBengali", style);
  } catch {
    doc.setFont("helvetica", style);
  }
}

/**
 * Sets font back to helvetica for labels/headers.
 */
export function setLatinFont(doc: jsPDF, style: "normal" | "bold" | "italic" = "normal") {
  doc.setFont("helvetica", style);
}
