import ServerRequestInterface from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import NegotiatedValueInterface from './NegotiatedValueInterface';

interface NegotiatorInterface {
    negotiate(request: ServerRequestInterface): NegotiatedValueInterface | undefined;
}

export default NegotiatorInterface;
