import { Font } from "@react-pdf/renderer";
import path from "node:path";
import fs from "node:fs";

let fontsRegistered = false;

function findFontPath(filename: string): string | null {
  const candidates = [
    path.join(process.cwd(), "assets", "fonts", filename),
    path.join(process.cwd(), "public", "fonts", filename),
    path.join(process.cwd(), "public", "assets", "fonts", filename),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
      return candidate;
    }
  }
  return null;
}

export function registerAppFonts() {
  if (fontsRegistered) return;
  fontsRegistered = true;

  try {
    const robotoRegular =
      findFontPath("Roboto-Regular.ttf") ||
      findFontPath("Roboto-VariableFont_wdth,wght.ttf") ||
      findFontPath("LiberationSans-Regular.ttf");

    const robotoBold =
      findFontPath("Roboto-Bold.ttf") ||
      findFontPath("LiberationSans-Bold.ttf");

    // Register Roboto (used in Invoice PDF)
    Font.register({
      family: "Roboto",
      fonts: [
        {
          src:
            robotoRegular ||
            "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
          fontWeight: "normal",
        },
        {
          src:
            robotoBold ||
            "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
          fontWeight: "bold",
        },
      ],
    });

    // Also register LiberationSans (used in Bouquet PDF)
    Font.register({
      family: "LiberationSans",
      fonts: [
        {
          src:
            robotoRegular ||
            "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
          fontWeight: "normal",
        },
        {
          src:
            robotoBold ||
            "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
          fontWeight: "bold",
        },
      ],
    });

    // Override Helvetica so any react-pdf default fallback will never try to require Helvetica.cjs
    Font.register({
      family: "Helvetica",
      fonts: [
        {
          src:
            robotoRegular ||
            "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
          fontWeight: "normal",
        },
        {
          src:
            robotoBold ||
            "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
          fontWeight: "bold",
        },
      ],
    });
  } catch (err) {
    console.warn("[PDF Font] Failed to register fonts:", err);
  }
}
