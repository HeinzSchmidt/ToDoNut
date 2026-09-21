/**
 * Case-sensitive substring matcher for the literal text `TODO:`.
 *
 * Matching is intentionally *not* a comment parser or regex with the `i` flag:
 * `TODO:` matches, while `todo:`, `Todo:`, and `TODO` (no colon) do not.
 */

/** Literal token highlighted in the editor. */
export const TODO_LITERAL = 'TODO:';

export interface TodoMatch {
  /** Inclusive UTF-16 offset of the match start. */
  start: number;
  /** Exclusive UTF-16 offset of the match end. */
  end: number;
}

/**
 * Find every non-overlapping occurrence of `TODO:` in `text`.
 * Overlapping is not possible for this token; search resumes after each hit.
 */
export function findTodoMatches(text: string): TodoMatch[] {
  const matches: TodoMatch[] = [];
  const tokenLength = TODO_LITERAL.length;
  let from = 0;

  while (from < text.length) {
    const index = text.indexOf(TODO_LITERAL, from);
    if (index === -1) {
      break;
    }
    matches.push({ start: index, end: index + tokenLength });
    from = index + tokenLength;
  }

  return matches;
}
