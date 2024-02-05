import { SIG_API } from "../constants/appConstants"

export const getSignedJWT = async (
  signature: string,
  tokenId: string,
  chainId: number
) => {
  const response = await fetch(`${SIG_API}/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      chainid: String(chainId),
    },
    body: JSON.stringify({ signature: signature, tokenId: tokenId }),
  })


  const jtw = await response.json()

  if (jtw?.success === false) throw new Error('JWT signing failed')

  return jtw
}