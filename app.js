var request = require("request");
var express = require("express");
var parseString = require('xml2js').parseString;
var nodemailer = require('nodemailer');

var productId = 60464407;

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: @@@	//add email@gmail.com here,
        pass: $$$	//add password to email here
    }
});

const mailOptions = {
    from: 'austeny.bot@gmail.com', // sender address
    to: 'austen.d.young@gmail.com, carolinetelma97@gmail.com', // list of receivers
    subject: 'Default Header', // Subject line
    html: '<h2 style="display: inline;">IS SLATTUM BED IN STOCK? </h2>'// plain text body
};


console.log("starting ikea bot");
var checkCount = 0;

var intervalId = setInterval(function(){
    checkCount += 1;

    checkInStock(productId);
    if (inStockIndicator){
        console.log("item found");
        clearInterval(intervalId);
        sendEmail();
    }

    if (checkCount == 120){
	console.log(mailOptions);
        checkCount = 0;
        sendEmail();
    }

    console.log("checkCount: " + checkCount);
}, 30000);

function sendEmail() {
    console.log("sending email");
    console.log(mailOptions);
    transporter.sendMail(mailOptions, function (err, info) {
        if(err){
            console.log(err)
        } else {
            console.log(info);
        };
    });
}

var inStockIndicator = false;

function checkInStock(productId){
    var url = "https://www.ikea.com/us/en/iows/catalog/availability/" + productId;
    
    request(url, function(error, response, body){
        if(!error && response.statusCode === 200){
            parseString(body, function(err, result){
                numOfStores = result['ir:ikea-rest'].availability[0].localStore.length;
    
                for(var i=0; i<numOfStores; i++){
                    if(result['ir:ikea-rest'].availability[0].localStore[i].$.buCode == 158){
                        var storeJson = result['ir:ikea-rest'].availability[0].localStore[i].stock[0];
                        var currentStock = storeJson.availableStock[0];
                        var inStockProbability = storeJson.inStockProbabilityCode[0];

			console.log(`currentStock: ${currentStock}, Probability: ${inStockProbability}`);

                        if (currentStock > 0){
                            mailOptions.subject = `IN STOCK, GO ORDER!!! qty: ${currentStock}`;
                            mailOptions.html += `<h1 style="display: inline; font-size: 50px; color: lime;">YES!</h1>
                                                <h3>QTY: <span style="color: lime;">${currentStock}</span><br>
                                                IN-STOCK PROBABILITY: <span style="color: lime;">${inStockProbability}</span></h3>
                                                <a href="https://www.ikea.com/us/en/catalog/products/60464407/">Link to IKEA product page</a>`;
                            inStockIndicator = true;
                        }else{
                            mailOptions.subject = "not in stock...";
                            mailOptions.html += `<h1 style="display: inline; font-size: 50px; color: indianred;">NOPE...</h1>
                                                <h3>QTY: <span style="color: indianred;">${currentStock}</span><br>
                                                IN-STOCK PROBABILITY: <span style="color: indianred;">${inStockProbability}</span></h3>
                                                <a href="https://www.ikea.com/us/en/catalog/products/60464407/">Link to IKEA product page</a>`;
                        }        
                    }
                }
    
            })
    
        } else {
            console.log(error);
            console.log("Status Code: " + response.statusCode);
        }
    })
}

