// Bo icon dung chung cho toan bo web app - thay the emoji bang SVG line-icon
// toi gian, mot mau (currentColor), phong cach giong bo icon mac dinh hay
// dung trong cac du an Next.js (Lucide/Feather style: net mong, bo tron).
// Dung <IconName className="w-4 h-4" /> - mau va kich thuoc ke thua tu CSS.

function Svg({ children, className = 'w-4 h-4', strokeWidth = 2, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconHome(props) {
  return <Svg {...props}><path d="M3 10.8 12 3l9 7.8" /><path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" /><path d="M9.5 21v-6h5v6" /></Svg>;
}
export function IconTrophy(props) {
  return <Svg {...props}><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 5H4a2 2 0 0 0 2 3.2M17 5h3a2 2 0 0 1-2 3.2" /><path d="M10 17v2h4v-2M8 21h8" /></Svg>;
}
export function IconBookOpen(props) {
  return <Svg {...props}><path d="M12 6.5c-1.6-1.4-4-2-6.5-1.7v13c2.5-.3 4.9.3 6.5 1.7 1.6-1.4 4-2 6.5-1.7v-13c-2.5-.3-4.9.3-6.5 1.7Z" /><path d="M12 6.5v13" /></Svg>;
}
export function IconBan(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M6.5 6.5l11 11" /></Svg>;
}
export function IconGlobe(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z" /></Svg>;
}
export function IconTarget(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.7" fill="currentColor" /></Svg>;
}
export function IconGamepad(props) {
  return <Svg {...props}><rect x="2.5" y="7.5" width="19" height="11" rx="4.5" /><path d="M7 11v3M5.5 12.5h3" /><circle cx="15.5" cy="11" r="0.8" fill="currentColor" /><circle cx="18" cy="13.5" r="0.8" fill="currentColor" /></Svg>;
}
export function IconHash(props) {
  return <Svg {...props}><path d="M9 3.5 6.5 20.5M17.5 3.5 15 20.5M4 9h17M3 15h17" /></Svg>;
}
export function IconSettings(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="3.2" /><path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M17.8 6.2l-1.6 1.6M7.8 16.2l-1.6 1.6M17.8 17.8l-1.6-1.6M7.8 7.8 6.2 6.2" /></Svg>;
}
export function IconLogOut(props) {
  return <Svg {...props}><path d="M9 21H5.5a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 5.5 3H9" /><path d="M16 17l5-5-5-5M21 12H9" /></Svg>;
}
export function IconLogIn(props) {
  return <Svg {...props}><path d="M15 21h3.5a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 18.5 3H15" /><path d="M10 17l-5-5 5-5M5 12h12" /></Svg>;
}
export function IconLock(props) {
  return <Svg {...props}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Svg>;
}
export function IconUsers(props) {
  return <Svg {...props}><circle cx="9" cy="8" r="3.2" /><path d="M2.8 19c.6-3 2.9-5 6.2-5s5.6 2 6.2 5" /><path d="M15.5 5.2A3.2 3.2 0 0 1 16 11.4" /><path d="M16.5 14.2c2.6.5 4.4 2.2 4.9 4.8" /></Svg>;
}
export function IconCheckCircle(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M8.3 12.3l2.6 2.6 5-5.2" /></Svg>;
}
export function IconXCircle(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M9 9l6 6M15 9l-6 6" /></Svg>;
}
export function IconAlertTriangle(props) {
  return <Svg {...props}><path d="M12 4 3 20h18L12 4Z" /><path d="M12 10.5v3.5M12 17v.2" /></Svg>;
}
export function IconFlame(props) {
  return <Svg {...props}><path d="M12 2.5c1 2.5-2 3.8-2 6.8a2.5 2.5 0 0 0 5 0c0-1 .5-1.5 1-1 1 1 2 2.7 2 5a6 6 0 0 1-12 0c0-4.5 3-6 6-10.8Z" /></Svg>;
}
export function IconMessageCircle(props) {
  return <Svg {...props}><path d="M21 12a9 9 0 1 1-3.6-7.2" /><path d="M21 12a9 9 0 0 0-16.8-4.5" /><path d="M3 21l1.6-4.3A9 9 0 0 1 3 12" /></Svg>;
}
export function IconSparkles(props) {
  return <Svg {...props}><path d="M11 3l1.3 3.6L16 8l-3.7 1.4L11 13l-1.3-3.6L6 8l3.7-1.4L11 3Z" /><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8.8-2.2Z" /></Svg>;
}
export function IconLink(props) {
  return <Svg {...props}><path d="M9.5 14.5 14.5 9.5" /><path d="M11 6.5l1.6-1.6a3.5 3.5 0 0 1 5 5L16 11.5" /><path d="M13 17.5l-1.6 1.6a3.5 3.5 0 0 1-5-5L8 12.5" /></Svg>;
}
export function IconRocket(props) {
  return <Svg {...props}><path d="M12 3c2.5 1.2 4.5 4 4.9 8.2.1 1.4-.2 3-1 4.3l-1.5-1v-3l-2.4-2.4-2.4 2.4v3l-1.5 1c-.8-1.3-1.1-2.9-1-4.3C7.5 7 9.5 4.2 12 3Z" /><path d="M9.5 17.5 8 21l2.3-1.2M14.5 17.5 16 21l-2.3-1.2" /><circle cx="12" cy="11" r="1.2" fill="currentColor" /></Svg>;
}
export function IconShieldCheck(props) {
  return <Svg {...props}><path d="M12 3.5 19 6.3v5.4c0 5-3 7.8-7 9-4-1.2-7-4-7-9V6.3L12 3.5Z" /><path d="M9 12.2l2.2 2.2 4-4.2" /></Svg>;
}
export function IconMail(props) {
  return <Svg {...props}><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M4 7l8 6 8-6" /></Svg>;
}
export function IconUser(props) {
  return <Svg {...props}><circle cx="12" cy="8.2" r="3.5" /><path d="M4.8 19.5c.8-3.4 3.4-5.5 7.2-5.5s6.4 2.1 7.2 5.5" /></Svg>;
}
export function IconHeart(props) {
  return <Svg {...props}><path d="M12 20.2s-7.8-4.6-7.8-10.3A4.4 4.4 0 0 1 12 6.9a4.4 4.4 0 0 1 7.8 3c0 5.7-7.8 10.3-7.8 10.3Z" /></Svg>;
}
export function IconHeartOff(props) {
  return <Svg {...props}><path d="M12 20.2s-7.8-4.6-7.8-10.3A4.4 4.4 0 0 1 12 6.9a4.4 4.4 0 0 1 7.8 3c0 5.7-7.8 10.3-7.8 10.3Z" opacity="0.35" /></Svg>;
}
export function IconLightbulb(props) {
  return <Svg {...props}><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.4 10.9c.5.4.9 1 .9 1.6v.5h5v-.5c0-.6.4-1.2.9-1.6A6 6 0 0 0 12 3Z" /></Svg>;
}
export function IconArrowRight(props) {
  return <Svg {...props}><path d="M4.5 12h15M13.5 6l6 6-6 6" /></Svg>;
}
export function IconRefresh(props) {
  return <Svg {...props}><path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5" /><path d="M20 4v4.5h-4.5" /><path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5" /><path d="M4 20v-4.5h4.5" /></Svg>;
}
export function IconSearch(props) {
  return <Svg {...props}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M19.5 19.5 15 15" /></Svg>;
}
export function IconPin(props) {
  return <Svg {...props}><path d="M12 2.8a4.6 4.6 0 0 1 4.6 4.6c0 3.4-4.6 8.4-4.6 8.4s-4.6-5-4.6-8.4A4.6 4.6 0 0 1 12 2.8Z" /><circle cx="12" cy="7.4" r="1.6" /><path d="M12 15.8V21" /></Svg>;
}
export function IconChevronLeft(props) {
  return <Svg {...props}><path d="M15 5l-7 7 7 7" /></Svg>;
}
export function IconChevronRight(props) {
  return <Svg {...props}><path d="M9 5l7 7-7 7" /></Svg>;
}
export function IconLoader(props) {
  return <Svg {...props}><path d="M12 3v3.5M12 17.5V21M4.9 4.9l2.5 2.5M16.6 16.6l2.5 2.5M3 12h3.5M17.5 12H21M4.9 19.1l2.5-2.5M16.6 7.4l2.5-2.5" /></Svg>;
}
export function IconPlay(props) {
  return <Svg {...props}><path d="M6.5 4.5v15l13-7.5-13-7.5Z" strokeLinejoin="round" /></Svg>;
}
export function IconFrown(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M8.5 15.5c.9-1.2 2.1-1.8 3.5-1.8s2.6.6 3.5 1.8" /><path d="M9 9.5h.1M15 9.5h.1" strokeWidth="3" /></Svg>;
}
export function IconPartyPopper(props) {
  return <Svg {...props}><path d="M4 20 14.5 9.5" /><path d="M11 3.5c1 1.7 2.6 2.6 4.6 2.6M17.5 6c1 1.2 1.7 2.7 1.9 4.4M14 3c1.6.5 2.7 1.6 3.4 3.1" /><path d="M4.5 15.5l1.4 3.6L9.5 20" /><circle cx="18.5" cy="14.5" r="0.8" fill="currentColor" /><circle cx="20" cy="18.5" r="0.8" fill="currentColor" /></Svg>;
}
export function IconCopy(props) {
  return <Svg {...props}><rect x="9" y="9" width="11.5" height="11.5" rx="2" /><path d="M5.5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5v1" /></Svg>;
}
export function IconCheck(props) {
  return <Svg {...props}><path d="M4.5 12.5l5 5 10-11" /></Svg>;
}
export function IconKey(props) {
  return <Svg {...props}><circle cx="8" cy="15" r="4" /><path d="M11 12l8.5-8.5M16.5 6l2 2M14 8.5l1.7 1.7" /></Svg>;
}
export function IconEye(props) {
  return <Svg {...props}><path d="M2.5 12C3.8 7.9 7.6 5 12 5s8.2 2.9 9.5 7c-1.3 4.1-5.1 7-9.5 7s-8.2-2.9-9.5-7Z" /><circle cx="12" cy="12" r="3" /></Svg>;
}
export function IconEyeOff(props) {
  return <Svg {...props}><path d="M3 3l18 18" /><path d="M13.9 14.1a3 3 0 0 1-4-4M9.9 5.2A9.7 9.7 0 0 1 12 5c4.4 0 8.2 2.9 9.5 7a10 10 0 0 1-3.1 4.2M6.2 6.7A10 10 0 0 0 2.5 12c1.3 4.1 5.1 7 9.5 7 1.1 0 2.1-.2 3.1-.5" /></Svg>;
}
export function IconInfo(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8h.1" strokeWidth="3" /></Svg>;
}
export function IconShield(props) {
  return <Svg {...props}><path d="M12 3.5 19 6.3v5.4c0 5-3 7.8-7 9-4-1.2-7-4-7-9V6.3L12 3.5Z" /></Svg>;
}
export function IconMedal(props) {
  return <Svg {...props}><circle cx="12" cy="15" r="5.5" /><path d="M9.5 10 7 3.5h3l2 4.7 2-4.7h3L14.5 10" /><path d="M12 12.3v5.4" /></Svg>;
}
export function IconClock(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3.2 2" /></Svg>;
}
export function IconDot(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /></Svg>;
}
