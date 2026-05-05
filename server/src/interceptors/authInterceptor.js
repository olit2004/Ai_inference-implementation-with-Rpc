
const grpc = require('@grpc/grpc-js');

const AUTH_KEY = 'my-secret-key';

/**
 * A simple bouncer interceptor.
 * In @grpc/grpc-js, server interceptors are implemented as a wrapper 
 * around the service definition.
 */


module.exports = (serviceDefinition) => {
  const interceptedService = {};

  Object.keys(serviceDefinition).forEach((methodName) => {
    const originalHandler = serviceDefinition[methodName];

    interceptedService[methodName] = (call, callback) => {
      const metadata = call.metadata.getMap();
      const authHeader = metadata['authorization'];

      if (!authHeader || authHeader !== `Bearer ${AUTH_KEY}`) {
        console.warn(`Unauthorized access attempt to ${methodName}`);

        const error = {
          code: grpc.status.UNAUTHENTICATED,
          details: 'Missing or invalid API Key (Authorization: Bearer my-secret-key)',
        };


        if (callback) {

          callback(error);
        } else {

          call.emit('error', error);
          call.end();
        }
        return;
      }


      return originalHandler(call, callback);
    };
  });

  return interceptedService;
};
