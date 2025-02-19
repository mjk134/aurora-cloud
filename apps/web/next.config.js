/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@repo/ui"],
  redirects:  async () => {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: true
      }
    ]
  }
};
