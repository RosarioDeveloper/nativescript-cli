'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MobileIdentityConnect = exports.AuthorizationGrant = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _social = require('./social');

var _enums = require('./enums');

var _request = require('../../request');

var _errors = require('../../errors');

var _es6Promise = require('es6-promise');

var _regeneratorRuntime = require('regenerator-runtime');

var _regeneratorRuntime2 = _interopRequireDefault(_regeneratorRuntime);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _es6Promise.Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _es6Promise.Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // eslint-disable-line no-unused-vars


var authPathname = process.env.KINVEY_MIC_AUTH_PATHNAME || '/oauth/auth';
var tokenPathname = process.env.KINVEY_MIC_TOKEN_PATHNAME || '/oauth/token';
var invalidatePathname = process.env.KINVEY_MIC_INVALIDATE_PATHNAME || '/oauth/invalidate';

/**
 * Enum for Mobile Identity Connect authorization grants.
 * @property  {string}    AuthorizationCodeLoginPage   AuthorizationCodeLoginPage grant
 * @property  {string}    AuthorizationCodeAPI         AuthorizationCodeAPI grant
 */
var AuthorizationGrant = {
  AuthorizationCodeLoginPage: 'AuthorizationCodeLoginPage',
  AuthorizationCodeAPI: 'AuthorizationCodeAPI'
};
Object.freeze(AuthorizationGrant);
exports.AuthorizationGrant = AuthorizationGrant;

/**
 * @private
 */

