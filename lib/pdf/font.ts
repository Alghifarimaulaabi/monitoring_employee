import { Font } from "@react-pdf/renderer";
import { robotoRegularBase64, robotoBoldBase64 } from "./roboto-base64";

let fontsRegistered = false;

export function registerAppFonts() {
  if (fontsRegistered) return;
  fontsRegistered = true;

  try {
    // 1. Register Roboto (used in Invoice PDF)
    Font.register({
      family: "Roboto",
      fonts: [
        {
          src: robotoRegularBase64,
          fontWeight: "normal",
        },
        {
          src: robotoBoldBase64,
          fontWeight: "bold",
        },
      ],
    });

    // 2. Register LiberationSans (used in Bouquet PDF)
    Font.register({
      family: "LiberationSans",
      fonts: [
        {
          src: robotoRegularBase64,
          fontWeight: "normal",
        },
        {
          src: robotoBoldBase64,
          fontWeight: "bold",
        },
      ],
    });

    // 3. Override Helvetica so that any react-pdf default fallback will NEVER try to require Helvetica.cjs
    Font.register({
      family: "Helvetica",
      fonts: [
        {
          src: robotoRegularBase64,
          fontWeight: "normal",
        },
        {
          src: robotoBoldBase64,
          fontWeight: "bold",
        },
      ],
    });
  } catch (err) {
    console.warn("[PDF Font] Failed to register fonts:", err);
  }
}
