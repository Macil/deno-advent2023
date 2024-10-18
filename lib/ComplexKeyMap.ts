/**
 * Map wrapper that allows for keys of a different type than the underlying map.
 *
 * For example, you could use this class to create a map that allows coordinate
 * objects to be used as keys.
 */
export class ComplexKeyMap<K, V, KReal = string> implements Map<K, V> {
  readonly #keyToRealKey: (key: K) => KReal;
  readonly #map: Map<KReal, [K, V]>;

  constructor(
    keyToRealKey: (key: K) => KReal,
    entries?: readonly (readonly [K, V])[] | null,
  ) {
    this.#keyToRealKey = keyToRealKey;
    this.#map = new Map(
      entries?.map(([key, value]) => [keyToRealKey(key), [key, value]]),
    );
  }
  clear(): void {
    this.#map.clear();
  }
  delete(key: K): boolean {
    const realKey = this.#keyToRealKey(key);
    return this.#map.delete(realKey);
  }
  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: unknown,
  ): void {
    for (const [key, value] of this.entries()) {
      callbackfn.call(thisArg, value, key, this);
    }
  }
  get(key: K): V | undefined {
    const realKey = this.#keyToRealKey(key);
    const entry = this.#map.get(realKey);
    return entry?.[1];
  }
  has(key: K): boolean {
    const realKey = this.#keyToRealKey(key);
    return this.#map.has(realKey);
  }
  set(key: K, value: V): this {
    const realKey = this.#keyToRealKey(key);
    this.#map.set(realKey, [key, value]);
    return this;
  }
  get size(): number {
    return this.#map.size;
  }
  entries(): MapIterator<[K, V]> {
    return this.#map.values();
  }
  *keys(): MapIterator<K> {
    for (const [key] of this.#map.values()) {
      yield key;
    }
  }
  *values(): MapIterator<V> {
    for (const [_key, value] of this.#map.values()) {
      yield value;
    }
  }
  [Symbol.iterator](): MapIterator<[K, V]> {
    return this.entries();
  }
  get [Symbol.toStringTag](): string {
    return this.#map[Symbol.toStringTag];
  }
}
