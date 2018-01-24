// Client ID and API key from the Developer Console

var CLIENT_ID = '247978667609-u1q4evsj8gluf1s6qk19cg3m7lqjatrt.apps.googleusercontent.com';

if (location.hostname === "localhost" || location.hostname === "127.0.0.1"){
  var CLIENT_ID = '247978667609-1jmo5s3v9i72fg9ffi2n5nev206b59o8.apps.googleusercontent.com';
}

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    getRanges();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function getRanges() {
  if(window.location.hash){
    console.log(window.location.hash)
    var spreadsheetId = window.location.hash.replace("#","");
  }else {
    var spreadsheetId = prompt("Please enter your spreadsheetId", "none");
    window.location.hash = "#"+spreadsheetId;
  }

  $('.sheetlink')
    .attr('href','https://docs.google.com/spreadsheets/d/'+spreadsheetId)
    .removeClass('hidden');

  gapi.client.sheets.spreadsheets.values.batchGet({
    spreadsheetId: spreadsheetId,
    majorDimension: 'ROWS',
    ranges: ['data!A:E'],
  }).then(function(response) {
    var csvs = _.map(response.result.valueRanges, function(range){

      var headings = range.values[0];
      range = _.map(range.values, function(line){

        var lineObj = {};
        _.forEach(headings,function(heading, col){
          lineObj[heading] = line[col];
        })

        return lineObj
      }).slice(1)

      return Papa.unparse(range);
    })

    onCsv(csvs);
  }, function(response) {
    appendPre('Error: ' + response.result.error.message);
  });
}
