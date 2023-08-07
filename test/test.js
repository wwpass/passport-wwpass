/*
    Copyright (C) WWPASS Corporation 2023
    Author: Eugene Medvedev <Eugene.Medvedev@wwpass.com>
*/

const chai = require('chai');
const assert = chai.assert;
const nock = require('nock');
const WWPassStrategy = require('../lib');

chai.use(require('chai-passport-strategy'));
chai.use(require('@jridgewell/chai-as-promised-es5'));

const spfeURL = 'https://spfe.wwpass.com';

const testOptions = {
    key: '',
    crt: '',
};

const ppxTestOptions = {
    key: '',
    crt: '',
    ppx: 'foo_',
};

const testTicket = 'Test:2dc1211df4ef72c295d9f7632f93a9a1@p-sp-02-20:16033';
const testPUID = '4bab00c2c79c55a2c6ed7802dc33821e';

describe('passport-wwpass', () => {
    let strat;
    before(() => {
        strat = new WWPassStrategy(testOptions);
    });

    describe('getTicket', () => {
        before(() => {
            nock(spfeURL).get('/get.json').reply(200, {
                encoding: 'plain',
                data: testTicket,
                result: true,
                ttl: 600,
            });
        });
        it('works', (done) => {
            strat.getTicketExpress(
                null,
                // Mocking up a minimal res structure to accept the reply,
                // so we don't have to create a complete express.js environment.
                {
                    json: (x) => {
                        assert.deepEqual(x, { ticket: testTicket, ttl: 600 });
                        done();
                    },
                },
                null
            );
        });
    });

    describe('getTicket', () => {
        before(() => {
            nock(spfeURL).get('/get.json').reply(200, {
                encoding: 'plain',
                data: 'some WWPass error',
                result: false,
            });
        });
        it('gracefully fails', () => {
            return assert.isRejected(
                strat.getTicket(),
                Error,
                'WWPass reported an error'
            );
        });
    });

    describe('authorize', () => {
        before(() => {
            nock(spfeURL)
                .get('/puid.json')
                .query({ ticket: testTicket })
                .reply(200, {
                    encoding: 'plain',
                    data: testPUID,
                    result: true,
                });
        });

        it('works', (done) => {
            chai.passport
                .use(strat)
                .request((req) => {
                    req.query = {
                        /* eslint-disable camelcase */
                        wwp_status: '200',
                        wwp_reason: 'OK',
                        wwp_ticket: testTicket,
                        /* eslint-enable camelcase */
                    };
                })
                .success((user) => {
                    assert.equal(user, testPUID);
                    done();
                })
                .authenticate();
        });
    });

    describe('authorize', () => {
        before(() => {
            nock(spfeURL)
                .get('/puid.json')
                .query({ ticket: testTicket })
                .reply(200, {
                    encoding: 'plain',
                    data: testPUID,
                    result: true,
                });
        });

        it('works with a verify callback', (done) => {
            chai.passport
                .use(
                    new WWPassStrategy(testOptions, function (puid, done) {
                        done(null, puid);
                    })
                )
                .request((req) => {
                    req.query = {
                        /* eslint-disable camelcase */
                        wwp_status: '200',
                        wwp_reason: 'OK',
                        wwp_ticket: testTicket,
                        /* eslint-enable camelcase */
                    };
                })
                .success((user) => {
                    assert.equal(user, testPUID);
                    done();
                })
                .authenticate();
        });
    });

    describe('authorize', () => {
        before(() => {
            nock(spfeURL)
                .get('/puid.json')
                .query({ ticket: testTicket })
                .reply(200, {
                    encoding: 'plain',
                    data: testPUID,
                    result: true,
                });
        });

        it('works with a redefined ppx', (done) => {
            chai.passport
                .use(
                    new WWPassStrategy(ppxTestOptions, function (puid, done) {
                        done(null, puid);
                    })
                )
                .request((req) => {
                    req.query = {
                        /* eslint-disable camelcase */
                        foo_status: '200',
                        foo_reason: 'OK',
                        foo_ticket: testTicket,
                        /* eslint-enable camelcase */
                    };
                })
                .success((user) => {
                    assert.equal(user, testPUID);
                    done();
                })
                .authenticate();
        });
    });

    describe('authorize', () => {
        it('does not proceed under false pretense', (done) => {
            chai.passport
                .use(strat)
                .request((req) => {
                    req.query = {
                        /* eslint-disable camelcase */
                        wwp_status: '400',
                        wwp_reason: 'Error',
                        wwp_ticket: testTicket,
                        /* eslint-enable camelcase */
                    };
                })
                .fail((msg) => {
                    assert.equal(msg, 'WWPass Authentication Error.');
                    done();
                })
                .authenticate();
        });
    });

    describe('authorize', () => {
        before(() => {
            nock(spfeURL)
                .get('/puid.json')
                .query({ ticket: testTicket })
                .reply(200, {
                    encoding: 'plain',
                    data: 'error message',
                    result: false,
                });
        });

        it('gracefully fails', (done) => {
            chai.passport
                .use(strat)
                .request((req) => {
                    req.query = {
                        /* eslint-disable camelcase */
                        wwp_status: '200',
                        wwp_reason: 'OK',
                        wwp_ticket: testTicket,
                        /* eslint-enable camelcase */
                    };
                })
                .fail((msg) => {
                    assert.equal(msg, 'WWPass Verification Error.');
                    done();
                })
                .authenticate();
        });
    });
});
