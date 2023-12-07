import {
  readdirSync,
  lstatSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from "fs";
import { join, dirname } from "path";
import { type TSConfig } from "@json-types/tsconfig";

/**
 * Sets up the arguments for vue-tsc.
 *
 * @returns An object containing the files, project value, and remaining arguments to forward.
 */
export function setupArgs() {
  const args = process.argv.slice(2);

  const argsProjectIndex = args.findIndex((arg) =>
    ["-p", "--project"].includes(arg)
  );

  const projectValue =
    argsProjectIndex !== -1
      ? args[argsProjectIndex + 1]
      : undefined;

  const files = getFiles(args);

  const remainingArgsToForward = args
    .slice()
    .filter((arg) => !files.includes(arg));

  if (argsProjectIndex !== -1) {
    remainingArgsToForward.splice(argsProjectIndex, 2);
  }

  return {
    files,
    projectValue,
    remainingArgsToForward,
  };
}
/**
 * Generates a random string of characters.
 *
 * @returns {string} The random string of characters.
 */
export function randomChars() {
  return Math.random().toString(36).slice(2);
}

/**
 * Retrieves an array of .d.ts files recursively from the specified directory.
 *
 * @param dir - The directory to search for .d.ts files.
 * @returns An array of .d.ts file paths.
 */
export function getDtsFiles(dir: string): string[] {
  const files = readdirSync(dir);
  return files.reduce<string[]>(
    (acc: string[], file: string) => {
      const path = `${dir}/${file}`;
      const isDirectory = lstatSync(path).isDirectory();
      if (isDirectory && file !== "node_modules") {
        return [...acc, ...getDtsFiles(path)];
      }
      if (path.endsWith(".d.ts")) {
        return [...acc, path];
      }
      return acc;
    },
    []
  );
}

/**
 * Filters the given array of arguments and returns an array of files with specific extensions.
 * @param args - The array of arguments to filter.
 * @returns An array of files with extensions ".vue", ".ts", or ".tsx".
 */
export function getTscFiles(args: string[]) {
  return args.filter(
    (arg) =>
      arg.endsWith(".vue") ||
      arg.endsWith(".ts") ||
      arg.endsWith(".tsx")
  );
}

/**
 * Retrieves a list of files to be processed based on the provided arguments.
 *
 * @param args - The arguments passed to the program.
 * @returns An array of file paths to be processed.
 */
export function getFiles(args: string[]): string[] {
  const tscFiles = getTscFiles(args);

  if (tscFiles.length == 0) {
    process.exit(0);
  }

  const dtsFiles = getDtsFiles(process.cwd());

  return [...tscFiles, ...dtsFiles];
}

/**
 * Resolves a file path relative to the root directory.
 * @param paths - The paths to resolve.
 * @returns The resolved file path.
 */
export function resolveFromRoot(...paths: string[]) {
  return join(process.cwd(), ...paths);
}

/**
 * Resolves a file path relative to a module.
 * @param moduleName - The name of the module.
 * @param paths - Additional paths to be joined with the module path.
 * @returns The resolved file path.
 */
export function resolveFromModule(
  moduleName: string,
  ...paths: string[]
) {
  const modulePath = dirname(
    require.resolve(`${moduleName}/package.json`)
  );
  return join(modulePath, ...paths);
}

/**
 * Retrieves the root tsconfig.json file.
 *
 * @param argsProjectValue - Optional path to a specific tsconfig.json file.
 * @returns The parsed TSConfig object.
 */
function getRootTsConfig(
  argsProjectValue?: string
): TSConfig {
  const tsconfigPath =
    argsProjectValue || resolveFromRoot("tsconfig.json");
  const tsconfigContent =
    readFileSync(tsconfigPath).toString();

  return eval(`(${tsconfigContent})`);
}

/**
 * Creates a temporary TypeScript configuration file.
 * @param rootTsConfig The root TypeScript configuration.
 * @param files The list of files to include in the temporary configuration.
 * @returns The path of the created temporary TypeScript configuration file.
 */
function createTmpTsConfig(
  rootTsConfig: TSConfig,
  files: string[]
) {
  const tmpTsconfigPath = resolveFromRoot(
    `tsconfig.${randomChars()}.json`
  );
  const tmpTsconfig = {
    ...rootTsConfig,
    compilerOptions: {
      ...rootTsConfig.compilerOptions,
      skipLibCheck: true,
    },
    files,
    include: [],
  };
  writeFileSync(
    tmpTsconfigPath,
    JSON.stringify(tmpTsconfig, null, 2)
  );

  registerCleanupHandler(tmpTsconfigPath);

  return tmpTsconfigPath;
}

/**
 * Registers a cleanup handler to remove a temporary tsconfig file.
 * @param tmpTsconfigPath - The path of the temporary tsconfig file.
 */
function registerCleanupHandler(tmpTsconfigPath: string) {
  let didCleanup = false;
  for (const eventName of [
    "exit",
    "SIGHUP",
    "SIGINT",
    "SIGTERM",
  ]) {
    process.on(eventName, (exitCode) => {
      if (didCleanup) return;
      didCleanup = true;

      unlinkSync(tmpTsconfigPath);

      if (eventName !== "exit") {
        process.exit(exitCode);
      }
    });
  }
}
/**
 * Creates a temporary TypeScript configuration file and returns its path.
 *
 * @param files - An array of file paths to include in the tsconfig file.
 * @param argsProjectValue - Optional. The value of the --project argument.
 * @returns The path of the temporary tsconfig file.
 */
export function createAndSetupTsConfig(
  files: string[],
  argsProjectValue?: string
) {
  const rootTsConfig = getRootTsConfig(argsProjectValue);
  const tmpTsconfigPath = createTmpTsConfig(
    rootTsConfig,
    files
  );

  return tmpTsconfigPath;
}
