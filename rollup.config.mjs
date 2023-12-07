import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/cli.ts",
  output: {
    dir: "bin",
    format: "commonjs",
  },
  plugins: [typescript({ module: "ESNext" })],
  external: ["fs", "path", "child_process"],
};
