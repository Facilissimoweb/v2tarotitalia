import { siteContent } from "./siteContent";

const { nav } = siteContent;

export type NavLeaf = {
  to: string;
  label: string;
  end?: boolean;
  icon?: "shop";
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
const chiSono: NavLeaf = { to: "/chi-sono", label: nav.chiSiamo };
const consulti: NavLeaf = { to: "/consulti", label: nav.consulti };
const percorsi: NavLeaf = { to: "/percorsi", label: nav.percorsi };
const shop: NavLeaf = { to: "/shop", label: nav.shop, icon: "shop" };
const blog: NavLeaf = { to: "/blog", label: nav.blog };
const contatti: NavLeaf = { to: "/contatti", label: nav.contatti };

export const NAV_LEADING: NavItem[] = [home, chiSono, consulti, tarocchi];
export const NAV_TRAILING: NavItem[] = [percorsi, shop, blog, contatti];

export const MAIN_NAV: NavItem[] = [home, chiSono, consulti, percorsi, shop, blog, contatti, tarocchi];

export function isNavBranch(item: NavItem): item is NavBranch {
  return "children" in item;
}

export function flattenNav(items: NavItem[]): NavLeaf[] {
  return items.flatMap((item) => (isNavBranch(item) ? item.children : [item]));
}

export function isTarocchiPath(pathname: string) {
  return pathname === "/arcani" || pathname.startsWith("/arcani/") || pathname.startsWith("/arcani-minori");
}
