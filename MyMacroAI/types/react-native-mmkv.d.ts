declare module 'react-native-mmkv' {
  interface MMKVConfiguration {
    id: string;
    encryptionKey?: string;
  }

  class MMKV {
    constructor(config: MMKVConfiguration);
    
    set(key: string, value: string | number | boolean): void;
    getString(key: string): string | undefined;
    getNumber(key: string): number | undefined;
    getBoolean(key: string): boolean | undefined;
    contains(key: string): boolean;
    delete(key: string): void;
    clearAll(): void;
    getAllKeys(): string[];
    getSize(): number;
    getType(key: string): 'string' | 'number' | 'boolean' | 'undefined';
  }

  export default MMKV;
}