
var fb = new Firebase("https://dazzling-torch-3393.firebaseio.com");

var app = angular.module("caseDataEditor", ["firebase"]);

app.controller("dataEditor", function($scope, $firebase, $document) {
  var caseDataRef = new Firebase("https://dazzling-torch-3393.firebaseio.com/CaseData");
  var queueRef = new Firebase("https://dazzling-torch-3393.firebaseio.com/AveroQueue");
  var caseDataSync = $firebase(caseDataRef);
  $scope.messages = caseDataSync.$asObject();
  $scope.caseToEdit = "";
  var queueSync = $firebase(queueRef);

  $scope.editCase = function() {
    $scope.editFields = $scope.messages[$scope.caseToEdit];
  };
  
  $scope.dxCodeEntry = function() {
    var x = document.querySelector("textarea#diagnosisTextArea")
    var startPos= x.selectionStart;
    var theText = x.value;
    var alertText = "";

    for(var j=startPos - 1; j>0; j--) {
      if(theText.charCodeAt(j)===10) {
        finishPos = j;
        break;
      }
    }
    var rawDXCode=theText.slice(finishPos,startPos);
    x.setSelectionRange(finishPos + 1,startPos);
    var lastCodeUsed = rawDXCode;

    if (rawDXCode.search(/[/]/)>0) { var useMicro = 1; } else { var useMicro=0; }
    if (rawDXCode.search(/[*]/)>0) { var useICD9 = 1; } else { var useICD9 = 0; }
    
    var dxCode = rawDXCode.slice(0, rawDXCode.length - useMicro - useICD9);
    var dxCodeSplitA = dxCode.split(";");
    var dxCodeSplitB = dxCodeSplitA[0].split(".");
    var dxCodeSplitC = dxCodeSplitB[0].split(":");
    var frontHelpers = dxCodeSplitC[0];
    var baseCode = dxCodeSplitC[1];
    var marginCode = dxCodeSplitB[1];
    var commentHelpers = dxCodeSplitA[1];

    //window.alert(commentHelpers);
  };

  $scope.gotoNextBlank = function() {
    var currentSelectionStart = document.getElementById("diagnosisTextArea").selectionStart;
    var input = document.getElementById("diagnosisTextArea");
    var n = $scope.editFields.diagnosisTextArea.search(/[*][*][*]/);
    input.focus();
    input.setSelectionRange(n, n+3);
  };

  $scope.loadFields = function() {
    var headerText = "";
    var site = "";
    var grossPhrase = "";

    for (key in $scope.editFields.jars) {
      if (!$scope.editFields.jars.hasOwnProperty(key)) { continue; }
      //Do your logic with the property here
        $scope.editFields.jars[key].site = toTitleCase($scope.editFields.jars[key].site);
        site = $scope.editFields.jars[key].site;
        grossPhrase = procedureTextFromGross($scope.editFields.jars[key].grossDescription);
        if(grossPhrase) {
          headerText += key + ") " + site + ", " + grossPhrase + ":\n***\n\n";
        } else {
          headerText += key + ") " + site + ":\n***\n\n";
        }
      }
    $scope.editFields.diagnosisTextArea = headerText;
    $scope.editFields.photoCaption = $scope.editFields.caseNumber + " A";
  };

  $scope.submitCase = function() {
    $scope.messages[$scope.caseToEdit] = $scope.editFields;
    $scope.messages.$save();
    $scope.submitMessage = "Submit " + $scope.caseToEdit + " succeeded";
    queueSync.$push({ "action":"writeCase", "caseNumber":$scope.caseToEdit, "doctor":"mmuenster"});
    $scope.editFields = {};
    $scope.caseToEdit = ""
    $document[ 0 ].getElementById("input_codeToEdit").focus();
  };
});

function procedureTextFromGross(gross) {
  var shavePos = gross.search(/(sb.)/) + gross.search(/ shave /) + 2;
  var punchPos = gross.search(/(pb.)/) + gross.search(/ punch /) + 2;
  var excisionPos = gross.search(/(ex.#)/) + gross.search(/ ellipt/) + 2;
  
  if(shavePos>0) { return "Shave Biopsy"; }
  else if(punchPos>0) {return "Punch Biopsy"; }
  else if(excisionPos>0) {return "Excision"; }
  //else if(nailPos>0) {return "Nail Clipping"; }
  return "";
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
