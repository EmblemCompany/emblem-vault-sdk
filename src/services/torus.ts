import FetchNodeDetails from "@toruslabs/fetch-node-details";
import TorusUtils from "@toruslabs/torus.js";

import { WEB3_AUTH_DASHBOARD_CLIENT_ID } from "../constants/appConstants";

export const getTorusKey = async (
  tokenId: string,
  signedJwt: any
): Promise<string> => {
  const fetchNodeDetails = new FetchNodeDetails({ network: "mainnet" });
  const torusUtils = new TorusUtils({
    clientId: WEB3_AUTH_DASHBOARD_CLIENT_ID,
    enableOneKey: true,
    network: "sapphire_mainnet",
  });
  const {
    torusNodeEndpoints, //
    torusIndexes,
  } = await fetchNodeDetails.getNodeDetails({
    verifier: "tor-us-signer-vercel",
    verifierId: tokenId,
  });

  // @TEST
  const {
    finalKeyData: { privKey },
  } = await torusUtils.retrieveShares(
    torusNodeEndpoints,
    torusIndexes,
    "tor-us-signer-vercel",
    { verifier_id: tokenId },
    signedJwt
  );
  if (!privKey) throw new Error("No private key found");
  return privKey;
};
