import * as esbuild from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

export function build(entryPoints) {
  return esbuild.build({
    entryPoints,
    outdir: 'dist/server',
    sourcemap: true,
    platform: 'node',
    format: 'cjs',
    plugins: [esbuildPluginTsc(
      {
        tsconfigPath: 'server/tsconfig.json'
      }
    )],
    target: 'es2022',
    tsconfig: 'server/tsconfig.json'
  });

}
