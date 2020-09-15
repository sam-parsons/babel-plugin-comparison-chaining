module.exports = {
  'env': {
      'production': {
          'presets': [
            '@babel/env'
          ],
          'comments': false
      },
      'test': {
          'presets': [
              [
                  '@babel/env',
                  {'targets': {'node': 'current'}}
              ]
          ]
      }
  }
}