'use strict';

const _ = require('lodash');
const errors = require('../../helpers/errors');
const debug = require('debug')('oidc-provider:auth');

/*
 * Validates presence of mandatory OAuth2.0 parameters response_type, client_id and scope.
 *
 * @throws: invalid_request
 */
module.exports = function* oauthRequired(next) {
  debug('oauthRequired -> init');
  // Validate: required oauth params
  const params = this.oidc.params;
  const missing = _.difference([
    'response_type',
    'client_id',
    'scope',
  ], _.keys(_.omitBy(params, _.isUndefined)));

  this.assert(_.isEmpty(missing), new errors.InvalidRequestError(
    `missing required parameter(s) ${missing.join(',')}`));
  debug('oauthRequired -> done');

  yield next;
};
