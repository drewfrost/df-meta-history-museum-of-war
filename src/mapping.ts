import {
  Transfer as TransferEvent,
  Token as TokenContract
} from '../generated/Token/Token';
import { Token, User } from '../generated/schema';

import { ipfs, json } from '@graphprotocol/graph-ts';

const ipfsHash = 'QmU3gHF45sRXbyxojhWEJV1m6t5QFk7DuCi4LeSPK87QJ6';

export function handleTransfer(event: TransferEvent): void {
  let token = Token.load(event.params.tokenId.toString());
  if (!token) {
    token = new Token(event.params.tokenId.toString());
    token.tokenID = event.params.tokenId;
    token.tokenUri = '/' + event.params.tokenId.toString() + '.json';
    let metadata = ipfs.cat(ipfsHash + token.tokenUri);
    if (metadata) {
      const value = json.fromBytes(metadata).toObject();
      if (value) {
        const image = value.get('image');
        const name = value.get('name');
        const description = value.get('description');
        const descriptionUk = value.get('description_uk');
        const externalUrl = value.get('external_url');
        const artistUrl = value.get('artist_url');
        if (
          image &&
          name &&
          description &&
          externalUrl &&
          descriptionUk &&
          artistUrl
        ) {
          token.image = image.toString();
          token.name = name.toString();
          token.description = description.toString();
          token.external_url = externalUrl.toString();
          token.description_uk = descriptionUk.toString();
          token.artist_url = artistUrl.toString();
        }
        const twitter = value.get('twitter');
        if (twitter) {
          const twitterData = twitter.toObject();
          if (twitterData) {
            const twitterUrl = twitterData.get('url');
            const twitterUsername = twitterData.get('username');
            const twitterTweet = twitterData.get('Tweet');
            if (twitterUrl && twitterUsername && twitterTweet) {
              token.twitter_url = twitterUrl.toString();
              token.twitter_username = twitterUsername.toString();
              token.twitter_tweet = twitterTweet.toString();
            }
          }
        }
      }
    }
  }
  token.updatedAtTimestamp = event.block.timestamp;
  token.owner = event.params.to.toHexString();
  token.save();

  let user = User.load(event.params.to.toHexString());
  if(!user){
    user = new User(event.params.to.toHexString());
    user.save();
  }
}
