import { Aggregation } from './aggregation';
import { Client } from './client';
import { Command } from './command';
import { Log } from './log';
import { Metadata } from './metadata';
import { Query } from './query';
import { DataStore } from './stores/datastore';
import { Sync } from './sync';
import { User } from './user';
import { AuthType, AuthorizationGrant, SocialIdentity, HttpMethod, DataStoreType } from './enums';
import { NetworkRequest } from './requests/network';
import url from 'url';
const appdataNamespace = process.env.KINVEY_DATASTORE_NAMESPACE || 'appdata';

class Kinvey {
  /**
   * Initializes the library with your app's information.
   *
   * @param   {Object}        options                         Options
   * @param   {string}        options.appKey                  My app key
   * @param   {string}        [options.appSecret]             My app secret
   * @param   {string}        [options.masterSecret]          My app's master secret
   * @param   {string}        [options.encryptionKey]         My app's encryption key
   * @param   {string}        [options.protocol]              The protocol of the client.
   * @param   {string}        [options.host]                  The host of the client.
   * @return  {Client}                                        An instance of Client.
   *
   * @throws  {KinveyError}  If an `options.appKey` is not provided.
   * @throws  {KinveyError}  If neither an `options.appSecret` or `options.masterSecret` is provided.
   *
   * @example
   * var client = Kinvey.init({
   *   appKey: 'appKey',
   *   appSecret: 'appSecret'
   * });
   */
  static init(options) {
    const client = Client.init(options);
    return client;
  }

  /**
   * Pings the Kinvey service.
   *
   * @returns {Promise} The response.
   */
  static ping(client = Client.sharedInstance()) {
    const request = new NetworkRequest({
      method: HttpMethod.GET,
      authType: AuthType.All,
      url: url.format({
        protocol: client.protocol,
        host: client.host,
        pathname: `${appdataNamespace}/${client.appKey}`
      })
    });

    const promise = request.execute().then(response => {
      return response.data;
    });

    return promise;
  }
}

Kinvey.Aggregation = Aggregation;
Kinvey.AuthorizationGrant = AuthorizationGrant;
Kinvey.Command = Command;
Kinvey.DataStore = DataStore;
Kinvey.DataStoreType = DataStoreType;
Kinvey.Log = Log;
Kinvey.Metadata = Metadata;
Kinvey.Promise = Promise;
Kinvey.Query = Query;
Kinvey.SocialIdentity = SocialIdentity;
Kinvey.Sync = Sync;
Kinvey.User = User;
export { Kinvey };
