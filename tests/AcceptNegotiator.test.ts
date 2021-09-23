import Call from '@chubbyjs/chubbyjs-mock/dist/Call';
import MockByCalls from '@chubbyjs/chubbyjs-mock/dist/MockByCalls';
import ServerRequestInterface from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import { describe, expect, test } from '@jest/globals';
import AcceptNegotiator from '../src/AcceptNegotiator';
import NegotiatedValue from '../src/NegotiatedValue';
import ServerRequestDouble from './Double/ServerRequestDouble';

const mockByCalls = new MockByCalls();

const getRequest = (accept?: string): ServerRequestInterface => {
    if (undefined === accept) {
        return mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
            Call.create('hasHeader').with('Accept').willReturn(false),
        ]);
    }

    return mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
        Call.create('hasHeader').with('Accept').willReturn(true),
        Call.create('getHeaderLine').with('Accept').willReturn(accept),
    ]);
};

describe('AcceptNegotiator', () => {
    test('getSupportedMediaTypes', () => {
        const supportedMediaTypes = ['application/json'];

        const negotiator = new AcceptNegotiator(supportedMediaTypes);

        expect(negotiator.getSupportedMediaTypes()).toBe(supportedMediaTypes);
    });

    describe('negotiate', () => {
        test('without supported mime types', () => {
            const request = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble);

            const negotiator = new AcceptNegotiator([]);

            negotiator.negotiate(request);
        });

        test('without header', () => {
            const request = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('hasHeader').with('Accept').willReturn(false),
            ]);

            const negotiator = new AcceptNegotiator(['application/json']);

            expect(negotiator.negotiate(request)).toBeUndefined();
        });

        [
            {
                accept: 'text/html,*/*;q =0.8 ,   application/xhtml+xml; q=1.0,application/xml; q=0.9',
                supportedMediaTypes: ['application/json', 'application/xml', 'application/x-yaml'],
                expectedAccept: new NegotiatedValue('application/xml', new Map([['q', '0.9']])),
            },
            {
                accept: 'text/html,   application/xhtml+xml,application/xml; q   =   0.9 ,     */    *;q = 0.8',
                supportedMediaTypes: ['application/json', 'application/xml', 'application/x-yaml'],
                expectedAccept: new NegotiatedValue('application/xml', new Map([['q', '0.9']])),
            },
            {
                accept: 'text/html,application/xhtml+xml ,application/xml; q=0.9 ,*/*;  q= 0.8',
                supportedMediaTypes: ['application/json'],
                expectedAccept: new NegotiatedValue('application/json', new Map([['q', '0.8']])),
            },
            {
                accept: '*/json, */xml',
                supportedMediaTypes: ['application/xml'],
                expectedAccept: undefined,
            },
            {
                accept: 'application/*;q=0.5, application/json',
                supportedMediaTypes: ['application/xml', 'application/json'],
                expectedAccept: new NegotiatedValue('application/json', new Map([['q', '1.0']])),
            },
            {
                accept: 'application/*, application/json;q=0.5',
                supportedMediaTypes: ['application/xml', 'application/json'],
                expectedAccept: new NegotiatedValue('application/json', new Map([['q', '0.5']])),
            },
            {
                accept: 'application/*, application/json;q=0.5, application/xml;q=0.8',
                supportedMediaTypes: ['text/html'],
                expectedAccept: undefined,
            },
            {
                accept: 'application/json/json',
                supportedMediaTypes: ['application/json'],
                expectedAccept: undefined,
            },
            {
                accept: 'application, text, application/*',
                supportedMediaTypes: ['application/json'],
                expectedAccept: new NegotiatedValue('application/json', new Map([['q', '1.0']])),
            },
            {
                accept: 'xml, application/json;q=0.5',
                supportedMediaTypes: ['application/json'],
                expectedAccept: new NegotiatedValue('application/json', new Map([['q', '0.5']])),
            },
            {
                accept: 'xml, application/json; q=0.2, application/*;q=0.5',
                supportedMediaTypes: ['application/json'],
                expectedAccept: new NegotiatedValue('application/json', new Map([['q', '0.2']])),
            },
            {
                accept: '*/*,application/*;q=0.5',
                supportedMediaTypes: ['text/html', 'application/json'],
                expectedAccept: new NegotiatedValue('application/json', new Map([['q', '0.5']])),
            },
            {
                accept: 'text/html;q=0.1,application/*;q=0.5,application/xml;q=0.9',
                supportedMediaTypes: ['text/html', 'application/json', 'application/xml'],
                expectedAccept: new NegotiatedValue('application/xml', new Map([['q', '0.9']])),
            },
            {
                accept: 'xml, application/xml ; q=0.6, application/json;q=0.5',
                supportedMediaTypes: ['application/json'],
                expectedAccept: new NegotiatedValue('application/json', new Map([['q', '0.5']])),
            },
            {
                accept: '*/*, application/json;q=0.9, application/xml;q=0.1',
                supportedMediaTypes: ['application/xml'],
                expectedAccept: new NegotiatedValue('application/xml', new Map([['q', '0.1']])),
            },
            {
                accept: 'text/html, application/*;q=0.1',
                supportedMediaTypes: ['application/json'],
                expectedAccept: new NegotiatedValue('application/json', new Map([['q', '0.1']])),
            },
            {
                accept: 'text/html, applicatio[]n./*;q=0.1',
                supportedMediaTypes: ['application/json'],
                expectedAccept: undefined,
            },
            {
                accept: 'application/json ; q=1.0, application/ld+xml; q=0.8, application/ld+json; q=0.3',
                supportedMediaTypes: ['application/ld+json'],
                expectedAccept: new NegotiatedValue('application/ld+json', new Map([['q', '0.3']])),
            },
            {
                accept: 'application/json ; q=1.0, application/ld+xml; q=0.8, application/ld+json; q=0.3',
                supportedMediaTypes: ['application/ld+yaml', 'application/ld+json', 'application/ld+xml'],
                expectedAccept: new NegotiatedValue('application/ld+xml', new Map([['q', '0.8']])),
            },
            {
                accept: 'application/json ; q=1.0, application/ld+xml; q=0.8',
                supportedMediaTypes: ['application/ld+json'],
                expectedAccept: new NegotiatedValue('application/ld+json', new Map([['q', '1.0']])),
            },
            {
                accept: 'application/json;',
                supportedMediaTypes: ['application/json'],
                expectedAccept: new NegotiatedValue('application/json', new Map([['q', '1.0']])),
            },
            {
                accept: 'application/json;q',
                supportedMediaTypes: ['application/json'],
                expectedAccept: new NegotiatedValue('application/json', new Map([['q', '1.0']])),
            },
        ].forEach(({ accept, supportedMediaTypes, expectedAccept }) => {
            test(`negotiate: ${JSON.stringify({ accept, supportedMediaTypes })}`, () => {
                const negotiator = new AcceptNegotiator(supportedMediaTypes);

                expect(negotiator.negotiate(getRequest(accept))).toEqual(expectedAccept);
            });
        });
    });
});
