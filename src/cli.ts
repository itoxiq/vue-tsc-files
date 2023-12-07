#! /usr/bin/env node
import { spawnSync } from "child_process";
import {
  setupArgs,
  resolveFromModule,
  createAndSetupTsConfig,
} from "./util";

const { files, remainingArgsToForward, projectValue } =
  setupArgs();

const tmpTsconfigPath = createAndSetupTsConfig(
  files,
  projectValue
);

const { status } = spawnSync(
  resolveFromModule(
    "typescript",
    `../.bin/vue-tsc${
      process.platform === "win32" ? ".cmd" : ""
    }`
  ),
  [
    "-p",
    tmpTsconfigPath,
    ...remainingArgsToForward,
    "--noEmit",
  ],
  { stdio: "inherit" }
);

process.exit(status ?? 0);
