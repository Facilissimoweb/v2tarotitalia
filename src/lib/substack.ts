export type SubstackPost = {
  id: string;
  title: string;
  date: string;
  link: string;
  snippet: string;
};

export type SubstackFeedPayload = {
  available: boolean;
  posts: SubstackPost[];
};

export const SUBSTACK_PROFILE = "https://substack.com/@tarotitalia";
export const SUBSTACK_HOME = "https://tarotitalia.substack.com";
export const SUBSTACK_FEED_DEFAULT = `${SUBSTACK_HOME}/feed`;

export const emptySubstackFeed = (): SubstackFeedPayload => ({
  available: false,
  posts: [],
});
