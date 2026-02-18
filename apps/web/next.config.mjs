import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // CRITICAL: Allow the CLI to fetch JSON from /registry
    async headers() {
        return [
            {
                source: "/registry/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET" }
                ]
            }
        ]
    }
};

export default withMDX(nextConfig);
