import NegotiatorInterface from './NegotiatorInterface';

interface AcceptLanguageNegotiatorInterface extends NegotiatorInterface {
    getSupportedLocales(): Array<string>;
}

export default AcceptLanguageNegotiatorInterface;
