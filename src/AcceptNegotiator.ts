import AcceptNegotiatorInterface from './AcceptNegotiatorInterface';
import NegotiatedValueInterface from './NegotiatedValueInterface';
import NegotiatedValue from './NegotiatedValue';
import ServerRequestInterface from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';

class AcceptNegotiator implements AcceptNegotiatorInterface {
    private suffixBasedSupportedMediaTypes: Array<string>;

    public constructor(private supportedMediaTypes: Array<string>) {
        this.suffixBasedSupportedMediaTypes = [];

        supportedMediaTypes.forEach((supportedMediaType: string, i: number) => {
            const supportedMediaTypeParts = supportedMediaType.match(/^([^\/+]+)\/([^\/+]+)\+([^\/+]+)$/);

            if (null === supportedMediaTypeParts) {
                return;
            }

            this.suffixBasedSupportedMediaTypes[i] = supportedMediaTypeParts[1] + '/' + supportedMediaTypeParts[3];
        });
    }

    public getSupportedMediaTypes(): Array<string> {
        return this.supportedMediaTypes;
    }

    public negotiate(request: ServerRequestInterface): NegotiatedValueInterface | undefined {
        if (0 === this.supportedMediaTypes.length) {
            return undefined;
        }

        if (!request.hasHeader('Accept')) {
            return undefined;
        }

        const mediaTypes = this.mediaTypes(request.getHeaderLine('Accept'));

        return this.compareMediaTypes(mediaTypes);
    }

    private mediaTypes(header: string): Map<string, Map<string, string>> {
        return new Map(
            header
                .split(',')
                .map((headerValue): [string, Map<string, string>] => {
                    const headerValueParts = headerValue.split(';');
                    const mediaType = (headerValueParts.shift() as string).trim();
                    const attributes: Map<string, string> = new Map(
                        headerValueParts
                            .filter((attribute) => -1 !== attribute.search(/=/))
                            .map((attribute): [string, string] => {
                                const [attributeKey, attributeValue] = attribute.split('=');

                                return [attributeKey.trim(), attributeValue.trim()];
                            }),
                    );

                    if (!attributes.has('q')) {
                        attributes.set('q', '1.0');
                    }

                    return [mediaType, attributes];
                })
                .sort((entryA, entryB) => (entryB[1].get('q') as string).localeCompare(entryA[1].get('q') as string)),
        );
    }

    private compareMediaTypes(mediaTypes: Map<string, Map<string, string>>): NegotiatedValueInterface | undefined {
        for (const [mediaType, attributes] of mediaTypes.entries()) {
            if (-1 !== this.supportedMediaTypes.indexOf(mediaType)) {
                return new NegotiatedValue(mediaType, attributes);
            }
        }

        for (const [mediaType, attributes] of mediaTypes.entries()) {
            const index = this.suffixBasedSupportedMediaTypes.indexOf(mediaType);

            if (-1 !== index) {
                return new NegotiatedValue(this.supportedMediaTypes[index], attributes);
            }
        }

        for (const [mediaType, attributes] of mediaTypes.entries()) {
            const negotiatedValue = this.compareMediaTypeWithTypeOnly(mediaType, attributes);

            if (undefined !== negotiatedValue) {
                return negotiatedValue;
            }
        }

        if (mediaTypes.has('*/*')) {
            return new NegotiatedValue(this.supportedMediaTypes[0], mediaTypes.get('*/*'));
        }

        return undefined;
    }

    private compareMediaTypeWithTypeOnly(
        mediaType: string,
        attributes: Map<string, string>,
    ): NegotiatedValue | undefined {
        const mediaTypeParts = mediaType.match(/^([^\/+]+)\/\*$/);

        if (null === mediaTypeParts) {
            return undefined;
        }

        for (const supportedMediaType of this.supportedMediaTypes) {
            if (
                null !== supportedMediaType.match(new RegExp('^' + this.escapeStringRegexp(mediaTypeParts[1]) + '/.+$'))
            ) {
                return new NegotiatedValue(supportedMediaType, attributes);
            }
        }

        return undefined;
    }

    private escapeStringRegexp(regex: string): string {
        return regex.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
    }
}

export default AcceptNegotiator;
