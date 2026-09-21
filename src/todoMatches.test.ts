import assert from 'node:assert/strict';
import { findTodoMatches, TODO_LITERAL } from './todoMatches';

function ranges(text: string): Array<[number, number]> {
  return findTodoMatches(text).map((match) => [match.start, match.end]);
}

assert.deepEqual(ranges(''), []);
assert.deepEqual(ranges('no markers here'), []);
assert.deepEqual(ranges('todo: lowercase'), []);
assert.deepEqual(ranges('Todo: mixed'), []);
assert.deepEqual(ranges('TODO missing colon'), []);
assert.deepEqual(ranges('TODO : space before colon'), []);

assert.deepEqual(ranges('TODO: one'), [[0, TODO_LITERAL.length]]);
assert.deepEqual(ranges('prefix TODO: suffix'), [[7, 12]]);
assert.deepEqual(ranges('TODO: TODO:'), [
  [0, 5],
  [6, 11],
]);
// Substring match: the token may sit inside a larger word.
assert.deepEqual(ranges('XTODO:y'), [[1, 6]]);

console.log('todoMatches tests passed');
