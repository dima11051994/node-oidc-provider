'use strict';

const debug = require('debug')('oidc-provider:auth');

/*
 * assign max_age and acr_values if it is not provided explictly but is configured with default
 * values on the client
 */
module.exports = function* assignDefaults(next) {
  debug('assignDefaults -> init');
  const params = this.oidc.params;
  const client = this.oidc.client;

  if (!params.acr_values && client.defaultAcrValues) {
    params.acr_values = client.defaultAcrValues.join(' ');
  }

  if (!params.max_age && client.defaultMaxAge) {
    params.max_age = client.defaultMaxAge;
  }

  debug('assignDefaults -> done');

  yield next;
};
