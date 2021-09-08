const path = require('path');

module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['kjtrccxoysjwycxmpwvm.supabase.co', 'kjtrccxoysjwycxmpwvm.supabase.in'],
  },
  module: {
    loaders: [
      { test: /\.xml$/, loader: 'xml-loader' } // will load all .xml files with xml-loader by default
    ]
  },
}
