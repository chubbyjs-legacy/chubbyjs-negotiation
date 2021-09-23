import ServerRequestInterface from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import AcceptLanguageNegotiatorInterface from './AcceptLanguageNegotiatorInterface';
import NegotiatedValue from './NegotiatedValue';
import NegotiatedValueInterface from './NegotiatedValueInterface';

class AcceptLanguageNegotiator implements AcceptLanguageNegotiatorInterface {
    public constructor(private supportedLocales: Array<string>) {}

    public getSupportedLocales(): Array<string> {
        return this.supportedLocales;
    }

    public negotiate(request: ServerRequestInterface): NegotiatedValueInterface | undefined {
        if (0 === this.supportedLocales.length) {
            return undefined;
        }

        if (!request.hasHeader('Accept-Language')) {
            return undefined;
        }

        const acceptLanguages = this.acceptLanguages(request.getHeaderLine('Accept-Language'));

        return this.compareAcceptLanguages(acceptLanguages);
    }

    private acceptLanguages(header: string): Map<string, Map<string, string>> {
        return new Map(
            header
                .split(',')
                .map((headerValue): [string, Map<string, string>] => {
                    const headerValueParts = headerValue.split(';');
                    const locale = (headerValueParts.shift() as string).trim();
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

                    return [locale, attributes];
                })
                .sort((entryA, entryB) => (entryB[1].get('q') as string).localeCompare(entryA[1].get('q') as string)),
        );
    }

    private compareAcceptLanguages(
        acceptLanguages: Map<string, Map<string, string>>,
    ): NegotiatedValueInterface | undefined {
        for (const [locale, attributes] of acceptLanguages.entries()) {
            if (-1 !== this.supportedLocales.indexOf(locale)) {
                return new NegotiatedValue(locale, attributes);
            }
        }

        for (const [locale, attributes] of acceptLanguages.entries()) {
            const negotiatedValue = this.compareLanguage(locale, attributes);

            if (undefined !== negotiatedValue) {
                return negotiatedValue;
            }
        }

        if (acceptLanguages.has('*')) {
            return new NegotiatedValue(this.supportedLocales[0], acceptLanguages.get('*'));
        }

        return undefined;
    }

    private compareLanguage(locale: string, attributes: Map<string, string>): NegotiatedValueInterface | undefined {
        const localeParts = locale.match(/^([^-]+)-([^-]+)$/);

        if (null === localeParts) {
            return undefined;
        }

        const language = localeParts[1];

        if (this.supportedLocales.some((supportedLocale) => supportedLocale === language)) {
            return new NegotiatedValue(language, attributes);
        }

        return undefined;
    }
}

export default AcceptLanguageNegotiator;
