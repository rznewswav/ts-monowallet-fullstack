import { glob } from "glob";
import { build } from "./base.esbuild.mjs";

const requestedEntryPoints = process.argv.slice(2);
const entryPointsCandidates = requestedEntryPoints.length
  ? requestedEntryPoints
  : await glob("server/**/*.ts");

const entryPoints = entryPointsCandidates.filter(e => !e.endsWith("test.ts"));

await build(entryPoints);
