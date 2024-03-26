const path = require('path');

module.exports = path.dirname(require.main.filename);
//require.main.filename gives us the absolute path to the main module that started the application.
//That's the app.js file in this case.