// Counts characters the way platforms do: user-perceived characters (emoji count as one).
export function countChars(text) {
  return Array.from(text || '').length;
}

export function countHashtags(text) {
  const matches = (text || '').match(/#[\p{L}\p{N}_]+/gu);
  return matches ? matches.length : 0;
}

// Returns a list of human-readable warnings for one title/caption.
export function checkText(text, limits) {
  const warnings = [];
  const length = countChars(text);
  if (length > limits.titleMax) {
    warnings.push({ kind: 'length', length, max: limits.titleMax });
  }
  const tags = countHashtags(text);
  if (tags > limits.hashtagMax) {
    warnings.push({ kind: 'hashtagsOver', count: tags, max: limits.hashtagMax });
  } else if (tags > 0 && limits.hashtagRecommended[1] > 0 && tags > limits.hashtagRecommended[1]) {
    warnings.push({ kind: 'hashtagsHigh', count: tags, max: limits.hashtagRecommended[1] });
  }
  return { length, tags, warnings };
}
