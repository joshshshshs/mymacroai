import {
  setupURLPolyfill,
  URL as PolyfillURL,
  URLSearchParams as PolyfillURLSearchParams,
} from 'react-native-url-polyfill';

setupURLPolyfill();

const tryOverrideGlobals = (): boolean => {
  try {
    Object.defineProperty(globalThis, 'URL', {
      value: PolyfillURL,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'URLSearchParams', {
      value: PolyfillURLSearchParams,
      writable: true,
      configurable: true,
    });
    return true;
  } catch {
    try {
      globalThis.URL = PolyfillURL;
      globalThis.URLSearchParams = PolyfillURLSearchParams;
      return true;
    } catch {
      return false;
    }
  }
};

const patchUrlPrototype = (): void => {
  const currentUrl = globalThis.URL;
  if (!currentUrl?.prototype) {
    return;
  }

  const proto = currentUrl.prototype;
  const hrefDescriptor = Object.getOwnPropertyDescriptor(proto, 'href');
  const usernameDescriptor = Object.getOwnPropertyDescriptor(proto, 'username');
  const passwordDescriptor = Object.getOwnPropertyDescriptor(proto, 'password');

  const getHref = (target: URL) => {
    if (hrefDescriptor?.get) {
      return hrefDescriptor.get.call(target) as string;
    }
    return String(target);
  };

  const setHref = (target: URL, nextHref: string) => {
    if (hrefDescriptor?.set) {
      hrefDescriptor.set.call(target, nextHref);
      return;
    }
    try {
      target.href = nextHref;
    } catch {
      // no-op
    }
  };

  const buildSetter = (field: 'username' | 'password') => {
    return function setter(value: string) {
      try {
        const url = new PolyfillURL(getHref(this as URL));
        if (field === 'username') {
          url.username = value ?? '';
        } else {
          url.password = value ?? '';
        }
        setHref(this as URL, url.href);
      } catch {
        // ignore to avoid crashing during polyfill patching
      }
    };
  };

  if (!usernameDescriptor?.set && usernameDescriptor?.configurable !== false) {
    Object.defineProperty(proto, 'username', {
      configurable: true,
      enumerable: true,
      get: usernameDescriptor?.get,
      set: buildSetter('username'),
    });
  }

  if (!passwordDescriptor?.set && passwordDescriptor?.configurable !== false) {
    Object.defineProperty(proto, 'password', {
      configurable: true,
      enumerable: true,
      get: passwordDescriptor?.get,
      set: buildSetter('password'),
    });
  }
};

const ensureWritableUrl = (): void => {
  const currentUrl = globalThis.URL;
  if (!currentUrl?.prototype) {
    return;
  }

  const descriptor = Object.getOwnPropertyDescriptor(
    currentUrl.prototype,
    'username'
  );

  if (descriptor?.set) {
    return;
  }

  if (!tryOverrideGlobals()) {
    patchUrlPrototype();
  }
};

ensureWritableUrl();
