'use strict';

const instance = require('../../helpers/weak_cache');
const debug = require('debug')('oidc-provider:auth');

/*
 * Validates requested response_type is supported by the provided and whitelisted in the client
 * configuration
 *
 * @throws: unsupported_response_type
 * @throws: restricted_response_type
 */
module.exports = provider => function* checkResponseType(next) {
  debug('checkResponseType -> init');

  const params = this.oidc.params;
  const supported = instance(provider).configuration('responseTypes');

  const valid = supported.indexOf(params.response_type) !== -1;
  this.assert(valid, 400, 'unsupported_response_type', {
    error_description: `response_type not supported. (${params.response_type})`,
  });

  this.assert(this.oidc.client.responseTypeAllowed(params.response_type),
    400, 'restricted_response_type', {
      error_description: 'response_type not allowed for this client',
    });

  debug('checkResponseType -> done');

  yield next;
};
