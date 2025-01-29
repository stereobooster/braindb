import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [
      ...config.externals,
      /^(@napi-rs\/simple-git)$/i,
      /^(@node-rs\/xxhash)$/i,
      /^(fsevents)$/i,
      {
        "better-sqlite3": "commonjs better-sqlite3",
      },
    ];
    return config;
  },
};

export default withMDX(config);
