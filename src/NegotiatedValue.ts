import NegotiatedValueInterface from './NegotiatedValueInterface';

class NegotiatedValue implements NegotiatedValueInterface {
    public constructor(private value: string, private attributes: Map<string, string> = new Map()) {}

    public getValue(): string {
        return this.value;
    }

    public getAttributes(): Map<string, string> {
        return this.attributes;
    }
}

export default NegotiatedValue;
