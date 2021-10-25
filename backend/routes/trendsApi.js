const router = require('express').Router();
const googleTrends = require('google-trends-api');


router.route('/').post(async (req, res) => {
    // make request here
    // console.log(req.body.previousStartDate);
    // console.log(new Date(req.body.previousStartDate));
    let returnResults = {
        "symbols": req.body.keywords,
        "previousTimeframe": 0,
        "currentTimeframe": 0
    };
    const optionsObjectPrevious = {
        "keyword": req.body.keywords,
        "startTime": new Date(req.body.previousStartDate),
        "endTime": new Date(req.body.previousEndDate),
        "geo": "US",
        "category": 1163,
    }
    const optionsObjectCurrent = {
        "keyword": req.body.keywords,
        "startTime": new Date(req.body.currentStartDate),
        "endTime": new Date(req.body.currentEndDate),
        "geo": "US",
        "category": 1163,
    }
    if (req.body.keywords.length <= 5) {
        googleTrends.interestOverTime(optionsObjectPrevious)
            .then(function (results) {
                // console.log('previousResults', results);
                results = JSON.parse(results);
                var sumsPrevious = [];


                console.log(results);
                if (results.default.timelineData.length > 0) {
                    for (var i = 0; i < results.default.timelineData[0].value.length; i++) {
                        sumsPrevious.push(results.default.timelineData[0].value[i]);
                    }
                    for (i = 1; i < results.default.timelineData.length; i++) {
                        for (var j = 0; j < results.default.timelineData[i].value.length; j++) {
                            sumsPrevious[j] += results.default.timelineData[i].value[j];
                        }
                    }
                    for (i = 0; i < results.default.timelineData.length; i++) {
                        sumsPrevious[i] /= results.default.timelineData.length;
                        sumsPrevious[i] = parseFloat(sumsPrevious[i].toFixed(2));
                    }
                }

                console.log(sumsPrevious);

                googleTrends.interestOverTime(optionsObjectCurrent)
                    .then(function (resultsCurrent) {
                        resultsCurrent = JSON.parse(resultsCurrent);
                        var sumsCurrent = [];
                        if (resultsCurrent.default.timelineData.length > 0) {
                            for (var i = 0; i < resultsCurrent.default.timelineData[0].value.length; i++) {
                                sumsCurrent.push(resultsCurrent.default.timelineData[0].value[i]);
                            }
                            for (i = 1; i < resultsCurrent.default.timelineData.length; i++) {
                                for (var j = 0; j < resultsCurrent.default.timelineData[i].value.length; j++) {
                                    sumsCurrent[j] += resultsCurrent.default.timelineData[i].value[j];
                                }
                            }
                            for (i = 0; i < resultsCurrent.default.timelineData.length; i++) {
                                sumsCurrent[i] /= resultsCurrent.default.timelineData.length;
                                sumsCurrent[i] = parseFloat(sumsCurrent[i].toFixed(2));
                            }
                        }

                        console.log(sumsCurrent);

                        returnResults.previousTimeframe = sumsPrevious;
                        returnResults.currentTimeframe = sumsCurrent;

                        res.json(returnResults);
                    })
                    .catch(function (err) {
                        console.error('Oh no there was an error', err);
                    });


            })
            .catch(function (err) {
                console.error('Oh no there was an error', err);
            });
    } else {
        // todo: split array into arrays of 4
        let allResultsCurrent = [];
        let allResultsPrevious = [];

        let finalAllResultsCurrent = [];
        let finalAllResultsPrevious = [];
        var perChunk = 4; // items per chunk    

        var chunkedArray = req.body.keywords.reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / perChunk)

            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = [] // start a new chunk
            }

            resultArray[chunkIndex].push(item)

            return resultArray
        }, [])


        var completed_requests_previous = 0;
        var completed_requests_current = 0;
        var allFinished = 0;

        const getResultsPrevious = (optionsObjectPreviousChunk) => {
            googleTrends.interestOverTime(optionsObjectPreviousChunk).then(response => {
                let currObj = {
                    "symbols": optionsObjectPreviousChunk,
                    "response": response
                }
                allResultsPrevious.push(currObj);
                if (completed_requests_previous++ === arrayOfPromises.length - 1 ) {
                    // console.log("Previous Requests are completed");
                    for (var i = 0; i < allResultsPrevious.length; i++) {
                        allResultsPrevious[i].response = JSON.parse(allResultsPrevious[i].response);
                    }
                    // console.log("allResultsPrevious", allResultsPrevious);
                    let arrayOfArrays = [];

                    for (i = 0; i < allResultsPrevious.length; i++){
                        let anArr = [];
                        for (var k = 0; k < allResultsPrevious[i].response.default.timelineData[0].value.length; k++){
                            anArr.push(allResultsPrevious[i].symbols.keyword[k]);
                            anArr.push(allResultsPrevious[i].response.default.timelineData[0].value[k]);
                        }
                        arrayOfArrays.push(anArr);
                    }

                    // console.log("arrayOfArrays", arrayOfArrays);
                    // all added
                    for(i = 0; i < allResultsPrevious.length; i++){
                        for(var j = 0; j < allResultsPrevious[i].response.default.timelineData.length; j++){
                            for(var z = 1, k = 0 ; k < allResultsPrevious[i].response.default.timelineData[j].value.length; k++, z = z + 2){
                                arrayOfArrays[i][z] += allResultsPrevious[i].response.default.timelineData[j].value[k];
                            }
                        }
                    }

                    // console.log("arrayOfArrays added", arrayOfArrays);

                    // now find averages
                    for(i = 0; i < arrayOfArrays.length; i++){
                        for(j = 1; j < arrayOfArrays[i].length; j += 2){
                            arrayOfArrays[i][j] = parseFloat((arrayOfArrays[i][j] / allResultsPrevious[i].response.default.timelineData.length).toFixed(2));
                        }
                    }

                    // console.log("arrayOfArrays Averages", arrayOfArrays);


                    // todo: got all results here, now normalize the results
                    // calculate average in 2
                    let allResultsIndexOne = 0;
                    let allResultsIndexTwo = 0;

                    for (i = 0; i < allResultsPrevious.length; i++) {
                        for (j = i + 1; j < allResultsPrevious.length; j++) {
                            if (allResultsPrevious[i].response.default.timelineData[0].value.length === allResultsPrevious[j].response.default.timelineData[0].value.length) {
                                allResultsIndexOne = i;
                                allResultsIndexTwo = j;
                                break;
                            }
                        }
                    }   
                    // console.log("allResultsIndexOne", allResultsIndexOne);
                    // console.log("allResultsIndexTwo", allResultsIndexTwo);
                    // console.log("element1", arrayOfArrays[allResultsIndexOne][arrayOfArrays[allResultsIndexOne].length - 1]);
                    // console.log("element2", arrayOfArrays[allResultsIndexTwo][arrayOfArrays[allResultsIndexTwo].length - 1]);
                    let normalizationFactor = arrayOfArrays[allResultsIndexOne][arrayOfArrays[allResultsIndexOne].length - 1] / arrayOfArrays[allResultsIndexTwo][arrayOfArrays[allResultsIndexTwo].length - 1];
                    // console.log("normalizationFactor", normalizationFactor);
                    for(i = 0; i < arrayOfArrays.length; i++){
                        if(i !== allResultsIndexOne){
                            for(j = 1; j < arrayOfArrays[i].length; j += 2){
                                arrayOfArrays[i][j] = parseFloat((arrayOfArrays[i][j] * normalizationFactor).toFixed(2));
                            }
                        }
                    }
                    for(i = 0; i < arrayOfArrays.length; i++){
                        arrayOfArrays[i].pop();
                        arrayOfArrays[i].pop();
                    }

                    console.log("allResultsPrevious Normalized", arrayOfArrays);
                    for(i = 0; i < arrayOfArrays.length; i++){
                        finalAllResultsPrevious.push(...arrayOfArrays[i]);
                    }
                    console.log("final Previous Array", finalAllResultsPrevious);
                
                    //todo: check if all results are finished, then combine and send back res
                    if (completed_requests_current === completed_requests_previous) {
                        if (!allFinished){
                            allFinished = 1;
                            let finalFinalReturnObjectArray = [];
                            // making working objects on backend
                            for(i = 0; i < finalAllResultsPrevious.length; i+=2){
                                for (j = 0; j < finalAllResultsCurrent.length; j+=2){
                                    if(finalAllResultsPrevious[i] === finalAllResultsCurrent[j]){
                                        let currentObject = {
                                            "keyword": finalAllResultsPrevious[i],
                                            "previousTimeframe": finalAllResultsPrevious[i+1],
                                            "currentTimeframe": finalAllResultsCurrent[j+1],
                                            "status": finalAllResultsPrevious[i+1] < finalAllResultsCurrent[j+1] ? 'Higher' : finalAllResultsPrevious[i+1] == finalAllResultsCurrent[j+1] ? 'Same' : "Lower"
                                        }
                                        finalFinalReturnObjectArray.push(currentObject);
                                    }
                                }
                            }

                            console.log("final final final results", finalFinalReturnObjectArray );

                            res.json(finalFinalReturnObjectArray);
                        }
                        
                    }

                }
            }).catch(e => {
                console.log(e);
            });
        }

        const getResultsCurrent = (optionsObjectCurrentChunk) => {
            googleTrends.interestOverTime(optionsObjectCurrentChunk).then(response => {
                let currObj = {
                    "symbols": optionsObjectCurrentChunk,
                    "response": response
                }
                allResultsCurrent.push(currObj);
                if (completed_requests_current++ === arrayOfPromises.length - 1 ) {
                    console.log("Current Requests are completed");
                    // while ()
                    // {
                    // }
                    // console.log("All requests are completed");
                    // All downloads are completed
                    // console.log('body:', allResults);
                    for (var i = 0; i < allResultsCurrent.length; i++) {
                        allResultsCurrent[i].response = JSON.parse(allResultsCurrent[i].response);
                    }
                    // console.log("allResultsCurrent", allResultsCurrent);
                    let arrayOfArrays = [];

                    for (i = 0; i < allResultsCurrent.length; i++){
                        let anArr = [];
                        for (var k = 0; k < allResultsCurrent[i].response.default.timelineData[0].value.length; k++){
                            anArr.push(allResultsCurrent[i].symbols.keyword[k]);
                            anArr.push(allResultsCurrent[i].response.default.timelineData[0].value[k]);
                        }
                        arrayOfArrays.push(anArr);
                    }

                    // console.log("arrayOfArrays", arrayOfArrays);
                    // all added
                    for(i = 0; i < allResultsCurrent.length; i++){
                        for(var j = 0; j < allResultsCurrent[i].response.default.timelineData.length; j++){
                            for(var z = 1, k = 0 ; k < allResultsCurrent[i].response.default.timelineData[j].value.length; k++, z = z + 2){
                                arrayOfArrays[i][z] += allResultsCurrent[i].response.default.timelineData[j].value[k];
                            }
                        }
                    }

                    // console.log("arrayOfArrays added", arrayOfArrays);

                    // now find averages
                    for(i = 0; i < arrayOfArrays.length; i++){
                        for(j = 1; j < arrayOfArrays[i].length; j += 2){
                            arrayOfArrays[i][j] = parseFloat((arrayOfArrays[i][j] / allResultsCurrent[i].response.default.timelineData.length).toFixed(2));
                        }
                    }

                    // console.log("arrayOfArrays Averages", arrayOfArrays);


                    // todo: got all results here, now normalize the results
                    // calculate average in 2
                    let allResultsIndexOne = 0;
                    let allResultsIndexTwo = 0;

                    for (i = 0; i < allResultsCurrent.length; i++) {
                        for (j = i + 1; j < allResultsCurrent.length; j++) {
                            if (allResultsCurrent[i].response.default.timelineData[0].value.length === allResultsCurrent[j].response.default.timelineData[0].value.length) {
                                allResultsIndexOne = i;
                                allResultsIndexTwo = j;
                                break;
                            }
                        }
                    }   
                    // console.log("allResultsIndexOne", allResultsIndexOne);
                    // console.log("allResultsIndexTwo", allResultsIndexTwo);

                    // console.log("values1", allResultsCurrent[allResultsIndexOne].response.default.timelineData[0].value);
                    // console.log("values2", allResultsCurrent[allResultsIndexTwo].response.default.timelineData[0].value);

                    // console.log("element1", arrayOfArrays[allResultsIndexOne][arrayOfArrays[allResultsIndexOne].length - 1]);
                    // console.log("element2", arrayOfArrays[allResultsIndexTwo][arrayOfArrays[allResultsIndexTwo].length - 1]);
                    let normalizationFactor = arrayOfArrays[allResultsIndexOne][arrayOfArrays[allResultsIndexOne].length - 1] / arrayOfArrays[allResultsIndexTwo][arrayOfArrays[allResultsIndexTwo].length - 1];
                    console.log("normalizationFactor", normalizationFactor);
                    for(i = 0; i < arrayOfArrays.length; i++){
                        if(i !== allResultsIndexOne){
                            for(j = 1; j < arrayOfArrays[i].length; j += 2){
                                arrayOfArrays[i][j] = parseFloat((arrayOfArrays[i][j] * normalizationFactor).toFixed(2));
                            }
                        }
                    }

                    for(i = 0; i < arrayOfArrays.length; i++){
                        arrayOfArrays[i].pop();
                        arrayOfArrays[i].pop();
                    }

                    console.log("allResultsCurrent Normalized", arrayOfArrays);
                    for(i = 0; i < arrayOfArrays.length; i++){
                        finalAllResultsCurrent.push(...arrayOfArrays[i]);
                    }
                    console.log("final Current Array", finalAllResultsCurrent);


                
                    //todo: check if all results are finished, then combine and send back res
                    if (completed_requests_current === completed_requests_previous) {
                        if (!allFinished){
                            allFinished = 1;
                            let finalFinalReturnObjectArray = [];
                            // making working objects on backend
                            for(i = 0; i < finalAllResultsPrevious.length; i+=2){
                                for (j = 0; j < finalAllResultsCurrent.length; j+=2){
                                    if(finalAllResultsPrevious[i] === finalAllResultsCurrent[j]){
                                        let currentObject = {
                                            "keyword": finalAllResultsPrevious[i],
                                            "previousTimeframe": finalAllResultsPrevious[i+1],
                                            "currentTimeframe": finalAllResultsCurrent[j+1],
                                            "status": finalAllResultsPrevious[i+1] < finalAllResultsCurrent[j+1] ? 'Higher' : finalAllResultsPrevious[i+1] == finalAllResultsCurrent[j+1] ? 'Same' : "Lower"
                                        }
                                        finalFinalReturnObjectArray.push(currentObject);
                                    }
                                }
                            }

                            console.log("final final final results", finalFinalReturnObjectArray );

                            res.json(finalFinalReturnObjectArray);
                        }
                    }

                }
            }).catch(e => {
                console.log("error", e);
            });
        }
        const arrayOfPromises = chunkedArray.map(chunkedKeywords => {
            chunkedKeywords.push("aapl");
            console.log(chunkedKeywords)
            const optionsObjectPreviousChunk = {
                "keyword": chunkedKeywords,
                "startTime": new Date(req.body.previousStartDate),
                "endTime": new Date(req.body.previousEndDate),
                "geo": "US",
                "category": 1163,
            }
            getResultsPrevious(optionsObjectPreviousChunk);

            const optionsObjectCurrentChunk = {
                "keyword": chunkedKeywords,
                "startTime": new Date(req.body.currentStartDate),
                "endTime": new Date(req.body.currentEndDate),
                "geo": "US",
                "category": 1163,
            }
            getResultsCurrent(optionsObjectCurrentChunk);
        });

    }


});

module.exports = router;