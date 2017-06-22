const {parseArgsAndRunMain} = require('big-dig/src/server/cli');

const absolutePathToServerMain = require.resolve('./server.js');
parseArgsAndRunMain(absolutePathToServerMain);
