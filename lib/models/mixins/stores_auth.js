module.exports = superclass => class extends superclass {
  static get IN_PAYLOAD() {
    return [
      ...super.IN_PAYLOAD,
      'accountId',
      'acr',
      'amr',
      'aud',
      'authTime',
      'claims',
      'grantId',
      'nonce',
      'scope',
      'sid',
    ];
  }
};
