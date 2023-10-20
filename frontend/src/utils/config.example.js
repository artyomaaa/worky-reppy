module.exports = {
  siteName: 'Worky-Reppy',
  copyright: 'Esterox  ©' + new Date().getFullYear(),
  logoPath: '/logo.svg',
  apiPrefix: process.env.NODE_ENV === 'development' ? 'http://worky-reppy.site/api' : '/api',
  appUrl: 'http://worky-reppy.site/',
  fixedHeader: true, // sticky primary layout header
  appVersion: 'v1.0.0', // The latest tag of https://gitlab.com/esterox/worky-reppy/-/tags

  /* Layout configuration, specify which layout to use for route. */
  layouts: [
    {
      name: 'primary',
      include: [/.*/],
      exclude: [
        /(\/(en|hy))*\/$/,
        /(\/(en|hy))*\/login$/,
        /(\/(en|hy))*\/demo$/,
        /(\/(en|hy))*\/signup$/,
        /(\/(en|hy))*\/error$/,
        /(\/(en|hy))*\/password\/forgot$/,
        /(\/(en|hy))*\/password\/reset$/,
        /(\/(en|hy))*\/privacypolicy$/,
      ],
    },
  ],

  /* I18n configuration, `languages` and `defaultLanguage` are required currently. */
  i18n: {
    /* Countrys flags: https://www.flaticon.com/packs/countrys-flags */
    languages: [
      {
        key: 'en',
        title: 'English',
        flag: '/america.svg',
      },
      {
        key: 'hy',
        title: 'Հայերեն',
        flag: '/armenia.svg',
      },
    ],
    defaultLanguage: 'en',
  },
};
