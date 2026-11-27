import { ImageResponse } from "next/og";

interface OgPalette {
  bg: string;
  card: string;
  border: string;
  heading: string;
  accent: string;
  sub: string;
}

function getOgPalette(theme: string | null): OgPalette {
  switch (theme) {
    case "minimal_ivory":
      return {
        bg: "#F4ECE0",
        card: "#FFFDF9",
        border: "#B89457",
        heading: "#2B211E",
        accent: "#A68246",
        sub: "#6E5E54",
      };
    case "pastel_udaipur":
      return {
        bg: "#F8E5DA",
        card: "#FFFBF8",
        border: "#C99A5B",
        heading: "#6E2C36",
        accent: "#B88346",
        sub: "#8B5A5D",
      };
    case "south_indian_silk":
      return {
        bg: "#0B3C2E",
        card: "#0F4C3A",
        border: "#E5BF56",
        heading: "#FDF9F0",
        accent: "#E5BF56",
        sub: "#D7E8DF",
      };
    case "dark_sangeet_glam":
      return {
        bg: "#130816",
        card: "#211026",
        border: "#E8C67A",
        heading: "#F7E5B7",
        accent: "#E8C67A",
        sub: "#D8C6D0",
      };
    default:
      return {
        bg: "#3E0B16",
        card: "#5B1422",
        border: "#E7C06B",
        heading: "#FCF8F1",
        accent: "#E7C06B",
        sub: "#F4E4C1",
      };
  }
}

/**
 * Dynamic WhatsApp / Open Graph preview card generator.
 * Renders a royal 1200x630 SaffronPass invitation card using ONLY safe public metadata
 * (couple/host names, event title, and main date — NEVER private sub-event names).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const names = (searchParams.get("names") || "SaffronPass Celebration")
    .trim()
    .slice(0, 72);
  const title = (searchParams.get("title") || "Interactive Royal Invitation")
    .trim()
    .slice(0, 90);
  const date = (searchParams.get("date") || "").trim().slice(0, 56);
  const theme = searchParams.get("theme");
  const palette = getOgPalette(theme);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.bg,
          padding: "42px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: palette.card,
            border: `2px solid ${palette.border}`,
            borderRadius: "28px",
            padding: "56px 72px",
            position: "relative",
            textAlign: "center",
          }}
        >
          {/* Inner hairline border */}
          <div
            style={{
              position: "absolute",
              inset: "16px",
              border: `1px solid ${palette.border}`,
              opacity: 0.45,
              borderRadius: "18px",
              display: "flex",
            }}
          />

          <div
            style={{
              fontSize: "20px",
              letterSpacing: "7px",
              textTransform: "uppercase",
              color: palette.accent,
              fontFamily: "sans-serif",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            YOU ARE CORDIALLY INVITED
          </div>

          <div
            style={{
              fontSize: "74px",
              fontWeight: 700,
              color: palette.heading,
              lineHeight: 1.08,
              maxWidth: "920px",
            }}
          >
            {names}
          </div>

          <div
            style={{
              fontSize: "34px",
              fontStyle: "italic",
              color: palette.sub,
              marginTop: "18px",
              maxWidth: "860px",
            }}
          >
            {title}
          </div>

          {/* Ornamental divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              marginTop: "32px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "84px",
                height: "2px",
                backgroundColor: palette.border,
                opacity: 0.7,
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: palette.accent,
                transform: "rotate(45deg)",
              }}
            />
            <div
              style={{
                width: "84px",
                height: "2px",
                backgroundColor: palette.border,
                opacity: 0.7,
              }}
            />
          </div>

          {date ? (
            <div
              style={{
                fontSize: "24px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: palette.heading,
                fontFamily: "sans-serif",
                fontWeight: 600,
              }}
            >
              {date}
            </div>
          ) : null}

          <div
            style={{
              position: "absolute",
              bottom: "30px",
              fontSize: "17px",
              letterSpacing: "5px",
              textTransform: "uppercase",
              color: palette.accent,
              fontFamily: "sans-serif",
              opacity: 0.9,
            }}
          >
            SAFFRONPASS · TAP TO OPEN INVITATION
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
