import { Font } from "@react-pdf/renderer";
import path from "node:path";
import fs from "node:fs";

let fontsRegistered = false;

export function registerAppFonts() {
  if (fontsRegistered) return;
  fontsRegistered = true;

  try {
    const regularPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "LiberationSans-Regular.ttf"
    );
    const boldPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "LiberationSans-Bold.ttf"
    );

    const hasRegular = fs.existsSync(regularPath);
    const hasBold = fs.existsSync(boldPath);

    Font.register({
      family: "LiberationSans",
      fonts: [
        {
          src: hasRegular
            ? regularPath
            : "https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf",
          fontWeight: "normal",
        },
        {
          src: hasBold
            ? boldPath
            : "https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica-bold@1.0.4/Helvetica-Bold.ttf",
          fontWeight: "bold",
        },
      ],
    });
  } catch (err) {
    console.warn("[PDF Font] Failed to register fonts:", err);
  }
}
