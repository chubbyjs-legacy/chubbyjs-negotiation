import ContentTypeNegotiatorInterface from './ContentTypeNegotiatorInterface';
import NegotiatedValueInterface from './NegotiatedValueInterface';
import NegotiatedValue from './NegotiatedValue';
import ServerRequestInterface from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';

class ContentTypeNegotiator implements ContentTypeNegotiatorInterface {
    public constructor(private supportedMediaTypes: Array<string>) {}

    public getSupportedMediaTypes(): Array<string> {
        return this.supportedMediaTypes;
    }

    public negotiate(request: ServerRequestInterface): NegotiatedValueInterface | undefined {
        if (0 === this.supportedMediaTypes.length) {
            return undefined;
        }

        if (!request.hasHeader('Content-Type')) {
            return undefined;
        }

        return this.compareMediaTypes(request.getHeaderLine('Content-Type'));
    }

    private compareMediaTypes(header: string): NegotiatedValueInterface | undefined {
        if (-1 !== header.search(/,/)) {
            return undefined;
        }

        const headerValueParts = header.split(';');
        const mediaType = (headerValueParts.shift() as string).trim();
        const attributes: Map<string, string> = new Map(
            headerValueParts.map((attribute: string) => {
                const [attributeKey, attributeValue] = attribute.split('=');
                return [attributeKey.trim(), attributeValue.trim()];
            }),
        );

        if (-1 !== this.supportedMediaTypes.indexOf(mediaType)) {
            return new NegotiatedValue(mediaType, attributes);
        }

        const negotiatedValue = this.compareMediaTypeWithSuffix(mediaType, attributes);

        if (undefined !== negotiatedValue) {
            return negotiatedValue;
        }

        return undefined;
    }

    private compareMediaTypeWithSuffix(
        mediaType: string,
        attributes: Map<string, string>,
    ): NegotiatedValueInterface | undefined {
        const mediaTypeParts = mediaType.match(/^([^\/]+)\/([^+]+)\+(.+)$/);

        if (null === mediaTypeParts) {
            return undefined;
        }

        const mediaTypeFromParts = mediaTypeParts[1] + '/' + mediaTypeParts[3];

        if (-1 !== this.supportedMediaTypes.indexOf(mediaTypeFromParts)) {
            return new NegotiatedValue(mediaTypeFromParts, attributes);
        }
    }
}

export default ContentTypeNegotiator;
