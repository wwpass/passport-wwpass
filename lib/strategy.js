/*
    Copyright (C) WWPASS Corporation 2023
    Author: Eugene Medvedev <Eugene.Medvedev@wwpass.com>
*/

const util = require('util');
const Strategy = require('passport-strategy').Strategy;

// Axios is the middle ground solution for the job.
const https = require('https');
const axios = require('axios');

/*
 * WWPass stategy constructor.
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */
function WWPassStrategy(options, verify) {
    this.options = Object.assign(
        {
            ca: `-----BEGIN CERTIFICATE-----
        MIIGATCCA+mgAwIBAgIJAN7JZUlglGn4MA0GCSqGSIb3DQEBCwUAMFcxCzAJBgNV
        BAYTAlVTMRswGQYDVQQKExJXV1Bhc3MgQ29ycG9yYXRpb24xKzApBgNVBAMTIldX
        UGFzcyBDb3Jwb3JhdGlvbiBQcmltYXJ5IFJvb3QgQ0EwIhgPMjAxMjExMjgwOTAw
        MDBaGA8yMDUyMTEyODA4NTk1OVowVzELMAkGA1UEBhMCVVMxGzAZBgNVBAoTEldX
        UGFzcyBDb3Jwb3JhdGlvbjErMCkGA1UEAxMiV1dQYXNzIENvcnBvcmF0aW9uIFBy
        aW1hcnkgUm9vdCBDQTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMmF
        pl1WX80osygWx4ZX8xGyYfHx8cpz29l5s/7mgQIYCrmUSLK9KtSryA0pmzrOFkyN
        BuT0OU5ucCuv2WNgUriJZ78b8sekW1oXy2QXndZSs+CA+UoHFw0YqTEDO659/Tjk
        NqlE5HMXdYvIb7jhcOAxC8gwAJFgAkQboaMIkuWsAnpOtKzrnkWHGz45qoyICjqz
        feDcN0dh3ITMHXrYiwkVq5fGXHPbuJPbuBN+unnakbL3Ogk3yPnEcm6YV+HrxQ7S
        Ky83q60Abdy8ft0RpSJeUkBjJVwiHu4y4j5iKC1tNgtV8qE9Zf2g5vAHzL3obqnu
        IMr8JpmWp0MrrUa9jYOtKXk2LnZnfxurJ74NVk2RmuN5I/H0a/tUrHWtCE5pcVNk
        b3vmoqeFsbTs2KDCMq/gzUhHU31l4Zrlz+9DfBUxlb5fNYB5lF4FnR+5/hKgo75+
        OaNjiSfp9gTH6YfFCpS0OlHmKhsRJlR2aIKpTUEG9hjSg3Oh7XlpJHhWolQQ2BeL
        ++3UOyRMTDSTZ1bGa92oz5nS+UUsE5noUZSjLM+KbaJjZGCxzO9y2wiFBbRSbhL2
        zXpUD2dMB1G30jZwytjn15VAMEOYizBoHEp2Nf9PNhsDGa32AcpJ2a0n89pbSOlu
        yr/vEzYjJ2DZ/TWQQb7upi0G2kRX17UIZ5ZfhjmBAgMBAAGjgcswgcgwHQYDVR0O
        BBYEFGu/H4b/gn8RzL7XKHBT6K4BQcl7MIGIBgNVHSMEgYAwfoAUa78fhv+CfxHM
        vtcocFPorgFByXuhW6RZMFcxCzAJBgNVBAYTAlVTMRswGQYDVQQKExJXV1Bhc3Mg
        Q29ycG9yYXRpb24xKzApBgNVBAMTIldXUGFzcyBDb3Jwb3JhdGlvbiBQcmltYXJ5
        IFJvb3QgQ0GCCQDeyWVJYJRp+DAPBgNVHRMBAf8EBTADAQH/MAsGA1UdDwQEAwIB
        BjANBgkqhkiG9w0BAQsFAAOCAgEAE46CMikI7378mkC3qZyKcVxkNfLRe3eD4h04
        OO27rmfZj/cMrDDCt0Bn2t9LBUGBdXfZEn13gqn598F6lmLoObtN4QYqlyXrFcPz
        FiwQarba+xq8togxjMkZ2y70MlV3/PbkKkwv4bBjOcLZQ1DsYehPdsr57C6Id4Ee
        kEQs/aMtKcMzZaSipkTuXFxfxW4uBifkH++tUASD44OD2r7m1UlSQ5viiv3l0qvA
        B89dPifVnIeAvPcd7+GY2RXTZCw36ZipnFiOWT9TkyTDpB/wjWQNFrgmmQvxQLeW
        BWIUSaXJwlVzMztdtThnt/bNZNGPMRfaZ76OljYB9BKC7WUmss2f8toHiys+ERHz
        0xfCTVhowlz8XtwWfb3A17jzJBm+KAlQsHPgeBEqtocxvBJcqhOiKDOpsKHHz+ng
        exIO3elr1TCVutPTE+UczYTBRsL+jIdoIxm6aA9rrN3qDVwMnuHThSrsiwyqOXCz
        zjCaCf4l5+KG5VNiYPytiGicv8PCBjwFkzIr+LRSyUiYzAZuiyRchpdT+yRAfL7q
        qHBuIHYhG3E47a3GguwUwUGcXR+NjrSmteHRDONOUYUCH41hw6240Mo1lL4F+rpr
        LEBB84k3+v+AtbXePEwvp+o1nu/+1sRkhqlNFHN67vakqC4xTxiuPxu6Pb/uDeNI
        ip0+E9I=
        -----END CERTIFICATE-----`.replace(/\n\s+/g, '\n'),
            spfeAddress: 'https://spfe.wwpass.com/',
            userAgent: 'passport-wwpass',
            ppx: 'wwp_',
            requirePin: false,
            crt: null,
            key: null,
        },
        options || {}
    );

    this._verify = verify;

    // Notice we're checking for explicit null: Any value supplied is considered legal,
    // because otherwise testing would require fake certificates too.
    if (this.options.crt === null) {
        throw new Error(
            'WWPass requires a client certificate, which you did not supply.'
        );
    }
    if (this.options.key === null) {
        throw new Error(
            'WWPass requires a certificate private key, which you did not supply.'
        );
    }

    Strategy.call(this);
    this.name = 'wwpass';

    this.axios = axios.create({
        baseURL: this.options.spfeAddress,
        headers: {
            Accept: '*/*',
            'User-Agent': this.options.userAgent,
        },
        httpsAgent: new https.Agent({
            ca: this.options.ca,
            cert: this.options.crt,
            key: this.options.key,
        }),
    });

    // These functions are deliberately manufactured while the constructor runs.
    // chai-passport-strategy and passport itself appear to use strategies
    // differently, so while moving them to prototypes works in testing, it
    // fails in actual use.

    this.getTicket = () => {
        return this.axios
            .get('get.json', {
                // eslint-disable-next-line camelcase
                params: { auth_type: this.options.requirePin ? 'p' : null },
            })
            .catch((error) => {
                if (error.response) {
                    console.error(
                        'Failed when acquiring ticket from WWPass',
                        error.response.data,
                        error.response.headers
                    );
                } else if (error.request) {
                    // The request was made but no response was received
                    console.error(
                        'Failed when attempting to reach WWPass',
                        error.request
                    );
                } else {
                    console.error('Non-specific WWPass failure', error.message);
                }
                return Promise.reject(error);
            })
            .then((spfe) => {
                if (!spfe.data.result) {
                    return Promise.reject(
                        new Error('WWPass reported an error.', spfe.data)
                    );
                }
                return { ticket: spfe.data.data, ttl: spfe.data.ttl };
            });
    };

    // This function calls WWPass to obtain a ticket, and is itself an Express view to do that,
    // which we need to be so because wwpass-frontend makes this request by itself,
    // we can't just supply a nonce and be done. It calls getTicket to do the actual job,
    // so that the implementation does not necessarily rely on Express.js

    // eslint-disable-next-line no-unused-vars
    this.getTicketExpress = (req, res, next) => {
        this.getTicket().then((ticket) => {
            res.json(ticket);
        });
    };
}

