import { normalizeThemeId } from "@/lib/constants";
import type { ThemeId } from "@/types/database";

export interface InviteThemeTokens {
  id: ThemeId;
  isDark: boolean;
  pageBg: string;
  desktopAmbientBg: string;
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
    desktopAmbientBg: "bg-[#26070E]",
    cardBg: "bg-[#FFFDF9]",
    cardBorder: "border-[#B88433]/35",
    innerBorder: "border-[#B88433]/22",
    headingText: "text-[#470F1B]",
    subHeadingText: "text-[#7A5B47]",
    bodyText: "text-[#4E3E37]",
    mutedText: "text-[#796258]",
    accentText: "text-[#B88433]",
    accentHex: "#B88433",
    dividerBg: "bg-[#B88433]",
    pillBg: "bg-[#FBF3E5] border-[#B88433]/30",
    pillText: "text-[#54121F]",
    primaryBtn: "bg-[#54121F] text-[#FBF7F0] hover:bg-[#3D0B16]",
    secondaryBtn:
      "border-[#54121F]/22 bg-[#FBF7F0] text-[#54121F] hover:bg-[#54121F] hover:text-[#FBF7F0]",
    inputClass:
      "border-[#B88433]/32 bg-white text-[#221714] placeholder:text-[#9C897E] focus:border-[#54121F] focus:ring-[#B88433]/25",
    subCardActive: "border-[#B88433]/40 bg-[#FBF6EC]",
    subCardInactive: "border-[#221714]/10 bg-white/65",
    countdownCell: "border-[#B88433]/25 bg-[#FFFDF9]",
    countdownValue: "text-[#54121F]",
    coverBackdropClass: "bg-royal-velvet",
    envelopeBody: "border-[#E7C06B]/30 bg-[#54121F]",
    envelopeFlapTop: "#621625",
    envelopeFlapBottom: "#470F1B",
    envelopeSideLeft: "rgba(62, 11, 21, 0.56)",
    envelopeSideRight: "rgba(52, 8, 17, 0.68)",
    envelopeStroke: "rgba(231, 192, 107, 0.36)",
    envelopeNameColor: "text-[#FBF7F0]",
    envelopeSubColor: "text-[#E7C06B]/85",
    doorFill: "#4F101D",
    doorInner: "#3E0B16",
    doorFiligree: "#E4BE6A",
    doorPlaque: "border-[#E7C06B]/45 bg-[#370A13]/92 text-[#FBF7F0]",
    useLightSeal: false,
  },

  minimal_ivory: {
    id: "minimal_ivory",
    isDark: false,
    pageBg: "bg-minimal-pearl",
    desktopAmbientBg: "bg-[#221C18]",
    cardBg: "bg-[#FFFEFC]",
    cardBorder: "border-[#A68246]/28",
    innerBorder: "border-[#A68246]/18",
    headingText: "text-[#261D1A]",
    subHeadingText: "text-[#77685C]",
    bodyText: "text-[#4A3F3A]",
    mutedText: "text-[#7A6E65]",
    accentText: "text-[#9C783E]",
    accentHex: "#A68246",
    dividerBg: "bg-[#A68246]",
    pillBg: "bg-[#F8F3EA] border-[#A68246]/28",
    pillText: "text-[#261D1A]",
    primaryBtn: "bg-[#261D1A] text-[#F9F5EE] hover:bg-[#17110F]",
    secondaryBtn:
      "border-[#261D1A]/20 bg-[#F9F5EE] text-[#261D1A] hover:bg-[#261D1A] hover:text-[#F9F5EE]",
    inputClass:
      "border-[#A68246]/32 bg-white text-[#261D1A] placeholder:text-[#9D9189] focus:border-[#261D1A] focus:ring-[#A68246]/22",
    subCardActive: "border-[#A68246]/36 bg-[#F9F5EE]",
    subCardInactive: "border-[#261D1A]/10 bg-white/75",
    countdownCell: "border-[#A68246]/24 bg-white",
    countdownValue: "text-[#261D1A]",
    coverBackdropClass: "bg-minimal-pearl",
    envelopeBody: "border-[#B89253]/35 bg-[#F3EADD]",
    envelopeFlapTop: "#F9F4EB",
    envelopeFlapBottom: "#EBE1D0",
    envelopeSideLeft: "rgba(232, 220, 200, 0.56)",
    envelopeSideRight: "rgba(225, 212, 190, 0.66)",
    envelopeStroke: "rgba(166, 130, 70, 0.38)",
    envelopeNameColor: "text-[#2E1E1A]",
    envelopeSubColor: "text-[#846945]",
    doorFill: "#F2E9DB",
    doorInner: "#EAE0CE",
    doorFiligree: "#AC8343",
    doorPlaque: "border-[#B89253]/42 bg-[#FFFDF9]/95 text-[#261D1A]",
    useLightSeal: true,
  },

  pastel_udaipur: {
    id: "pastel_udaipur",
    isDark: false,
    pageBg: "bg-pastel-udaipur",
    desktopAmbientBg: "bg-[#2F161B]",
    cardBg: "bg-[#FFFBF8]",
    cardBorder: "border-[#C49456]/40",
    innerBorder: "border-[#D4A688]/30",
    headingText: "text-[#682833]",
    subHeadingText: "text-[#94565B]",
    bodyText: "text-[#583C3E]",
    mutedText: "text-[#886869]",
    accentText: "text-[#B17D42]",
    accentHex: "#C49456",
    dividerBg: "bg-[#C49456]",
    pillBg: "bg-[#FCEEE6] border-[#C49456]/35",
    pillText: "text-[#682833]",
    primaryBtn: "bg-[#722A37] text-[#FFF8F3] hover:bg-[#5A1E29]",
    secondaryBtn:
      "border-[#722A37]/24 bg-[#FDF2EB] text-[#722A37] hover:bg-[#722A37] hover:text-[#FFF8F3]",
    inputClass:
      "border-[#C49456]/38 bg-white text-[#3C2124] placeholder:text-[#A58686] focus:border-[#722A37] focus:ring-[#C49456]/25",
    subCardActive: "border-[#C49456]/45 bg-[#FDF2EB]",
    subCardInactive: "border-[#722A37]/10 bg-white/75",
    countdownCell: "border-[#C49456]/32 bg-[#FFFBF8]",
    countdownValue: "text-[#682833]",
    coverBackdropClass: "bg-udaipur-blush",
    envelopeBody: "border-[#C49456]/40 bg-[#F4DBCE]",
    envelopeFlapTop: "#FAEAE1",
    envelopeFlapBottom: "#EBCDC0",
    envelopeSideLeft: "rgba(232, 195, 179, 0.56)",
    envelopeSideRight: "rgba(224, 186, 168, 0.66)",
    envelopeStroke: "rgba(177, 125, 66, 0.42)",
    envelopeNameColor: "text-[#682833]",
    envelopeSubColor: "text-[#92545A]",
    doorFill: "#F2D9CC",
    doorInner: "#E9CABA",
    doorFiligree: "#B07C43",
    doorPlaque: "border-[#C49456]/46 bg-[#FFFBF8]/95 text-[#682833]",
    useLightSeal: true,
  },

  south_indian_silk: {
    id: "south_indian_silk",
    isDark: false,
    pageBg: "bg-south-silk",
    desktopAmbientBg: "bg-[#062018]",
    cardBg: "bg-[#FFFDFA]",
    cardBorder: "border-[#CE9C26]/45",
    innerBorder: "border-[#0E4635]/20",
    headingText: "text-[#0E4635]",
    subHeadingText: "text-[#6B5835]",
    bodyText: "text-[#33423B]",
    mutedText: "text-[#5A6B63]",
    accentText: "text-[#B18110]",
    accentHex: "#CE9C26",
    dividerBg: "bg-[#CE9C26]",
    pillBg: "bg-[#F7F0DE] border-[#CE9C26]/40",
    pillText: "text-[#0E4635]",
    primaryBtn: "bg-[#0E4635] text-[#FCF8EF] hover:bg-[#093326]",
    secondaryBtn:
      "border-[#0E4635]/28 bg-[#F4F8F5] text-[#0E4635] hover:bg-[#0E4635] hover:text-[#FCF8EF]",
    inputClass:
      "border-[#CE9C26]/42 bg-white text-[#1A2B23] placeholder:text-[#7B8B83] focus:border-[#0E4635] focus:ring-[#CE9C26]/25",
    subCardActive: "border-[#CE9C26]/50 bg-[#FBF6E9]",
    subCardInactive: "border-[#0E4635]/12 bg-white/75",
    countdownCell: "border-[#CE9C26]/36 bg-[#FFFDFA]",
    countdownValue: "text-[#0E4635]",
    coverBackdropClass: "bg-kanjeevaram-emerald",
    envelopeBody: "border-[#E3BC54]/38 bg-[#0E4635]",
    envelopeFlapTop: "#135843",
    envelopeFlapBottom: "#0A382A",
    envelopeSideLeft: "rgba(8, 50, 38, 0.58)",
    envelopeSideRight: "rgba(6, 40, 30, 0.7)",
    envelopeStroke: "rgba(227, 188, 84, 0.42)",
    envelopeNameColor: "text-[#FCF8EF]",
    envelopeSubColor: "text-[#E9CE7C]/90",
    doorFill: "#0D4232",
    doorInner: "#083124",
    doorFiligree: "#E3BC54",
    doorPlaque: "border-[#E3BC54]/46 bg-[#082F23]/92 text-[#FCF8EF]",
    useLightSeal: false,
  },

  dark_sangeet_glam: {
    id: "dark_sangeet_glam",
    isDark: true,
    pageBg: "bg-dark-sangeet",
    desktopAmbientBg: "bg-[#0B040D]",
    cardBg: "bg-[#1F0F24]/95",
    cardBorder: "border-[#E2BD72]/32",
    innerBorder: "border-[#E2BD72]/18",
    headingText: "text-[#F6E4B8]",
    subHeadingText: "text-[#DCC08B]",
    bodyText: "text-[#E6DAD4]",
    mutedText: "text-[#BBAAB4]",
    accentText: "text-[#E2BD72]",
    accentHex: "#E2BD72",
    dividerBg: "bg-[#E2BD72]",
    pillBg: "bg-[#2F1536] border-[#E2BD72]/32",
    pillText: "text-[#F6E4B8]",
    primaryBtn: "bg-[#DCBA68] text-[#17091B] hover:bg-[#E8C97F]",
    secondaryBtn:
      "border-[#E2BD72]/38 bg-[#2A1230] text-[#F6E4B8] hover:bg-[#DCBA68] hover:text-[#17091B]",
    inputClass:
      "border-[#E2BD72]/30 bg-[#150919] text-[#F8F1EA] placeholder:text-[#8E7B8C] focus:border-[#E2BD72] focus:ring-[#E2BD72]/25",
    subCardActive: "border-[#E2BD72]/42 bg-[#291230]",
    subCardInactive: "border-[#E2BD72]/14 bg-[#190B1E]/80",
    countdownCell: "border-[#E2BD72]/28 bg-[#170A1B]",
    countdownValue: "text-[#F6E4B8]",
    coverBackdropClass: "bg-dark-sangeet",
    envelopeBody: "border-[#E2BD72]/34 bg-[#220F27]",
    envelopeFlapTop: "#2C1533",
    envelopeFlapBottom: "#190A1E",
    envelopeSideLeft: "rgba(20, 8, 25, 0.66)",
    envelopeSideRight: "rgba(15, 6, 19, 0.78)",
    envelopeStroke: "rgba(226, 189, 114, 0.38)",
    envelopeNameColor: "text-[#F6E4B8]",
    envelopeSubColor: "text-[#E2BD72]/85",
    doorFill: "#1E0D23",
    doorInner: "#140818",
    doorFiligree: "#E2BD72",
    doorPlaque: "border-[#E2BD72]/42 bg-[#16091B]/94 text-[#F6E4B8]",
    useLightSeal: false,
  },
};

export function getInviteTheme(
  themeId: string | null | undefined
): InviteThemeTokens {
  return THEME_MAP[normalizeThemeId(themeId)];
}
