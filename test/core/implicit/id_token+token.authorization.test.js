const bootstrap = require('../../test_helper');
const url = require('url');
const sinon = require('sinon');
const base64url = require('base64url');
const { expect } = require('chai');

const route = '/auth';
const response_type = 'id_token token';
const scope = 'openid';

describe('IMPLICIT id_token+token', () => {
  before(bootstrap(__dirname)); // provider, agent, AuthorizationRequest, wrap

  ['get', 'post'].forEach((verb) => {
    describe(`${verb} ${route} with session`, () => {
      before(function () { return this.login(); });

      it('responds with a id_token in fragment', function () {
        const auth = new this.AuthorizationRequest({
          response_type,
          scope,
        });

        return this.wrap({ route, verb, auth })
          .expect(302)
          .expect(auth.validateFragment)
          .expect(auth.validatePresence(['id_token', 'state', 'access_token', 'expires_in', 'token_type']))
          .expect(auth.validateState)
          .expect(auth.validateClientLocation);
      });

      it('populates ctx.oidc.entities', function (done) {
        this.provider.use(this.assertOnce((ctx) => {
          expect(ctx.oidc.entities).to.have.keys('Client', 'Account', 'AccessToken');
        }, done));

        const auth = new this.AuthorizationRequest({
          response_type,
          scope,
        });

        this.wrap({ route, verb, auth }).end(() => {});
      });

      it('ignores offline_access scope for non code-including response_types', function () {
        const auth = new this.AuthorizationRequest({
          response_type,
          scope: 'openid offline_access',
        });

        return this.wrap({ route, verb, auth })
          .expect(302)
          .expect(auth.validateFragment)
          .expect(auth.validatePresence(['id_token', 'state', 'access_token', 'expires_in', 'token_type']))
          .expect(auth.validateState)
          .expect(auth.validateClientLocation)
          .then((response) => {
            const { query: { access_token } } = url.parse(response.headers.location, true);
            const jti = access_token.substring(0, 48);
            const stored = this.TestAdapter.for('AccessToken').syncFind(jti);
            const payload = JSON.parse(base64url.decode(stored.payload));

            expect(payload).to.have.property('scope', 'openid');
          });
      });
    });

    describe(`${verb} ${route} errors`, () => {
      it('disallowed response mode', function () {
        const spy = sinon.spy();
        this.provider.once('authorization.error', spy);
        const auth = new this.AuthorizationRequest({
          response_type,
          scope,
          response_mode: 'query',
        });

        return this.wrap({ route, verb, auth })
          .expect(302)
          .expect(() => {
            expect(spy.calledOnce).to.be.true;
          })
          .expect(auth.validatePresence(['error', 'error_description', 'state']))
          .expect(auth.validateState)
          .expect(auth.validateClientLocation)
          .expect(auth.validateError('invalid_request'))
          .expect(auth.validateErrorDescription('response_mode not allowed for this response_type'));
      });

      it('missing mandatory parameter nonce', function () {
        const spy = sinon.spy();
        this.provider.once('authorization.error', spy);
        const auth = new this.AuthorizationRequest({
          response_type,
          scope,
        });
        delete auth.nonce;

        return this.agent.get(route)
          .query(auth)
          .expect(302)
          .expect(() => {
            expect(spy.calledOnce).to.be.true;
          })
          .expect(auth.validateFragment)
          .expect(auth.validatePresence(['error', 'error_description', 'state']))
          .expect(auth.validateState)
          .expect(auth.validateClientLocation)
          .expect(auth.validateError('invalid_request'))
          .expect(auth.validateErrorDescription('missing required parameter(s) nonce'));
      });
    });
  });
});
