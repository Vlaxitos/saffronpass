import { normalizeThemeId } from "@/lib/constants";
import type { ThemeId } from "@/types/database";

export interface InviteThemeTokens {
  id: ThemeId;
  isDark: boolean;
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  innerBorder: string;
  headingText: string;
  subHeadingText: string;
  bodyText: string;
  mutedText: string;
  accentText: string;
  accentHex: string;
  dividerBg: string;
  pillBg: string;
  pillText: string;
  primaryBtn: string;
  secondaryBtn: string;
  inputClass: string;
  subCardActive: string;
  subCardInactive: string;
  countdownCell: string;
  countdownValue: string;
  // Cover specific palette
  coverBackdropClass: string;
  envelopeBody: string;
  envelopeFlapTop: string;
  envelopeFlapBottom: string;
  envelopeSideLeft: string;
  envelopeSideRight: string;
  envelopeStroke: string;
  envelopeNameColor: string;
  envelopeSubColor: string;
  doorFill: string;
  doorInner: string;
  doorFiligree: string;
  doorPlaque: string;
  useLightSeal: boolean;
}

const THEME_MAP: Record<ThemeId, InviteThemeTokens> = {
  royal_saffron: {
    id: "royal_saffron",
    isDark: false,
    pageBg: "bg-parchment",
    cardBg: "bg-[#FFFDF8]",
    cardBorder: "border-[#C88A2E]/40",
    innerBorder: "border-[#C88A2E]/25",
    headingText: "text-[#4A101C]",
    subHeadingText: "text-[#7A5B47]",
    bodyText: "text-[#55443D]",
    mutedText: "text-[#7A6258]",
    accentText: "text-[#C88A2E]",
    accentHex: "#C88A2E",
    dividerBg: "bg-[#C88A2E]",
    pillBg: "bg-[#FCF5E8] border-[#C88A2E]/35",
    pillText: "text-[#5B1422]",
    primaryBtn: "bg-[#5B1422] text-[#FCF8F1] hover:bg-[#460E19]",
    secondaryBtn:
      "border-[#5B1422]/25 bg-[#FCF8F1] text-[#5B1422] hover:bg-[#5B1422] hover:text-[#FCF8F1]",
    inputClass:
      "border-[#C88A2E]/35 bg-white text-[#241815] placeholder:text-[#9A877D] focus:border-[#5B1422] focus:ring-[#C88A2E]/25",
    subCardActive: "border-[#C88A2E]/45 bg-[#FCF8F1]",
    subCardInactive: "border-[#241815]/10 bg-white/60",
    countdownCell: "border-[#C88A2E]/30 bg-[#FFFDF8]",
    countdownValue: "text-[#5B1422]",
    coverBackdropClass: "bg-royal-velvet",
    envelopeBody: "border-[#E7C06B]/30 bg-[#5B1422]",
    envelopeFlapTop: "#671727",
    envelopeFlapBottom: "#4E101D",
    envelopeSideLeft: "rgba(70,13,24,0.55)",
    envelopeSideRight: "rgba(62,11,21,0.68)",
    envelopeStroke: "rgba(231,192,107,0.38)",
    envelopeNameColor: "text-[#FCF8F1]",
    envelopeSubColor: "text-[#E7C06B]/85",
    doorFill: "#54111F",
    doorInner: "#450D19",
    doorFiligree: "#E4BE6A",
    doorPlaque: "border-[#E7C06B]/45 bg-[#3F0B16]/90 text-[#FCF8F1]",
    useLightSeal: false,
  },

  minimal_ivory: {
    id: "minimal_ivory",
    isDark: false,
    pageBg: "bg-[#FAF6EF]",
    cardBg: "bg-white",
    cardBorder: "border-[#C88A2E]/30",
    innerBorder: "border-[#C88A2E]/20",
    headingText: "text-[#2B211E]",
    subHeadingText: "text-[#7A6A5E]",
    bodyText: "text-[#4D423D]",
    mutedText: "text-[#7D7068]",
    accentText: "text-[#A68246]",
    accentHex: "#A68246",
    dividerBg: "bg-[#A68246]",
    pillBg: "bg-[#FAF5EC] border-[#A68246]/30",
    pillText: "text-[#2B211E]",
    primaryBtn: "bg-[#2B211E] text-[#FAF6EF] hover:bg-[#1C1513]",
    secondaryBtn:
      "border-[#2B211E]/20 bg-[#FAF6EF] text-[#2B211E] hover:bg-[#2B211E] hover:text-[#FAF6EF]",
    inputClass:
      "border-[#A68246]/35 bg-white text-[#2B211E] placeholder:text-[#9C9088] focus:border-[#2B211E] focus:ring-[#A68246]/25",
    subCardActive: "border-[#A68246]/40 bg-[#FAF6EF]",
    subCardInactive: "border-[#2B211E]/10 bg-white/70",
    countdownCell: "border-[#A68246]/25 bg-white",
    countdownValue: "text-[#2B211E]",
    coverBackdropClass: "bg-minimal-pearl",
    envelopeBody: "border-[#C88A2E]/35 bg-[#F5EDE0]",
    envelopeFlapTop: "#FAF5EC",
    envelopeFlapBottom: "#EFE5D5",
    envelopeSideLeft: "rgba(235,223,204,0.52)",
    envelopeSideRight: "rgba(230,217,196,0.62)",
    envelopeStroke: "rgba(188,138,56,0.4)",
    envelopeNameColor: "text-[#3D161E]",
    envelopeSubColor: "text-[#8A6D46]",
    doorFill: "#F5EDE0",
    doorInner: "#EFE5D4",
    doorFiligree: "#B58942",
    doorPlaque: "border-[#C88A2E]/45 bg-[#FCF8F1]/95 text-[#2B211E]",
    useLightSeal: true,
  },

  pastel_udaipur: {
    id: "pastel_udaipur",
    isDark: false,
    pageBg: "bg-pastel-udaipur",
    cardBg: "bg-[#FFFBF8]",
    cardBorder: "border-[#C99A5B]/45",
    innerBorder: "border-[#D7A98B]/35",
    headingText: "text-[#6E2C36]",
    subHeadingText: "text-[#9A5B5F]",
    bodyText: "text-[#5C3F41]",
    mutedText: "text-[#8B6B6B]",
    accentText: "text-[#B88346]",
    accentHex: "#C99A5B",
    dividerBg: "bg-[#C99A5B]",
    pillBg: "bg-[#FCEEE7] border-[#C99A5B]/40",
    pillText: "text-[#6E2C36]",
    primaryBtn: "bg-[#7A2E3A] text-[#FFF8F3] hover:bg-[#61212B]",
    secondaryBtn:
      "border-[#7A2E3A]/25 bg-[#FDF3EC] text-[#7A2E3A] hover:bg-[#7A2E3A] hover:text-[#FFF8F3]",
    inputClass:
      "border-[#C99A5B]/40 bg-white text-[#3F2326] placeholder:text-[#A68786] focus:border-[#7A2E3A] focus:ring-[#C99A5B]/25",
    subCardActive: "border-[#C99A5B]/50 bg-[#FDF3EC]",
    subCardInactive: "border-[#7A2E3A]/10 bg-white/75",
    countdownCell: "border-[#C99A5B]/35 bg-[#FFFBF8]",
    countdownValue: "text-[#6E2C36]",
    coverBackdropClass: "bg-udaipur-blush",
    envelopeBody: "border-[#C99A5B]/45 bg-[#F6DFD3]",
    envelopeFlapTop: "#FBECE4",
    envelopeFlapBottom: "#EED2C4",
    envelopeSideLeft: "rgba(235, 200, 184, 0.58)",
    envelopeSideRight: "rgba(229, 191, 174, 0.68)",
    envelopeStroke: "rgba(184, 131, 70, 0.45)",
    envelopeNameColor: "text-[#6E2C36]",
    envelopeSubColor: "text-[#95585E]",
    doorFill: "#F5DDD1",
    doorInner: "#EDD0C1",
    doorFiligree: "#B68247",
    doorPlaque: "border-[#C99A5B]/50 bg-[#FFFBF8]/95 text-[#6E2C36]",
    useLightSeal: true,
  },

  south_indian_silk: {
    id: "south_indian_silk",
    isDark: false,
    pageBg: "bg-south-silk",
    cardBg: "bg-[#FFFDFA]",
    cardBorder: "border-[#D4A024]/50",
    innerBorder: "border-[#0F4C3A]/22",
    headingText: "text-[#0F4C3A]",
    subHeadingText: "text-[#6D5A36]",
    bodyText: "text-[#36443D]",
    mutedText: "text-[#5D6D65]",
    accentText: "text-[#B8860B]",
    accentHex: "#D4A024",
    dividerBg: "bg-[#D4A024]",
    pillBg: "bg-[#F7F1DF] border-[#D4A024]/45",
    pillText: "text-[#0F4C3A]",
    primaryBtn: "bg-[#0F4C3A] text-[#FDF9F0] hover:bg-[#0B392B]",
    secondaryBtn:
      "border-[#0F4C3A]/30 bg-[#F4F8F5] text-[#0F4C3A] hover:bg-[#0F4C3A] hover:text-[#FDF9F0]",
    inputClass:
      "border-[#D4A024]/45 bg-white text-[#1B2C24] placeholder:text-[#7D8C84] focus:border-[#0F4C3A] focus:ring-[#D4A024]/25",
    subCardActive: "border-[#D4A024]/55 bg-[#FBF7EB]",
    subCardInactive: "border-[#0F4C3A]/12 bg-white/75",
    countdownCell: "border-[#D4A024]/40 bg-[#FFFDFA]",
    countdownValue: "text-[#0F4C3A]",
    coverBackdropClass: "bg-kanjeevaram-emerald",
    envelopeBody: "border-[#E6BE53]/40 bg-[#0F4C3A]",
    envelopeFlapTop: "#145D47",
    envelopeFlapBottom: "#0B3D2E",
    envelopeSideLeft: "rgba(9, 54, 41, 0.58)",
    envelopeSideRight: "rgba(7, 44, 33, 0.7)",
    envelopeStroke: "rgba(230, 190, 83, 0.45)",
    envelopeNameColor: "text-[#FDF9F0]",
    envelopeSubColor: "text-[#EBD07E]/90",
    doorFill: "#0E4635",
    doorInner: "#093628",
    doorFiligree: "#E5BF56",
    doorPlaque: "border-[#E5BF56]/50 bg-[#0A3528]/92 text-[#FDF9F0]",
    useLightSeal: false,
  },

  dark_sangeet_glam: {
    id: "dark_sangeet_glam",
    isDark: true,
    pageBg: "bg-dark-sangeet",
    cardBg: "bg-[#211026]/95",
    cardBorder: "border-[#E8C67A]/35",
    innerBorder: "border-[#E8C67A]/20",
    headingText: "text-[#F7E5B7]",
    subHeadingText: "text-[#DFC28C]",
    bodyText: "text-[#E9DED8]",
    mutedText: "text-[#BFAFB8]",
    accentText: "text-[#E8C67A]",
    accentHex: "#E8C67A",
    dividerBg: "bg-[#E8C67A]",
    pillBg: "bg-[#311738] border-[#E8C67A]/35",
    pillText: "text-[#F7E5B7]",
    primaryBtn: "bg-[#E0B85C] text-[#1A0B1E] hover:bg-[#ECC978]",
    secondaryBtn:
      "border-[#E8C67A]/40 bg-[#2C1433] text-[#F7E5B7] hover:bg-[#E0B85C] hover:text-[#1A0B1E]",
    inputClass:
      "border-[#E8C67A]/30 bg-[#170A1B] text-[#FAF3EC] placeholder:text-[#8E7C8D] focus:border-[#E8C67A] focus:ring-[#E8C67A]/25",
    subCardActive: "border-[#E8C67A]/45 bg-[#2B1432]",
    subCardInactive: "border-[#E8C67A]/15 bg-[#1B0D20]/80",
    countdownCell: "border-[#E8C67A]/30 bg-[#190C1D]",
    countdownValue: "text-[#F7E5B7]",
    coverBackdropClass: "bg-dark-sangeet",
    envelopeBody: "border-[#E8C67A]/35 bg-[#231029]",
    envelopeFlapTop: "#2E1636",
    envelopeFlapBottom: "#1B0B20",
    envelopeSideLeft: "rgba(22, 9, 27, 0.65)",
    envelopeSideRight: "rgba(17, 7, 21, 0.78)",
    envelopeStroke: "rgba(232, 198, 122, 0.4)",
    envelopeNameColor: "text-[#F7E5B7]",
    envelopeSubColor: "text-[#E8C67A]/85",
    doorFill: "#200E25",
    doorInner: "#16091A",
    doorFiligree: "#E8C67A",
    doorPlaque: "border-[#E8C67A]/45 bg-[#190B1E]/94 text-[#F7E5B7]",
    useLightSeal: false,
  },
};

export function getInviteTheme(themeId: string | null | undefined): InviteThemeTokens {
  return THEME_MAP[normalizeThemeId(themeId)];
}
