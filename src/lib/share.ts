import { canonicalUrl, seoForPath } from "./seo";

export type PageShare = {
  url: string;
  title: string;
  description: string;
  image: string;
  whatsapp: string;
  x: string;
  facebook: string;
  linkedin: string;
  pinterest: string;
};

export function pageShare(pathname: string): PageShare {
  const page = seoForPath(pathname);
  const url = canonicalUrl(page.path);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(page.title);
  const encodedImage = encodeURIComponent(page.image);
  const whatsappText = encodeURIComponent(`${page.title} ${url}`);

  return {
    url,
    title: page.title,
    description: page.description,
    image: page.image,
    whatsapp: `https://wa.me/?text=${whatsappText}`,
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
  };
}