var MobileIdentityConnect = exports.MobileIdentityConnect = function (_Social) {
  _inherits(MobileIdentityConnect, _Social);

  function MobileIdentityConnect() {
    _classCallCheck(this, MobileIdentityConnect);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(MobileIdentityConnect).apply(this, arguments));
  }

  _createClass(MobileIdentityConnect, [{
    key: 'login',
    value: function login(redirectUri) {
      var _this2 = this;

      var authorizationGrant = arguments.length <= 1 || arguments[1] === undefined ? AuthorizationGrant.AuthorizationCodeLoginPage : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var clientId = this.client.appKey;

      var promise = _es6Promise.Promise.resolve().then(function () {
        if (authorizationGrant === AuthorizationGrant.AuthorizationCodeLoginPage) {
          // Step 1: Request a code
          return _this2.requestCodeWithPopup(clientId, redirectUri, options);
        } else if (authorizationGrant === AuthorizationGrant.AuthorizationCodeAPI) {
          // Step 1a: Request a temp login url
          return _this2.requestTempLoginUrl(clientId, redirectUri, options).then(function (url) {
            return _this2.requestCodeWithUrl(url, clientId, redirectUri, options);
          }); // Step 1b: Request a code
        }

        throw new _errors.KinveyError('The authorization grant ' + authorizationGrant + ' is unsupported. ' + 'Please use a supported authorization grant.');
      }).then(function (code) {
        return _this2.requestToken(code, clientId, redirectUri, options);
      }) // Step 3: Request a token
      .then(function (session) {
        session.client_id = clientId;
        session.redirect_uri = redirectUri;
        session.protocol = _this2.client.micProtocol;
        session.host = _this2.client.micHost;
        return session;
      });

      return promise;
    }
  }, {
    key: 'requestTempLoginUrl',
    value: function requestTempLoginUrl(clientId, redirectUri) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var pathname = '/';

      if (options.version) {
        var version = options.version;

        if (!(0, _isString2.default)(version)) {
          version = String(version);
        }

        pathname = _path2.default.join(pathname, version.indexOf('v') === 0 ? version : 'v' + version);
      }

      var request = new _request.KinveyRequest({
        method: _request.RequestMethod.POST,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: _url2.default.format({
          protocol: this.client.micProtocol,
          host: this.client.micHost,
          pathname: _path2.default.join(pathname, authPathname)
        }),
        properties: options.properties,
        body: {
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code'
        }
      });
      return request.execute().then(function (response) {
        return response.data.temp_login_uri;
      });
    }
  }, {
    key: 'requestCodeWithPopup',
    value: function requestCodeWithPopup(clientId, redirectUri) {
      var _this3 = this;

      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var promise = _es6Promise.Promise.resolve().then(function () {
        var pathname = '/';

        if (options.version) {
          var version = options.version;

          if (!(0, _isString2.default)(version)) {
            version = String(version);
          }

          pathname = _path2.default.join(pathname, version.indexOf('v') === 0 ? version : 'v' + version);
        }

        if (global.Kinvey.Popup) {
          var popup = new global.Kinvey.Popup();
          return popup.open(_url2.default.format({
            protocol: _this3.client.micProtocol,
            host: _this3.client.micHost,
            pathname: _path2.default.join(pathname, authPathname),
            query: {
              client_id: clientId,
              redirect_uri: redirectUri,
              response_type: 'code'
            }
          }));
        }

        throw new _errors.KinveyError('Kinvey.Popup is undefined.' + (' Unable to login using authorization grant ' + AuthorizationGrant.AuthorizationCodeLoginPage + '.'));
      }).then(function (popup) {
        var promise = new _es6Promise.Promise(function (resolve, reject) {
          var redirected = false;

          function loadCallback(event) {
            try {
              if (event.url && event.url.indexOf(redirectUri) === 0 && redirected === false) {
                redirected = true;
                popup.removeAllListeners();
                popup.close();
                resolve(_url2.default.parse(event.url, true).query.code);
              }
            } catch (error) {
              // Just catch the error
            }
          }

          function errorCallback(event) {
            try {
              if (event.url && event.url.indexOf(redirectUri) === 0 && redirected === false) {
                redirected = true;
                popup.removeAllListeners();
                popup.close();
                resolve(_url2.default.parse(event.url, true).query.code);
              } else if (redirected === false) {
                popup.removeAllListeners();
                popup.close();
                reject(new _errors.KinveyError(event.message, '', event.code));
              }
            } catch (error) {
              // Just catch the error
            }
          }

          function closedCallback() {
            if (redirected === false) {
              popup.removeAllListeners();
              reject(new _errors.KinveyError('Login has been cancelled.'));
            }
          }

          popup.on('loadstart', loadCallback);
          popup.on('loadstop', loadCallback);
          popup.on('error', errorCallback);
          popup.on('closed', closedCallback);
        });
        return promise;
      });

      return promise;
    }
  }, {
    key: 'requestCodeWithUrl',
    value: function requestCodeWithUrl(loginUrl, clientId, redirectUri) {
      var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      var promise = _es6Promise.Promise.resolve().then(function () {
        var request = new _request.KinveyRequest({
          method: _request.RequestMethod.POST,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          url: loginUrl,
          properties: options.properties,
          body: {
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            username: options.username,
            password: options.password
          },
          followRedirect: false
        });
        return request.execute();
      }).then(function (response) {
        var location = response.getHeader('location');

        if (location) {
          return _url2.default.parse(location, true).query.code;
        }

        throw new _errors.KinveyError('Unable to authorize user with username ' + options.username + '.', 'A location header was not provided with a code to exchange for an auth token.');
      });

      return promise;
    }
  }, {
    key: 'requestToken',
    value: function requestToken(code, clientId, redirectUri) {
      var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      var request = new _request.KinveyRequest({
        method: _request.RequestMethod.POST,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        authType: _request.AuthType.App,
        url: _url2.default.format({
          protocol: this.client.micProtocol,
          host: this.client.micHost,
          pathname: tokenPathname
        }),
        properties: options.properties,
        body: {
          grant_type: 'authorization_code',
          client_id: clientId,
          redirect_uri: redirectUri,
          code: code
        }
      });
      var promise = request.execute().then(function (response) {
        return response.data;
      });
      return promise;
    }
  }, {
    key: 'logout',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee(user) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var request, response;
        return _regeneratorRuntime2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                request = new _request.KinveyRequest({
                  method: _request.RequestMethod.GET,
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  authType: _request.AuthType.App,
                  url: _url2.default.format({
                    protocol: this.client.micProtocol,
                    host: this.client.micHost,
                    pathname: invalidatePathname,
                    query: { user: user._id }
                  }),
                  properties: options.properties
                });
                _context.next = 3;
                return request.execute();

              case 3:
                response = _context.sent;
                return _context.abrupt('return', response.data);

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function logout(_x7, _x8) {
        return _ref.apply(this, arguments);
      }

      return logout;
    }()
  }, {
    key: 'identity',
    get: function get() {
      return _enums.SocialIdentity.MobileIdentityConnect;
    }
  }], [{
    key: 'identity',
    get: function get() {
      return _enums.SocialIdentity.MobileIdentityConnect;
    }
  }]);

  return MobileIdentityConnect;
}(_social.Social);