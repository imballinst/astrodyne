const path = require('path');

module.exports = {
  base: path.join(process.cwd(), '../example-website/src'),
  injectedFrontmatter: {
    layout: '{base}/layouts/Layout.astro'
  }
};
