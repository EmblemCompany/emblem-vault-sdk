
_this == "Collection Record"
data == balances: Arr

recordName = _this.name
firstAsset = data[0]
balanceQty = this.balanceQty
assetName = firstAsset.name

if balanceQty && balanceQty > 0
{
    firstAsset.balance == balanceQty
}



always allow (recordName == embels)
otherwise

zero balance  = false


