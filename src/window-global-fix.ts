import * as process from 'process';

(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
};

window['process'] = process;
