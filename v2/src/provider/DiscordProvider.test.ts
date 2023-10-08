import {describe, expect, test} from '@jest/globals';
import DiscordProvider from './DiscordProvider';

describe('DiscordProvider', () => {
    test('create DiscordProvider', () => {
        const sut = new DiscordProvider();

      expect(sut).not.toBe(null);
    });
});