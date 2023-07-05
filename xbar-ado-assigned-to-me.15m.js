#!/usr/local/bin/node

//  <xbar.title>ADO Assigned To Me</xbar.title>
//  <xbar.version>v0.1</xbar.version>
//  <xbar.author>Marcus Markiewicz</xbar.author>
//  <xbar.author.github>supermem613</xbar.author.github>
//  <xbar.desc>Clickable list of ADO bugs assigned to me.</xbar.desc>
//  <xbar.dependencies>nodejs</xbar.dependencies>

//  <xbar.var>string(USERNAME=""): Azure DevOps username string.</xbar.var>
//  <xbar.var>string(PAT=""): Azure DevOps user PAT string.</xbar.var>
//  <xbar.var>string(ORGANIZATION=""): Azure DevOps organization string.</xbar.var>

// To make it easy to debug, create a shell file with the following content:
//
// PAT="your pat" USERNAME="foo@example.com" ORGANIZATION="your_org" node ./xbar-ado-assigned-to-me.15min.js
//
// Then run it from the command line.

const username = process.env.USERNAME;
const pat = process.env.PAT;
const organization = process.env.ORGANIZATION;

main();

async function main() {

    var ids = await queryAssignedToBugs();
    console.log(ids.length + '🐛');
    console.log('---');

    if (ids.length > 0) {
        var unsortedWorkItems = await queryWorkItemsFromIds(ids);

        let workItems = [];
        unsortedWorkItems.value.forEach(entry => {
            workItems.push([entry, entry.fields["System.ChangedDate"]]);
        });

        workItems.sort(function(a, b) {
            return new Date(b[1]) - new Date(a[1]);
        });

        workItems.forEach(entry => {
            var title = entry[0].fields["System.Title"];
            if (title.length > 100) {
                title = title.substring(0, 100) + '...';
            }

            const teamProject = entry[0].fields["System.TeamProject"];

            var value = `${entry[0].id}: ${title} | href=https://${organization}.visualstudio.com/${teamProject}/_workitems/edit/${entry[0].id}`;

            // IMPORTANT: This is a custom ADO field. If you don't have it, you can remove this if statement.
            if (entry[0].fields["Office.Common.SubStatus"] == "Local Fixed") {
                value += ` | color=green`;
            }

            console.log(value);
        });
    }
}

async function queryWorkItemsFromIds(ids) {
    const requestUrl = `https://dev.azure.com/${organization}/_apis/wit/workitemsbatch?api-version=6.1-preview.1`;

    // Reference: https://dev.azure.com/<ORG>/_apis/wit/workItems/<ID>
    const jsonBody = JSON.stringify(
        {
            "ids": ids,
            "fields": [
                "System.Id",
                "System.Title",
                "System.State",
                "System.CreatedDate",
                "System.ChangedDate",
                "System.TeamProject",

                // IMPORTANT: This is a custom ADO field. If you don't have it, you can remove this if statement.
                "Office.Common.SubStatus",
            ]
        });

    var result = await postRequest(requestUrl, jsonBody);
    var data = JSON.parse(result);

    return data;
}

async function queryAssignedToBugs() {
    const requestUrl = `https://dev.azure.com/${organization}/_apis/wit/wiql?api-version=5.1`;
    const jsonBody = JSON.stringify(
        {
            "query":"SELECT [System.Id] FROM WorkItems WHERE [System.WorkItemType] = 'Bug' AND [State] IN ('Active', 'New') and [Assigned To] = @me order by [System.ChangedDate] desc",
        });

    var result = await postRequest(requestUrl, jsonBody);

    var ids = [];
    var data = JSON.parse(result);
    data.workItems.forEach(element => {
        ids.push(element.id)});
    
    return ids;
}

async function postRequest(requestUrl, jsonBody) {
    const url = require('url');
    const parsedUrl = url.parse(requestUrl);

    const options = {
        'method': 'POST',
        'host': parsedUrl.host,
        'path': parsedUrl.path,
        'headers': {
            'Authorization': `Basic ${Buffer.from(`${username}:${pat}`).toString('base64')}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonBody),
            'Accept': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        var req = require('https').request(options, function(res) {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error("StatusCode: " + res.statusCode)); 
            }

            let responseData = '';
            res.on('data', chunk => { responseData += chunk });
            res.on('end', () => {
                try {
                    resolve(responseData);
                } catch (error) {
                    reject(error.message);
                }});
            });

        req.on('error', error => { reject(error); });

        if (jsonBody) {
            req.write(jsonBody);
        }

        req.end();
    });
}