WWPassStrategy.prototype.authenticate = function (req) {
    if (
        req.query[this.options.ppx + 'status'] != 200 ||
        req.query[this.options.ppx + 'reason'] != 'OK'
    ) {
        this.fail('WWPass Authentication Error.', 401);
    } else {
        this.axios
            .get('puid.json', {
                params: {
                    ticket: req.query[this.options.ppx + 'ticket'],
                },
            })
            .catch(() => {
                this.fail('WWPass PUID Error.', 401);
            })
            .then((response) => {
                if (!response.data.result) {
                    this.fail('WWPass Verification Error.', 401);
                } else {
                    if (!!this._verify) {
                        // If we have a verify callback,
                        // call it and pass it a callback that calls the actual
                        // fail/success.
                        try {
                            this._verify(
                                response.data.data,
                                (err, user, info) => {
                                    if (err) {
                                        return Error(err);
                                    } else if (!user) {
                                        return this.fail(info);
                                    } else {
                                        return this.success(user, info);
                                    }
                                }
                            );
                        } catch (ex) {
                            this.error(ex);
                        }
                    } else {
                        // Otherwise invoke success right now.
                        this.success(response.data.data);
                    }
                }
            });
    }
};

util.inherits(WWPassStrategy, Strategy);

module.exports = WWPassStrategy;
