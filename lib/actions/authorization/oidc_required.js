'use strict';

const _ = require('lodash');
const errors = require('../../helpers/errors');
const debug = require('debug')('oidc-provider:auth');

/*
 * Validates presence of mandatory OpenID Connect parameters redirect_uri and conditionally nonce if
 * id_token issued directly by the authorization response.
 *
 * @throws: invalid_request
 */
module.exports = function* oidcRequired(next) {
  debug('oidcRequired -> init');
  // Validate: required params
  const params = this.oidc.params;
  const missing = [];

  if (params.redirect_uri === undefined) missing.push('redirect_uri');

  // Second check for nonce if id_token is involved
  if (params.response_type && !params.nonce && params.response_type.includes('token')) {
    missing.push('nonce');
  }

  this.assert(_.isEmpty(missing), new errors.InvalidRequestError(
    `missing required parameter(s) ${missing.join(',')}`));

  debug('oidcRequired -> done');

  yield next;
};
