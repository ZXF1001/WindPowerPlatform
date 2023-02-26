const baseURLs = {
  production: "localhost", // 线上 (生产环境)
  development: "192.168.159.131", // 本地 (开发环境)
};
const baseHttpURLs = {
  production: `http://${baseURLs.production}`, // 线上 (生产环境)
  development: `http://${baseURLs.development}`, // 本地 (开发环境)
};
const baseWSURLs = {
  production: `ws://${baseURLs.production}/ws`, // 线上 (生产环境)
  development: `ws://${baseURLs.development}/ws`, // 本地 (开发环境)
};

export const rootURL =
  process.env.NODE_ENV === "production"
    ? baseHttpURLs.production
    : baseHttpURLs.development;
export const rootWSURL =
  process.env.NODE_ENV === "production"
    ? baseWSURLs.production
    : baseWSURLs.development;
