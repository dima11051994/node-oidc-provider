'use strict';

const debug = require('debug')('oidc-provider:auth');

/*
 * Loads the End-User's account referenced by the session.
 */
module.exports = provider => function* loadAccount(next) {
  debug('loadAccount -> init');
  const accountId = this.oidc.session.accountId();

  if (accountId) {
    const Account = provider.Account;
    this.oidc.account = yield Account.findById.call(this, accountId);
  }
  debug('loadAccount -> done');

  yield next;
};
