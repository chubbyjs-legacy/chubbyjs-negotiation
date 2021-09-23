import NegotiatorInterface from './NegotiatorInterface';

interface ContentTypeNegotiatorInterface extends NegotiatorInterface {
    getSupportedMediaTypes(): Array<string>;
}

export default ContentTypeNegotiatorInterface;
