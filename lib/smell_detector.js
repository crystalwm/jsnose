'use strict';

var levels = {
        FUNCTION: 'function',
        FILE: 'file',
        CODE_BLOCK: 'code block',
        OBJECT: 'object'
    },
    metrics = {
        LSC: 'Length of scope chain',
        JSC: 'JavaScript coupling instance',
        LOC: 'Lines of code',
        GLB: 'Number of global variables',
        NOP: 'Number of properties',
        LMC: 'Lengh of message chain',
        MLOC: 'Method lines of code',
        PAR: 'Number of parameters',
        CBD: 'Callback depth',
        BUR: 'Base-object usage ratio',
        NOC: 'Number of cases',
        EXEC: 'Execution count',
        RCH: 'Reachability of code'
    },
    reporter = Object.keys(metrics).reduce(function (agg, metric) {
        agg[metric] = 0;
        return agg;
    }, {}),
    smells = {
        'closureSmell': {
            level: levels.FUNCTION,
            detectionMethod: ['static', 'dynamic'],
            detectionCriteria: function () {
                return LSC > 3;
            }
        }/*,

        'couplingJSHTMLCSS': {
            level: levels.FILE,
            detectionMethod: ['static', 'dynamic'],
            detectionCriteria: function () {
                return JSC > 1;
            }
        },

        'emptyCatch': {
            level: levels.CODE_BLOCK,
            detectionMethod: ['static'],
            detectionCriteria: function () {
                return LOC === 0;
            }
        },

        'excessiveGlobalVariables': {
            level: levels.CODE_BLOCK,
            detectionMethod: ['static', 'dynamic'],
            detectionCriteria: function () {
                return GLB > 10;
            }
        },

        'largeObject': {
            level: levels.OBJECT,
            detectionMethod: ['static', 'dynamic'],
            detectionCriteria: function () {
                return LOC > 750 || NOP > 20;
            }
        },

        'lazyObject': {
            level: levels.OBJECT,
            detectionMethod: ['static', 'dynamic'],
            detectionCriteria: function () {
                return NOP < 3;
            }
        },

        'longMessageChain': {
            level: levels.CODE_BLOCK,
            detectionMethod: ['static'],
            detectionCriteria: function () {
                return LMC > 3;
            }
        },

        'longMethodFunction': {
            level: levels.FUNCTION,
            detectionMethod: ['static', 'dynamic'],
            detectionCriteria: function () {
                return MLOC > 50;
            }
        },

        'longParameterList': {
            level: levels.FUNCTION,
            detectionMethod: ['static', 'dynamic'],
            detectionCriteria: function () {
                return PAR > 5;
            }
        },

        'nestedCallback': {
            level: levels.FUNCTION,
            detectionMethod: ['static', 'dynamic'],
            detectionCriteria: function () {
                return CBD > 5;
            }
        },

        'refusedBequest': {
            level: levels.OBJECT,
            detectionMethod: ['static', 'dynamic'],
            detectionCriteria: function () {
                return BUR < (1/3) && NOP > 2;
            }
        },

        'switchStatement': {
            level: levels.CODE_BLOCK,
            detectionMethod: ['static'],
            detectionCriteria: function () {
                return NOC > 3;
            }
        },

        'unusedDeadCode': {
            level: levels.CODE_BLOCK,
            detectionMethod: ['static', 'dynamic'],
            detectionCriteria: function () {
                return EXEC === 0 || RCH === 0;
            }
        }
        */
    };


module.exports = {
    levels: levels,
    metrics: metrics,
    smells: smells,
    reporter: reporter
};


