/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "images.unsplash.com",
      "res.cloudinary.com",
      "images.pexels.com",
      "avatars.githubusercontent.com",
    ],
  },
};

module.exports = nextConfig;
