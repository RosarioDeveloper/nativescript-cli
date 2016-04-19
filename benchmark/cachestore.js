import { KinveyBenchmark } from './benchmark';
import { DataStore, DataStoreType } from '../src/stores/datastore';
import sample10kJSON from './json/sample1k.json';
import nock from 'nock';

export class CacheStoreBenchmark extends KinveyBenchmark {
  createSimulatedResponses() {
    nock(this.client.baseUrl)
      .get(() => true)
      .query(true)
      .times(Infinity)
      .reply(200, sample10kJSON, {
        'content-type': 'application/json'
      });
  }

  execute() {
    const promise = super.execute().then(() => {
      const store = DataStore.getInstance('books', DataStoreType.Cache);
      return store.find().then(response => response.networkPromise).then(() => {
        const promise = new Promise(resolve => {
          this.suite.add('CacheStore#find with no delta fetch', deferred => {
            store.find(null, { deltaFetch: false }).then(response => response.networkPromise).then(() => {
              deferred.resolve();
            }).catch(() => {
              deferred.reject();
            });
          }, {
            defer: true
          })
          .add('CacheStore#find with delta fetch', deferred => {
            store.find().then(response => response.networkPromise).then(() => {
              deferred.resolve();
            }).catch(() => {
              deferred.reject();
            });
          }, {
            defer: true
          })
          .on('cycle', event => {
            console.log(String(event.target));
          })
          .on('complete', function() {
            nock.cleanAll();
            console.log(`Fastest is ${this.filter('fastest').map('name')}.`);
            resolve();
          })
          .run({ async: true });
        });
        return promise;
      });
    });
    return promise;
  }
}
