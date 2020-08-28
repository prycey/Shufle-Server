

/*
 * tree-collapse list of queries that are all to be or-ed together
 *
 * i.e. queryOrAll(q1, q2, q3, q4, q5) = ((q1 || q2) || (q3 || q4)) || q5
 */
export function queryOrAll(queryList) {
    let resList = [...queryList];
    let dif = 1;
    while (dif < queryList.length) {
        for (let i = 0; i < queryList.length - dif; i += (2 * dif)) {
            resList[i] = Parse.Query.or(resList[i], resList[i + dif]);
        }
        dif *= 2;
    }
    return resList[0];
}


export async function getUserTempStorage(user) {
    const TempStorage = Parse.Object.extend("TempStorage");

    let tempStorage;
    let tempStorageId = user.get("temp_storage");
    if (tempStorageId === undefined) {
        // have not yet created temporary storage
        tempStorage = new TempStorage();
        user.set("temp_storage", tempStorage);
        await user.save(null, { useMasterKey: true });
    }
    else {
        const tempStorageQuery = new Parse.Query(TempStorage);
        tempStorage = await tempStorageQuery.get(tempStorageId.id, { useMasterKey: true });
    }
    return tempStorage;
}
