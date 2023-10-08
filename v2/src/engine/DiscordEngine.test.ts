import { describe, expect, test } from '@jest/globals';
import DiscordEngine, { Command } from './DiscordEngine';

describe('DiscordEngine', () => {
  test('create DiscordEngine', () => {
    const commandHandler: Command = {}

    const sut = new DiscordEngine("!", commandHandler);

    expect(sut).not.toBe(null);
  });
});
