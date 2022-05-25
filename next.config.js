/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ["firebasestorage.googleapis.com"],
    },
    env: {
        API_KEY: process.env.API_KEY,
        API_SECRET: process.env.API_SECRET,
    },
};

module.exports = nextConfig;
