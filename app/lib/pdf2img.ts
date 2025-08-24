// types
export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  // guard: server can't do this
  if (typeof window === "undefined") {
    return {
      imageUrl: "",
      file: null,
      error: "PDF conversion only works in the browser",
    };
  }

  try {
    // dynamic import so SSR never sees pdfjs-dist
    const pdfjsLib = await import("pdfjs-dist");
    const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.mjs?url");

    // attach worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

    // load PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    // viewport & canvas
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return { imageUrl: "", file: null, error: "Canvas not supported" };
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    await page.render({ canvasContext: context, viewport }).promise;

    // convert canvas → blob → File
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const name = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${name}.png`, {
              type: "image/png",
            });
            resolve({ imageUrl: URL.createObjectURL(blob), file: imageFile });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      );
    });
  } catch (err: any) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err.message || err}`,
    };
  }
}
