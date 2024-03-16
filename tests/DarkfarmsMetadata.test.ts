import { NFT_DATA } from '../src/utils'

describe('Hardcoded Metadata for Darkfarms', () => {
        it('NFT_DATA includes Darkfarms', async () => {
            const token = NFT_DATA["BANKINISSAFE"]
            expect(token).toBeDefined()
            expect(token.projectName).toEqual("Darkfarms")
        })
    }
)