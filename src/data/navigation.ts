import { siteContent } from "./siteContent";

const { nav } = siteContent;

export type NavLeaf = {
  to: string;
  label: string;
  end?: boolean;
};

export type NavBranch = {
  label: string;
  children: NavLeaf[];
};

export type NavItem = NavLeaf | NavBranch;

export const MAIN_NAV: NavItem[] = [
  { to: "/", label: nav.home, end: true },
  { to: "/chi-siamo", label: nav.chiSiamo },
  { to: "/consulti", label: nav.consulti },
  { to: "/rituali", label: nav.rituali },
  { to: "/blog", label: nav.blog },
  { to: "/contatti", label: nav.contatti },
  {
    label: nav.tarocchi,
    children: [
      { to: "/arcani", label: nav.arcaniMaggiori },
      { to: "/arcani-minori", label: nav.arcaniMinori },
    ],
  },
];

export function isNavBranch(item: NavItem): item is NavBranch {
  return "children" in item;
}

export function flattenNav(items: NavItem[]): NavLeaf[] {
  return items.flatMap((item) => (isNavBranch(item) ? item.children : [item]));
}

export function isTarocchiPath(pathname: string) {
  return pathname === "/arcani" || pathname.startsWith("/arcani/") || pathname === "/arcani-minori";
}
