'use strict';

const errors = require('../../helpers/errors');
const debug = require('debug')('oidc-provider:auth');

/*
 * Checks openid presence amongst the requested scopes
 *
 * @throws: invalid_request
 */
module.exports = function* checkOpenIdPresent(next) {
  debug('checkOpenIdPresent -> init');
  const scopes = this.oidc.params.scope.split(' ');

  this.assert(scopes.indexOf('openid') !== -1,
    new errors.InvalidRequestError('openid is required scope'));

  debug('checkOpenIdPresent -> done');

  yield next;
};
