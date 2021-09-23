import Call from '@chubbyjs/chubbyjs-mock/dist/Call';
import MockByCalls from '@chubbyjs/chubbyjs-mock/dist/MockByCalls';
import ServerRequestInterface from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import { describe, expect, test } from '@jest/globals';
import ContentTypeNegotiator from '../src/ContentTypeNegotiator';
import NegotiatedValue from '../src/NegotiatedValue';
import ServerRequestDouble from './Double/ServerRequestDouble';

const mockByCalls = new MockByCalls();

const getRequest = (contentType?: string): ServerRequestInterface => {
    if (undefined === contentType) {
        return mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
            Call.create('hasHeader').with('Content-Type').willReturn(false),
        ]);
    }

    return mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
        Call.create('hasHeader').with('Content-Type').willReturn(true),
        Call.create('getHeaderLine').with('Content-Type').willReturn(contentType),
    ]);
};

describe('ContentTypeNegotiator', () => {
    test('getSupportedMediaTypes', () => {
        const supportedMediaTypes = ['application/json'];

        const negotiator = new ContentTypeNegotiator(supportedMediaTypes);

        expect(negotiator.getSupportedMediaTypes()).toBe(supportedMediaTypes);
    });

    describe('negotiate', () => {
        test('without supported mime types', () => {
            const request = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble);

            const negotiator = new ContentTypeNegotiator([]);

            negotiator.negotiate(request);
        });

        test('without header', () => {
            const request = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('hasHeader').with('Content-Type').willReturn(false),
            ]);

            const negotiator = new ContentTypeNegotiator(['application/json']);

            expect(negotiator.negotiate(request)).toBeUndefined();
        });

        [
            {
                contentType: ' application/xml ; charset = UTF-8 ',
                supportedMediaTypes: ['application/json', 'application/xml', 'application/x-yaml'],
                expectedContentType: new NegotiatedValue('application/xml', new Map([['charset', 'UTF-8']])),
            },
            {
                contentType: 'application/xml                 ; charset=UTF-8',
                supportedMediaTypes: ['application/json'],
                expectedContentType: undefined,
            },
            {
                contentType: 'application/xml; charset=UTF-8,',
                supportedMediaTypes: ['application/json', 'application/xml', 'application/x-yaml'],
                expectedContentType: undefined,
            },
            {
                contentType: 'xml; charset=UTF-8',
                supportedMediaTypes: ['application/xml'],
                expectedContentType: undefined,
            },
            {
                contentType: 'application/jsonx+xml; charset=UTF-8',
                supportedMediaTypes: ['application/xml'],
                expectedContentType: new NegotiatedValue('application/xml', new Map([['charset', 'UTF-8']])),
            },
            {
                contentType: 'application/jsonx+xml; charset=UTF-8',
                supportedMediaTypes: ['application/json'],
                expectedContentType: undefined,
            },
            {
                contentType: '',
                supportedMediaTypes: ['application/json'],
                expectedContentType: undefined,
            },
        ].forEach(({ contentType, supportedMediaTypes, expectedContentType }) => {
            test(`negotiate: ${JSON.stringify({ contentType, supportedMediaTypes })}`, () => {
                const negotiator = new ContentTypeNegotiator(supportedMediaTypes);

                expect(negotiator.negotiate(getRequest(contentType))).toEqual(expectedContentType);
            });
        });
    });
});
