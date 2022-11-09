import { Sdk } from "@unique-nft/sdk";
import { KeyringProvider } from "@unique-nft/accounts/keyring";
import prompt from "prompt";
import config from "./env";
import { createAttendeeCollection, createAttendeeTokens } from "./attendee";
import { createParticipationCollection, createParticipationTokens } from "./participation";

const rl = (str: string) => prompt.get([str]);

const main = async () => {
  prompt.start();
  // Validate wallet and network
  if (!config.seed || !config.sdkRestUrl) throw new Error("Env not set");

  // Initialize SDK with the seed that will be used with all transactions.
  const signer = await KeyringProvider.fromMnemonic(config.seed);
  const address = signer.getAddress();
  console.log(`Running from: ${address}, url: ${config.sdkRestUrl}`);
  const sdk = new Sdk({ baseUrl: config.sdkRestUrl, signer });

  // Create attendee collection
  const attendeeCollectionId = await createAttendeeCollection(sdk, address);
  await rl(
    `Created attendee collection with id: ${attendeeCollectionId}\nPress any key to continue...`
  );

  // Create attendee tokens
  await createAttendeeTokens(sdk, address, attendeeCollectionId, 10);
  const attendeeTokensCount = await sdk.collections.lastTokenId({
    collectionId: attendeeCollectionId,
  });
  await rl(
    `Created ${attendeeTokensCount.tokenId} attendee tokens\nPress any key to continue...`
  );

  // TODO: ______________________________________________________________________________________________________________

  // Create participation collection
  const participationCollectionId = await createParticipationCollection(sdk, address);;
  await rl(
    `Created participation collection with id: ${participationCollectionId}\nPress any key to continue...`
  );

  // Create participation tokens
  const participationTokensCount = await sdk.collections.lastTokenId({
    collectionId: participationCollectionId,
  });
  await createParticipationTokens(sdk, address, participationCollectionId, 10);
  await rl(`Created ${participationTokensCount.tokenId} participation tokens\nPress any key to continue...`);

  // TODO: make a distinct difference between token id and token id
  // Lets nest a single participation token into a attendee token
  const participationTokenId = 1;
  const attendeeTokenId = 1;
  await sdk.tokens.nest.submitWaitResult({
    address,
    parent: { tokenId: attendeeTokenId, collectionId: attendeeCollectionId },
    nested: {
      tokenId: participationTokenId,
      collectionId: participationCollectionId,
    },
  });
  const bundle = await sdk.tokens.getBundle({
    tokenId: attendeeTokenId,
    collectionId: attendeeCollectionId,
  });
  console.dir(bundle, { depth: 10 });
  await rl(
    `Nested token from collection: ${participationCollectionId} with id: ${participationTokenId} into token of collection: ${attendeeCollectionId} with id: ${attendeeTokenId}\nPress any key to continue...`
  );
  // const recepient = 'yGCyN3eydMkze4EPtz59Tn7obwbUbYNZCz48dp8FRdemTaLwm';
  // we can also send token to some else like this
  // await sdk.tokens.transfer.submitWaitResult({ address, collectionId: attendeeCollectionId, tokenId: 1, to: recepient })
  // await rl(`Transfered ${1} from collection ${attendeeCollectionId} to ${recepient}\nPress any key to continue...`)
};


// Lets check if it is actually nested

// The end
main();
