every function that fetches data, should allow for an override function that can provide an alternate source (for mocking, for database usage to pass in a db, etc)
imports should be normal

support import and require 
so js and ts

remove dependancy on web3

make a signer

let another vault be the signer (with a vault api key)

document a vault api key, 

allow vaults to be created with a to that's not an eoa, so we can assign it to a social auth


Vault lifecycle

Get curated collection(s)
select one collection to mint
grab template from collection.mintTemplate
populate template with owner, name description and curated contents if required
validate template
create vault

**** balance loading ****

check mintabilty with collection.valid()
if valid, perform mint steps
get local signature

TODO NEXT 
make signer util for tests
import into tests, making 2 signers, a user and a server
request remote signature using user signature
fake server signature
perform mint, overriding result

bonus:
add emblem vault ai as a provider, and implement the functions for each vault type using the sdk


