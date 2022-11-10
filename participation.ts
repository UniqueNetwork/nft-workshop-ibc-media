import { Client } from "@unique-nft/sdk";

export const createParticipationCollection = async (sdk: Client, address: string) => {
  const result = await sdk.collections.creation.submitWaitResult({
    address,
    name: "Participations",
    description: "All participations of our amazing events",
    tokenPrefix: "AT",
    schema: {
      schemaName: "unique",
      schemaVersion: "1.0.0",
      coverPicture: {
        url: "https://ipfs.uniquenetwork.dev/ipfs/QmTfW8ao3QztNfFcLqniF1REzSZS8Gvj4Qa2k5e7fyo6WT",
      },
      image: {
        urlTemplate: "{infix}",
      },
      attributesSchemaVersion: "1.0.0",
      attributesSchema: {
        0: {
          name: { _: "Event name" },
          type: "string",
          isArray: false,
          optional: false,
        }
      },
    },
    permissions: {
      nesting: {
        tokenOwner: true,
      },
    },
  });

  if (!result.parsed?.collectionId) {
    console.dir(result, { depth: 10 })
    throw new Error('Failed to create collection');
  }
  return result.parsed?.collectionId;
};

export const createParticipationTokens = async (
  sdk: Client,
  address: string,
  collectionId: number,
  amount: number
) => {
  const perBulk = 50; // amount of tokens to create per iteration
  let created = 0;
  while (created < amount) {
    // if target amount = 99
    // created = 50, toCreate will be lft as 49 - otherwise continue with bulks
    let toCreate = amount - created;
    if (toCreate > perBulk) toCreate = perBulk;
    const tokensToCreate = [...new Array(toCreate)].map((_, index) => {
      return {
        data: {
          image: {
            url: `https://ipfs.uniquenetwork.dev/ipfs/QmTfW8ao3QztNfFcLqniF1REzSZS8Gvj4Qa2k5e7fyo6WT`
          },
          encodedAttributes: {
            0: { 
              _: `Awesome event!`
            }
          }
        },
      };
    });

    await sdk.tokens.createMultiple.submitWaitResult({
      address,
      collectionId,
      tokens: tokensToCreate
    });
    created += toCreate;
  }
};
