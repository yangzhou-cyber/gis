module.exports = {
    lintOnSave:false,
    devServer: {
      proxy: {
        '/api': {
          target: 'http://121.4.38.11:8080/geoserver/demo/ows',
          ws: true,
          changeOrigin: true,
          pathRewrite: {
            '^/api': ''
          }
        },
        '/name': {
          target: 'http://192.168.1.82:8888/geoserver/demo/ows',
          ws: true,
          changeOrigin: true,
          pathRewrite: {
            '^/name': ''
          }
        },
      }
  
    }
  }