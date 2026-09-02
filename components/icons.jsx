function Svg({ children, className = 'w-4 h-4', strokeWidth = 2, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p) => <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></Svg>;
export const IconTrophy = (p) => <Svg {...p}><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 5H4v2a4 4 0 0 0 4 4" /><path d="M16 5h4v2a4 4 0 0 1-4 4" /><path d="M10 15v2h4v-2" /><path d="M8 21h8" /><path d="M12 17v4" /></Svg>;
export const IconBookOpen = (p) => <Svg {...p}><path d="M12 6c-1.5-1.3-4-2-7-2v14c3 0 5.5.7 7 2 1.5-1.3 4-2 7-2V4c-3 0-5.5.7-7 2Z" /><path d="M12 6v14" /></Svg>;
export const IconBan = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m5.5 5.5 13 13" /></Svg>;
export const IconGlobe = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9Z" /></Svg>;
export const IconTarget = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></Svg>;
export const IconGamepad = (p) => <Svg {...p}><rect x="2" y="7" width="20" height="11" rx="5" /><path d="M8 10v4M6 12h4" /><circle cx="16.5" cy="10.5" r="0.8" fill="currentColor" /><circle cx="18.5" cy="13" r="0.8" fill="currentColor" /></Svg>;
export const IconHash = (p) => <Svg {...p}><path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16" /></Svg>;
export const IconSettings = (p) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V19.5a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V4.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></Svg>;
export const IconLogOut = (p) => <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></Svg>;
export const IconLogIn = (p) => <Svg {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></Svg>;
export const IconLock = (p) => <Svg {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Svg>;
export const IconUsers = (p) => <Svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16.5 8.3a3.2 3.2 0 1 1 0 6.4" /><path d="M15 13.5c2.6.4 4.5 2 4.9 5.2" /></Svg>;
export const IconCheckCircle = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12.3 2.3 2.3 4.7-5.1" /></Svg>;
export const IconXCircle = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m9.5 9.5 5 5m0-5-5 5" /></Svg>;
export const IconAlertTriangle = (p) => <Svg {...p}><path d="M12 4 3 20h18L12 4Z" /><path d="M12 10.5v4M12 17.2v.3" /></Svg>;
export const IconFlame = (p) => <Svg {...p}><path d="M12 3s4 3.5 4 8a4 4 0 1 1-8 0c0-1 .4-1.8 1-2.5-.1 1.2.6 1.9 1.3 1.9.9 0 1.2-.8 1-1.6-.4-1.4-.3-3 .7-5.8Z" /><path d="M9 15a3 3 0 0 0 6 0c0-1.2-.5-2-1.2-2.8" /></Svg>;
export const IconMessageCircle = (p) => <Svg {...p}><path d="M21 12a8 8 0 1 1-3.3-6.5L21 4l-1 4.2A7.9 7.9 0 0 1 21 12Z" /></Svg>;
export const IconSparkles = (p) => <Svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m6 6 2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></Svg>;
export const IconLink = (p) => <Svg {...p}><path d="M9.5 14.5 14.5 9.5" /><path d="M11 6.5 13 4.5a3.5 3.5 0 0 1 5 5l-2 2" /><path d="M13 17.5 11 19.5a3.5 3.5 0 0 1-5-5l2-2" /></Svg>;
export const IconRocket = (p) => <Svg {...p}><path d="M12 3c2.5 1 5 3.5 5 8 0 2-.7 3.7-1.6 5l-3.4 3-3.4-3C7.7 14.7 7 13 7 11c0-4.5 2.5-7 5-8Z" /><circle cx="12" cy="10" r="1.5" /><path d="M9 17c-1.5.5-2 2-2 4 2 0 3.5-.5 4-2M15 17c1.5.5 2 2 2 4-2 0-3.5-.5-4-2" /></Svg>;
export const IconShieldCheck = (p) => <Svg {...p}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /><path d="m9 12 2 2 4-4" /></Svg>;
export const IconMail = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></Svg>;
export const IconUser = (p) => <Svg {...p}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></Svg>;
export const IconHeart = (p) => <Svg {...p} fill="currentColor" strokeWidth={0}><path d="M12 20.5S3.5 15 3.5 9a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2c0 6-8.5 11.5-8.5 11.5Z" /></Svg>;
export const IconHeartOff = (p) => <Svg {...p}><path d="M12 20.5S3.5 15 3.5 9a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2c0 1.4-.6 2.7-1.5 4" /><path d="m4 4 16 16" /></Svg>;
export const IconLightbulb = (p) => <Svg {...p}><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6h5.4c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" /></Svg>;
export const IconArrowRight = (p) => <Svg {...p}><path d="M4 12h16" /><path d="m13 5 7 7-7 7" /></Svg>;
export const IconRefresh = (p) => <Svg {...p}><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" /><path d="M21 4v4h-4" /><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" /><path d="M3 20v-4h4" /></Svg>;
export const IconSearch = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const IconPin = (p) => <Svg {...p}><path d="M12 2v6l4 4-1 2H9l-1-2 4-4V2Z" /><path d="M12 14v8" /></Svg>;
export const IconChevronLeft = (p) => <Svg {...p}><path d="m15 5-7 7 7 7" /></Svg>;
export const IconChevronRight = (p) => <Svg {...p}><path d="m9 5 7 7-7 7" /></Svg>;
export const IconLoader = (p) => <Svg {...p} className={(p.className||'w-4 h-4') + ' animate-spin'}><path d="M12 3v3" /><path d="M12 18v3" opacity="0.3" /><path d="m18.4 5.6-2.1 2.1" opacity="0.85" /><path d="m7.7 16.3-2.1 2.1" opacity="0.3" /><path d="M21 12h-3" opacity="0.7" /><path d="M6 12H3" opacity="0.3" /><path d="m18.4 18.4-2.1-2.1" opacity="0.5" /><path d="m7.7 7.7-2.1-2.1" opacity="0.15" /></Svg>;
export const IconPlay = (p) => <Svg {...p} fill="currentColor" strokeWidth={0}><path d="M8 5.5v13l11-6.5-11-6.5Z" /></Svg>;
export const IconFrown = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8.5 15.5a4 4 0 0 1 7 0" /><path d="M9 9.5h.01M15 9.5h.01" /></Svg>;
export const IconPartyPopper = (p) => <Svg {...p}><path d="M4 20 14 10" /><path d="M13 3s1 2 0 3-3 0-3 0 1-2 3-3Z" /><path d="M19 8s-2.5.5-3 2 1 2 1 2 2.5-.5 3-2-1-2-1-2Z" /><path d="M17 3v2M21 6h-2M8 13l1 1M6 16l1 1" /></Svg>;
export const IconCopy = (p) => <Svg {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></Svg>;
export const IconCheck = (p) => <Svg {...p}><path d="m5 12.5 4.5 4.5L19 7" /></Svg>;
export const IconKey = (p) => <Svg {...p}><circle cx="7.5" cy="15.5" r="3.5" /><path d="m10.5 12.5 8-8M16 5l2 2M19 3l2 2" /></Svg>;
export const IconEye = (p) => <Svg {...p}><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.7" /></Svg>;
export const IconEyeOff = (p) => <Svg {...p}><path d="M3 3l18 18" /><path d="M10.6 5.7A9.8 9.8 0 0 1 12 5.5c6.5 0 10 6.5 10 6.5a15 15 0 0 1-3.2 3.9M6.6 6.6C4 8.3 2 12 2 12s3.5 6.5 10 6.5c1.4 0 2.6-.3 3.7-.7" /><path d="M9.9 10a2.7 2.7 0 0 0 3.9 3.9" /></Svg>;
export const IconInfo = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><path d="M12 7.7h.01" /></Svg>;
export const IconShield = (p) => <Svg {...p}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /></Svg>;
export const IconMedal = (p) => <Svg {...p}><circle cx="12" cy="15" r="5.5" /><path d="m8.5 10-3-7M15.5 10l3-7" /><path d="m10.2 13.8 1.8 1.8 3-3" /></Svg>;
export const IconClock = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></Svg>;
export const IconDot = ({ className = 'w-2.5 h-2.5', color }) => <span className={`inline-block rounded-full ${className}`} style={{ backgroundColor: color || 'currentColor' }} />;
