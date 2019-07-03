import * as redis from 'redis';
import * as bluebird from 'bluebird';
import errors from './models/errors';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient(process.env.REDIS_URI);

// client.on('error', errors.report); // eslint-disable-line no-console
// tslint:disable-next-line: ter-prefer-arrow-callback
redisClient.on('error', function (err) {
  // tslint:disable-next-line: prefer-template
  console.log('Redis error: ' + err);
});

export default redisClient;
