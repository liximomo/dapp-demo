export type Config = Record<string, any>;

let _config: Config | null;

function getByPaths(obj: any, path: string): any {
  const segments = path.split(".");
  if (segments.length <= 0) {
    return obj;
  }

  let cur = obj[segments[0]];
  for (let i = 1; i < segments.length && cur; i++) {
    cur = cur[segments[i]];
  }

  return cur;
}

export function setConfig(config: Config) {
  _config = config;
}

export function getConfig<T = any>(): T;
export function getConfig<T = any>(
  path: string,
  config?: Record<string, any>
): T;
export function getConfig<T = any>(
  path?: string,
  config?: Record<string, any>
): T {
  if (!_config) {
    throw new Error('Please call "setConfig" first');
  }

  if (!path) {
    return _config as T;
  }

  const value = getByPaths(config || _config, path);
  if (value === undefined) {
    throw new Error(`Config not Found. (${path})`);
  }

  return value;
}
