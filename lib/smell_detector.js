'use strict';

var SmellLocation = require('smell_location');

var SmellDetector = {

    // JSNose parameters for smell detection
    MAX_METHOD_LENGTH: 50,            // function/method length
    MAX_NUMBER_OF_PARAMETERS: 5,      // function parameter
    MAX_LENGTH_OF_PROTOTYPE: 3,       // prototype chain
    MAX_LENGTH_OF_MESSAGE_CHAIN: 3,   // message chain
    MAX_NUMBER_OF_SWITCHCASE: 3,      // switch
    MAX_LENGTH_OF_SCOPE_CHAIN: 3,     // closure
    BASE_CLASS_USAGE_RATIO: 0.33,  // refused bequest
    MIN_OBJECT_PROPERTIES: 3,          // lazy object
    MAX_OBJECT_PROPERTIES: 20,         // large object
    MAX_OBJECT_LOC: 750,              // large object

    ASTNode: null,

    jsObjects: [],
    jsFunctions: [],

    candidateObjectName: '',        // this will be set to name of any variable and if detected as object will be added to jsObjects
    nextNameIsProperty: false,     // this is to distinguish properties of an object from other var/names
    nextNameIsPrototype: false,    // this is to distinguish prototype of an object from other var/names
    nextNameIsObject: false,       // this is to distinguish properties from an object such as for x in x.prototype = y;

    callBackFound: false,

    _currentObjectNodeDepth: 0, // This is node.depth() for the current object. A property would be added if its node.depth() is higher than currentObjectNodeDepth
    _currentObjectIndex: 0,     // This is the index of current object in jsObjects list (used to add properties/prototype)
    _currentIdentifier: '',  // this is to keep the latest identifier as it may be detected as an object following the pattern x=Object.create
    _currentPrototype: '',   // this is to keep the prototype x found at Object.create(x)

    _consecutivePropertyGet: 0, // This is to store number of consecutive getting of property used to detect long message chain
    _lastMessageChain: 0,       // This is to store last message chain using consecutivePropertyGet
    _ignoreDepthChange: false,      // This is also used to decide for a.b.c pattern that c is a property of b not a separate identifier
    _longMessageFound: new SmellLocation(),  // keeping line number where a long message occurred

    _LHS: false,            // This is to decide if the ASTNode is at the left hand-side of an assignment
    _assignmentNodeDepth: 0,    // This is to store ASTNode depth of assignment to be used for detecting LHS value
    _assignmentLHSVisited: false,

    _catchClause: false,    // To detect empty Catch Clauses
    _emptyCatchFound: new SmellLocation(),   // keeping line number where an empty catch occurred
    _longMethodFound: new SmellLocation(),   // keeping line number where a long method is defined
    _longParameterListFound: new SmellLocation(),    // keeping line number where a long parameter list is found
    _switchFound: new SmellLocation(),   // keeping line number where a switch statement is found

    _lastFunctionDepth: 0,
    _scopeChainLength: 0,

    _closureSmellLocation: new SmellLocation(),  // keeping line number of the inner function of a deep closure
    _nestedCallBackFound: new SmellLocation(),   // keeping line number of the inner function of a deep closure

    _inlineJavaScriptLines: 0,   // keep the count of js code in <script> tags
    _inlineJavaScriptScopeName: {},   // keeping scope name (js file name) where inline JavaScript is detected
    _numberOfInTagJS1: 0,
    _jsInTagFound: {},            // keeping occurrences of unique js in html tags
    _CSSinJS: new SmellLocation(),   // keeping line number where CSS is used in JS

    _refusedBequestObjLocation: new SmellLocation(), // keeping objects which refuse bequests
    _lazyObjectsLocation: new SmellLocation(),   // keeping lazy objects
    _largeObjectsLocation: new SmellLocation(),  // keeping large objects
    _longPrototypeChainObjLocation: new SmellLocation(), // keeping objects with long prototype chain

    // list of objects to ignore in reporting large/lazy object and refused bequest
    _objectsToIgnore: [],

    _checkForUnreachable: false,
    _levelToCheckForReachability: 0;
    _unReachable: new SmellLocation(),   // keeping unreachable code line number

    /**
     * This list is for keeping name of candidate javascript objects found in the code
     * they are called candidate since some my not be actual objects
     */
    _candidateJSObjectList: [],

    _globals: {}, // keeping global variables

    _jsFileName: ''

};

