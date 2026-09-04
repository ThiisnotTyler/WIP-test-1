export const NSFW_KEYWORDS = [
  'sex', 'sexy', 'boobs', 'hot', 'porn', 'nude', 'naked', 'nsfw', 'erotic', 'adult', 'xxx', 'milf', 'slut'
];

export const isSafeContent = (item: any) => {
  const title = (item.title || '').toLowerCase();
  const desc = (item.desc || '').toLowerCase();
  
  const text = `${title} ${desc}`;
  
  const regex = new RegExp(`\\b(${NSFW_KEYWORDS.join('|')})\\b`, 'i');
  
  return !regex.test(text);
};

export const filterSafeContent = (items: any[]) => {
  return items.filter(isSafeContent);
};

export const CURATED_BAD_KEYWORDS = [
  'review', 'vlog', 'reaction', 'gameplay', 'unboxing', 'tutorial', 
  'how to', "let's play", 'speedrun', 'test', 'promo', 'trailer', 'playthrough'
];

export const isCuratedContent = (item: any) => {
  if (!item.isVideo) return true; // Keep audio untouched
  
  const title = (item.title || '').toLowerCase();
  
  // Keyword filter on title only (descriptions can trigger false positives on movies)
  const regex = new RegExp(`\\b(${CURATED_BAD_KEYWORDS.join('|')})\\b`, 'i');
  if (regex.test(title)) return false;
  
  // If we know duration from API, filter out < 10 mins (600s)
  if (item.duration && item.duration < 600) return false;
  
  return true;
};

export const filterCuratedContent = (items: any[]) => {
  return items.filter(isCuratedContent);
};
export const isAgeAppropriate = (item: any) => {
  return item.ageRestricted !== true;
};
export const filterAgeRestricted = (items: any[]) => {
  return items.filter(isAgeAppropriate);
};
