import bunyan from 'bunyan';
import bunyanDebugStream from 'bunyan-debug-stream';

const logger = bunyan.createLogger({
  name: 'sys',
  streams: [{
    level: 'debug',
    type: 'raw',
    serializers: bunyanDebugStream.serializers,
    stream: bunyanDebugStream({
      forceColor: true,
    }),
  }],
});

export default logger;
