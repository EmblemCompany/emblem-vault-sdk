const { NFT_DATA } = require('../../dist/utils.js');
const { expect } = require('chai');

describe('Hardcoded Metadata for Darkfarms', function() {
    it('NFT_DATA includes Darkfarms', async () => {
        const token = NFT_DATA["BANKINISSAFE"];
        expect(token).to.exist;
        expect(token.projectName).to.equal("Darkfarms");
    });
});
