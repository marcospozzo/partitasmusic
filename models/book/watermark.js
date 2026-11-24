const { PDFDocument, StandardFonts, rgb, degrees } = require("pdf-lib");

const WATERMARK_FONT_SIZE = 10;
const WATERMARK_OPACITY = 0.5;
// 1-based, inclusive
const FIRST_PAGE = 6;
const LAST_PAGE = 42;
const MAX_NAME_LENGTH = 100;

function normalizeFullName(fullName) {
  if (typeof fullName !== "string") return "";
  return fullName.trim().replace(/\s+/g, " ");
}

// Returns an error message, or null when the name is usable.
function validateFullName(fullName, font) {
  if (!fullName) return "Full name is required";
  if (fullName.length > MAX_NAME_LENGTH)
    return `Full name must be at most ${MAX_NAME_LENGTH} characters`;
  try {
    // Standard fonts only cover WinAnsi (Latin-1): accents and ñ are fine,
    // other scripts are not.
    font.encodeText(fullName);
  } catch (err) {
    return "Full name contains characters that cannot be printed in the PDF";
  }
  return null;
}

/**
 * Stamps "For the exclusive personal use of <fullName>" in the center of
 * pages FIRST_PAGE..LAST_PAGE, on top of the existing content.
 * Returns { pdfBytes } or { error } when the name is invalid.
 */
async function watermarkBook(sourcePdfBytes, rawFullName) {
  const fullName = normalizeFullName(rawFullName);
  const pdfDoc = await PDFDocument.load(sourcePdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const error = validateFullName(fullName, font);
  if (error) return { error };

  const text = `For the exclusive personal use of ${fullName}`;
  const textWidth = font.widthOfTextAtSize(text, WATERMARK_FONT_SIZE);
  const textHeight = font.heightAtSize(WATERMARK_FONT_SIZE, {
    descender: false,
  });

  const pages = pdfDoc.getPages();
  const last = Math.min(LAST_PAGE, pages.length);

  for (let i = FIRST_PAGE - 1; i < last; i++) {
    const page = pages[i];
    const box = page.getCropBox();
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Keep the text upright for readers when the page has a /Rotate entry.
    const angle = page.getRotation().angle % 360;
    const rad = (angle * Math.PI) / 180;
    // Offset from the center to the text origin (bottom-left), rotated.
    const dx = -textWidth / 2;
    const dy = -textHeight / 2;
    const x = centerX + dx * Math.cos(rad) - dy * Math.sin(rad);
    const y = centerY + dx * Math.sin(rad) + dy * Math.cos(rad);

    page.drawText(text, {
      x,
      y,
      size: WATERMARK_FONT_SIZE,
      font,
      color: rgb(0, 0, 0),
      opacity: WATERMARK_OPACITY,
      rotate: degrees(angle),
    });
  }

  pdfDoc.setSubject(`Licensed to ${fullName}`);
  pdfDoc.setModificationDate(new Date());

  return { pdfBytes: await pdfDoc.save(), fullName };
}

module.exports = { watermarkBook, normalizeFullName };