SmellDetector.setGlobals = function (globals) {
    this._globals = globals;
};

SmellDetector.getcandidateJSObjectList = function () {
    return this._candidateJSObjectList;
};

SmellDetector.initialize = function () {
    this.ASTNode = null;
    // ignore these objects when reporting object-based smells
    this._objectsToIgnore.push("window");
    this._objectsToIgnore.push("document");
    this._objectsToIgnore.push("top");
    this._objectsToIgnore.push("navigator");
    this._objectsToIgnore.push("Math");
    this._objectsToIgnore.push("location");
    this._objectsToIgnore.push("InstallTrigger");
    this._objectsToIgnore.push("self");
    this._objectsToIgnore.push("parent");
    this._objectsToIgnore.push("history");
    this._objectsToIgnore.push("screen");
    this._objectsToIgnore.push("fxdriver_id");
    this._objectsToIgnore.push("__fxdriver_unwrapped");
    this._objectsToIgnore.push("jQuery");
    this._objectsToIgnore.push("$");
    this._objectsToIgnore.push("setInterval");
    this._objectsToIgnore.push("setTimeout");
};

SmellDetector.setASTNode = function (node) {
    this.ASTNode = node;
};

SmellDetector.setJSName = function (jsName) {
    this._jsFileName = jsName;
};

/**
 * Showing list of smells when all AST nodes were visited.
 * @param {boolean} writeToFile
 */
SmellDetector.generateReport = function (writeTofile) {
    console.log("***************************************");
    console.log("********** CODE SMELL REPORT **********");
    console.log("***************************************");

    this.analyseObjecsList();

    console.log("********** CLOSURE SMELL **********");
    this.reportSmell(this._closureSmellLocation);
};

/**
 * [reportSmell description]
 * @param  {SmellLocation} smell [description]
 * @return {string}       [description]
 */
SmellDetector.reportSmell = function (smell) {
    var report = '';
    console.log("Number of occurance: " + smell.size());
    report += "Number of occurance: " + smell.size() + "\n";
    /*
    for (SmellLocation l:smell){
        System.out.println("Item: " + l.getSmellyItemName() + " in JS file: " + l.getJsFile() +" at line number: " + l.getLineNumber());
        report += "Item: " + l.getSmellyItemName() + " in JS file: " + l.getJsFile() +" at line number: " + l.getLineNumber() + "\n";
    }
    */
    return report;
};

/**
 * Analysing jsObjects list to calculate used/unused inherited properties
 * The method is static to be used by printObject()
 */
SmellDetector.analyseObjectsList = function () {
    String prototype = "";

    //  usedInheritedPropetries = intersection of ownPropetries and inheritedPropetries
    //  usedInheritedPropetries = inheritedPropetries - ownPropetries
    var ownProperties = [];  // only own
    var usedProperties = []; // both own and inherited
    var inheritedProperties = [];        // ownPropetries of the prototype (if has one)
    var usedInheritedProperties = [];    // Inherited properties used or overwritten
    var notUsedInheritedProperties = []; // Inherited properties not used or overwritten

    var delegatedProperties = [];        // Delegated properties which are defined some where in the prototype chain
    var prototypeChain = [];             // Storing the prototype chain of an object

    var sl;

    this.jsObjects.forEach(function (jso) {
        console.info(jso);
    });

};

module.exports = SmellDetector;

