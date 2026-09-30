export type NavItem = { label: string; href: string; ready: boolean };

/** 페이지를 만들 때마다 해당 항목의 ready를 true로 바꾼다. */
export const NAV_ITEMS: NavItem[] = [
  { label: "일정", href: "/schedule", ready: true },
  { label: "선수단", href: "/players", ready: true },
  { label: "역사", href: "/history", ready: true },
  { label: "응원", href: "/cheer", ready: true },
  { label: "순위", href: "/standings", ready: true },
  { label: "커뮤니티", href: "/community", ready: false },
];
