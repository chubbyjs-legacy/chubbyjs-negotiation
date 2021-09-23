import { describe, expect, test } from '@jest/globals';
import NegotiatedValue from '../src/NegotiatedValue';

describe('NegotiatedValue', () => {
    test('without attributes', () => {
        const negotiatedValue = new NegotiatedValue('application/json');

        expect(negotiatedValue.getValue()).toBe('application/json');
        expect(negotiatedValue.getAttributes()).toEqual(new Map());
    });

    test('with attributes', () => {
        const attributes = new Map([['q', '0.7']]);

        const negotiatedValue = new NegotiatedValue('application/json', attributes);

        expect(negotiatedValue.getValue()).toBe('application/json');
        expect(negotiatedValue.getAttributes()).toBe(attributes);
    });
});
