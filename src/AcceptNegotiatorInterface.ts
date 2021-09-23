import NegotiatorInterface from './NegotiatorInterface';

interface AcceptNegotiatorInterface extends NegotiatorInterface {
    getSupportedMediaTypes(): Array<string>;
}

export default AcceptNegotiatorInterface;
