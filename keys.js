let stores=Symbol('stores'),
opendb=Symbol('opendb'),
transactionPromise=Symbol('transaction-promise'),
intermediatePromise=Symbol("intermediate-promise"),
upgradeNeeded=Symbol("upgrade-needed"),
checkStores=Symbol("check-stores"),
addInstance=Symbol("add-instance"),
instance=Symbol("instance"),
resolve=Symbol('resolve'),
reject=Symbol('reject'),
clearData=Symbol('clear-data');

export {stores,
        opendb,
        transactionPromise,
        intermediatePromise,
        upgradeNeeded,
        checkStores,
        addInstance,
        instance,
        resolve,
        reject,
        clearData
        };