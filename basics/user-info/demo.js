/*jslint this: true, browser: true, for: true, long: true */
/*global window console demonstrationHelper */

(function () {
    // Create a helper function to remove some boilerplate code from the example itself.
    const demo = demonstrationHelper({
        "isExtendedAssetTypesRequired": true,  // Adds link to app with Extended AssetTypes
        "responseElm": document.getElementById("idResponse"),
        "javaScriptElm": document.getElementById("idJavaScript"),
        "accessTokenElm": document.getElementById("idBearerToken"),
        "retrieveTokenHref": document.getElementById("idHrefRetrieveToken"),
        "tokenValidateButton": document.getElementById("idBtnValidate"),
        "accountsList": document.getElementById("idCbxAccount"),
        "footerElm": document.getElementById("idFooter")
    });

    /**
     * Request the user information.
     * @return {void}
     */
    function getUser() {
        fetch(
            demo.apiUrl + "/port/v1/users/me",
            {
                "method": "GET",
                "headers": {
                    "Authorization": "Bearer " + document.getElementById("idBearerToken").value
                }
            }
        ).then(function (response) {
            const req = "\n\nRequest:\nGET " + response.url + " status " + response.status + " " + response.statusText;
            if (response.ok) {
                response.json().then(function (responseJson) {
                    // Times are in UTC. Convert them to local time:
                    const lastLoginDate = new Date(responseJson.LastLoginTime).toLocaleString();
                    const rep = "\n\nResponse: " + JSON.stringify(responseJson, null, 4);
                    console.log("Found user with clientKey " + responseJson.ClientKey + " (required for other requests).\nLast login @ " + lastLoginDate + "." + req + rep);
                });
            } else {
                demo.processError(response);
            }
        }).catch(function (error) {
            console.error(error);
        });
    }

    /**
     * Request the client information.
     * @return {void}
     */
    function getClient() {
        fetch(
            demo.apiUrl + "/port/v1/clients/me",
            {
                "method": "GET",
                "headers": {
                    "Authorization": "Bearer " + document.getElementById("idBearerToken").value
                }
            }
        ).then(function (response) {
            const req = "\n\nRequest:\nGET " + response.url + " status " + response.status + " " + response.statusText;
            if (response.ok) {
                response.json().then(function (responseJson) {
                    const rep = "\n\nResponse: " + JSON.stringify(responseJson, null, 4);
                    // The default account can be used for the initial population of the screen.
                    console.log("Found client with default accountKey " + responseJson.DefaultAccountKey + "." + req + rep);
                });
            } else {
                demo.processError(response);
            }
        }).catch(function (error) {
            console.error(error);
        });
    }

    /**
     * Request the accounts of this user.
     * @return {void}
     */
    function getAccounts() {
        fetch(
            demo.apiUrl + "/port/v1/accounts/me",
            {
                "method": "GET",
                "headers": {
                    "Authorization": "Bearer " + document.getElementById("idBearerToken").value
                }
            }
        ).then(function (response) {
            const req = "\n\nRequest:\nGET " + response.url + " status " + response.status + " " + response.statusText;
            if (response.ok) {
                response.json().then(function (responseJson) {
                    const rep = "\n\nResponse: " + JSON.stringify(responseJson, null, 4);
                    let textToDisplay = "";
                    let currentAccountGroupName = "";
                    let account;
                    let i;
                    demo.groupAndSortAccountList(responseJson.Data);
                    for (i = 0; i < responseJson.Data.length; i += 1) {
                        account = responseJson.Data[i];
                        // Loop through the data and collect the accountKeys:
                        if (account.hasOwnProperty("AccountGroupName") && account.AccountGroupName !== currentAccountGroupName) {
                            currentAccountGroupName = account.AccountGroupName;
                            textToDisplay += currentAccountGroupName + ":\n";
                        }
                        textToDisplay += (
                            account.AccountKey === demo.user.accountKey  // Make the default account bold or something..
                            ? "** "
                            : " - "
                        );
                        if (account.hasOwnProperty("DisplayName")) {
                            textToDisplay += account.DisplayName + " " + account.AccountId;
                        } else {
                            textToDisplay += account.AccountId;
                        }
                        textToDisplay += " " + account.Currency + " - " + account.AccountKey + " (" + account.AccountType + ")\n";
                    }
                    console.log("Found " + responseJson.Data.length + " account(s) with accountKey(s):\n" + textToDisplay + req + rep);
                });
            } else {
                demo.processError(response);
            }
        }).catch(function (error) {
            console.error(error);
        });
    }

    /**
     * Request the balance for the selected account.
     * @return {void}
     */
    function getBalance() {
        fetch(
            demo.apiUrl + "/port/v1/balances?ClientKey=" + encodeURIComponent(demo.user.clientKey) + "&AccountKey=" + encodeURIComponent(demo.user.accountKey),
            {
                "method": "GET",
                "headers": {
                    "Authorization": "Bearer " + document.getElementById("idBearerToken").value
                }
            }
        ).then(function (response) {
            const req = "\n\nRequest:\nGET " + response.url + " status " + response.status + " " + response.statusText;
            if (response.ok) {
                response.json().then(function (responseJson) {
                    const rep = "\n\nResponse: " + JSON.stringify(responseJson, null, 4);
                    // Show a value in account currency and decimals:
                    const cash = responseJson.Currency + " " + responseJson.TotalValue.toFixed(responseJson.CurrencyDecimals);
                    console.log("The selected account has a total balance of " + cash + "." + req + rep);
                });
            } else {
                demo.processError(response);
            }
        }).catch(function (error) {
            console.error(error);
        });
    }

    document.getElementById("idBtnGetUser").addEventListener("click", function () {
        demo.run(getUser);
    });
    document.getElementById("idBtnGetClient").addEventListener("click", function () {
        demo.run(getClient);
    });
    document.getElementById("idBtnGetAccounts").addEventListener("click", function () {
        demo.run(getAccounts, demo.groupAndSortAccountList);
    });
    document.getElementById("idBtnGetBalance").addEventListener("click", function () {
        demo.run(getBalance);
    });
    demo.displayVersion("port");
}());
