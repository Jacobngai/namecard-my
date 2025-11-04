/**
 * UUID Generation Test
 *
 * Verifies that UUID generation is working correctly and
 * generates unique IDs without collisions
 */

import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

describe('UUID Generation', () => {
  it('should generate valid UUID v4 format', () => {
    const id = uuidv4();

    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(id).toMatch(uuidRegex);
  });

  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    const count = 1000;

    // Generate 1000 UUIDs
    for (let i = 0; i < count; i++) {
      ids.add(uuidv4());
    }

    // All should be unique (no collisions)
    expect(ids.size).toBe(count);
  });

  it('should work with local_ prefix for contacts', () => {
    const localId = `local_${uuidv4()}`;

    expect(localId).toMatch(/^local_[0-9a-f-]{36}$/);
    expect(localId).toContain('local_');
  });

  it('should generate different IDs each time', () => {
    const id1 = uuidv4();
    const id2 = uuidv4();
    const id3 = uuidv4();

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('should handle rapid generation without collisions', () => {
    const ids: string[] = [];

    // Generate 100 IDs as fast as possible
    for (let i = 0; i < 100; i++) {
      ids.push(uuidv4());
    }

    // Check for duplicates
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
