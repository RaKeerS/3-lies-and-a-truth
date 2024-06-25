import { mergeMap, of } from 'rxjs';

export const pipeIf =
  (predicate: (arg0: unknown) => any, ...pipes: any[]) => (source: any) => source.pipe(
    mergeMap(value => predicate(value) ? of(value).pipe(pipes.reduce(x => x)) : of(value))
  );
