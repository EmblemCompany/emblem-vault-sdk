import EmblemVaultSDK from '../src/';

describe('Bulk Mint', () => {
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    describe('generateBulkMintMessage', () => {
        it('produces the expected message format', () => {
            expect(sdk.generateBulkMintMessage(['1', '2', '3']))
                .toEqual('Curated Minting: 1,2,3');
        });

        it('is order-independent (sorts tokenIds)', () => {
            const a = sdk.generateBulkMintMessage(['3', '1', '2']);
            const b = sdk.generateBulkMintMessage(['1', '2', '3']);
            expect(a).toEqual(b);
            expect(a).toEqual('Curated Minting: 1,2,3');
        });

        it('does not mutate the input array', () => {
            const input = ['3', '1', '2'];
            sdk.generateBulkMintMessage(input);
            expect(input).toEqual(['3', '1', '2']);
        });

        it('handles a single tokenId', () => {
            expect(sdk.generateBulkMintMessage(['42'])).toEqual('Curated Minting: 42');
        });

        it('handles an empty list', () => {
            expect(sdk.generateBulkMintMessage([])).toEqual('Curated Minting: ');
        });
    });

    describe('isV2Contract', () => {
        it('is true when the chain type ends with V2', () => {
            expect(sdk.isV2Contract({ 1: { type: 'handlerV2' } }, 1)).toBe(true);
        });

        it('is false when the chain type does not end with V2', () => {
            expect(sdk.isV2Contract({ 1: { type: 'handler' } }, 1)).toBe(false);
        });

        it('is false for missing metadata / chain', () => {
            expect(sdk.isV2Contract(undefined, 1)).toBe(false);
            expect(sdk.isV2Contract({}, 1)).toBe(false);
            expect(sdk.isV2Contract({ 1: {} }, 1)).toBe(false);
        });
    });

    describe('methods are exposed', () => {
        it('exposes requestBulkMintSignature and performBulkMint', () => {
            expect(typeof sdk.requestBulkMintSignature).toBe('function');
            expect(typeof sdk.performBulkMint).toBe('function');
        });
    });
});
