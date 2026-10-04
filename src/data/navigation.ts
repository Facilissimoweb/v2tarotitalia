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

const tarocchi: NavBranch = {
  label: nav.tarocchi,
  children: [
    { to: "/arcani", label: nav.arcaniMaggiori },
    { to: "/arcani-minori", label: nav.arcaniMinori },
  ],
};

const home: NavLeaf = { to: "/", label: nav.home, end: true };
const chiSiamo: NavLeaf = { to: "/chi-siamo", label: nav.chiSiamo };
const consulti: NavLeaf = { to: "/consulti", label: nav.consulti };
const rituali: NavLeaf = { to: "/rituali", label: nav.rituali };
const blog: NavLeaf = { to: "/blog", label: nav.blog };
const contatti: NavLeaf = { to: "/contatti", label: nav.contatti };

export const NAV_LEADING: NavItem[] = [home, chiSiamo, consulti, tarocchi];
export const NAV_TRAILING: NavItem[] = [rituali, blog, contatti];

export const MAIN_NAV: NavItem[] = [home, chiSiamo, consulti, rituali, blog, contatti, tarocchi];

export function isNavBranch(item: NavItem): item is NavBranch {
  return "children" in item;
}

export function flattenNav(items: NavItem[]): NavLeaf[] {
  return items.flatMap((item) => (isNavBranch(item) ? item.children : [item]));
}

export function isTarocchiPath(pathname: string) {
  return pathname === "/arcani" || pathname.startsWith("/arcani/") || pathname === "/arcani-minori";
}
