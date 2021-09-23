import Call from '@chubbyjs/chubbyjs-mock/dist/Call';
import MockByCalls from '@chubbyjs/chubbyjs-mock/dist/MockByCalls';
import ServerRequestInterface from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import { describe, expect, test } from '@jest/globals';
import AcceptLanguageNegotiator from '../src/AcceptLanguageNegotiator';
import NegotiatedValue from '../src/NegotiatedValue';
import ServerRequestDouble from './Double/ServerRequestDouble';

const mockByCalls = new MockByCalls();

const getRequest = (accept?: string): ServerRequestInterface => {
    if (undefined === accept) {
        return mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
            Call.create('hasHeader').with('Accept-Language').willReturn(false),
        ]);
    }

    return mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
        Call.create('hasHeader').with('Accept-Language').willReturn(true),
        Call.create('getHeaderLine').with('Accept-Language').willReturn(accept),
    ]);
};

describe('AcceptLanguageNegotiator', () => {
    test('getSupportedLocales', () => {
        const supportedLocales = ['en'];

        const negotiator = new AcceptLanguageNegotiator(supportedLocales);

        expect(negotiator.getSupportedLocales()).toBe(supportedLocales);
    });

    describe('negotiate', () => {
        test('without supported mime types', () => {
            const request = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble);

            const negotiator = new AcceptLanguageNegotiator([]);

            negotiator.negotiate(request);
        });

        test('without header', () => {
            const request = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('hasHeader').with('Accept-Language').willReturn(false),
            ]);

            const negotiator = new AcceptLanguageNegotiator(['en']);

            expect(negotiator.negotiate(request)).toBeUndefined();
        });

        [
            {
                acceptLanguage: 'de,en;q=0.3,en-US;q=0.7',
                supportedLocales: ['en', 'de'],
                expectedAcceptLanguage: new NegotiatedValue('de', new Map([['q', '1.0']])),
            },
            {
                acceptLanguage: 'de, en -US;q    =0.7,en;     q=0.3',
                supportedLocales: ['en', 'de'],
                expectedAcceptLanguage: new NegotiatedValue('de', new Map([['q', '1.0']])),
            },
            {
                acceptLanguage: 'de,en;q=0.3,en   - US ; q = 0.7',
                supportedLocales: ['en'],
                expectedAcceptLanguage: new NegotiatedValue('en', new Map([['q', '0.3']])),
            },
            {
                acceptLanguage: 'de,                       en ; q                   =         0.3   ',
                supportedLocales: ['en'],
                expectedAcceptLanguage: new NegotiatedValue('en', new Map([['q', '0.3']])),
            },
            {
                acceptLanguage: 'pt ; q= 0.5,de,en;q=0.3',
                supportedLocales: ['fr'],
                expectedAcceptLanguage: undefined,
            },
            {
                acceptLanguage: 'en-US;q=0.7,*;q=0.3,fr; q=0.8',
                supportedLocales: ['de'],
                expectedAcceptLanguage: new NegotiatedValue('de', new Map([['q', '0.3']])),
            },
            {
                acceptLanguage: 'en-US;q=0.7,*;q=0.3,fr; q=0.8',
                supportedLocales: ['fr'],
                expectedAcceptLanguage: new NegotiatedValue('fr', new Map([['q', '0.8']])),
            },
            {
                acceptLanguage: 'en; q=0.1, fr; q=0.4, fu; q=0.9, de; q=0.2',
                supportedLocales: ['de', 'fu', 'en'],
                expectedAcceptLanguage: new NegotiatedValue('fu', new Map([['q', '0.9']])),
            },
            {
                acceptLanguage: 'de-CH,de;q=0.8',
                supportedLocales: ['de'],
                expectedAcceptLanguage: new NegotiatedValue('de', new Map([['q', '0.8']])),
            },
            {
                acceptLanguage: 'de-CH',
                supportedLocales: ['de'],
                expectedAcceptLanguage: new NegotiatedValue('de', new Map([['q', '1.0']])),
            },
            {
                acceptLanguage: 'de',
                supportedLocales: ['de-CH'],
                expectedAcceptLanguage: undefined,
            },
            {
                acceptLanguage: '*,de;q=0.1',
                supportedLocales: ['de'],
                expectedAcceptLanguage: new NegotiatedValue('de', new Map([['q', '0.1']])),
            },
            {
                acceptLanguage: 'de-DE-AT,en-US',
                supportedLocales: ['de'],
                expectedAcceptLanguage: undefined,
            },
            {
                acceptLanguage: 'en,fr,it,de-CH',
                supportedLocales: ['de'],
                expectedAcceptLanguage: new NegotiatedValue('de', new Map([['q', '1.0']])),
            },
            {
                // invalid header - semicolon without qvalue key pair
                acceptLanguage: 'de;',
                supportedLocales: ['de'],
                expectedAcceptLanguage: new NegotiatedValue('de', new Map([['q', '1.0']])),
            },
            {
                // invalid header - semicolon without qvalue key pair
                acceptLanguage: 'de;q',
                supportedLocales: ['de'],
                expectedAcceptLanguage: new NegotiatedValue('de', new Map([['q', '1.0']])),
            },
        ].forEach(({ acceptLanguage, supportedLocales, expectedAcceptLanguage }) => {
            test(`negotiate: ${JSON.stringify({ acceptLanguage, supportedLocales })}`, () => {
                const negotiator = new AcceptLanguageNegotiator(supportedLocales);

                expect(negotiator.negotiate(getRequest(acceptLanguage))).toEqual(expectedAcceptLanguage);
            });
        });
    });
});
