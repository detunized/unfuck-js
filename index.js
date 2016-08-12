let fs = require("fs");
let assert = require("assert");

let _ = require("lodash");
let parse = require("espree").parse;
let esutils = require("esutils");
let generate = require("escodegen").generate;
let estraverse = require("estraverse");

function p(x) {
    console.log(x);
    return x;
}

let Js = estraverse.Syntax;
let Ast = esutils.ast;

let src = fs.readFileSync("test.js", "utf-8");
let ast = parse(src, { ecmaVersion: 6 });

// Array
function replaceRange(array, index, length, newValues) {
    return Array.prototype.splice.apply(array, [index, length].concat(newValues));
}

function collect(root, predicate) {
    let nodes = [];
    let controller = new estraverse.Controller();

    // Using replace since traverse doesn't populate `ref`
    controller.replace(root, {
        enter: (node, parent) => {
            if (predicate(node, parent))
                nodes.push({
                    node,
                    parent,
                    container: controller.__current.ref.parent,
                    key: controller.__current.ref.key
                });
        }
    });

    return nodes;
}

function replace(nodeInfo, newNodes) {
    if (_.isArray(newNodes)) {
        if (isBlock(nodeInfo.parent)) {
            assert(_.isArray(nodeInfo.container));
            replaceRange(nodeInfo.container, nodeInfo.key, 1, newNodes);
        } else {
            p("Warning: Can't replace nodes in " + nodeInfo.parent.type);
        }
    } else {
        nodeInfo.container[nodeInfo.key] = newNodes;
    }
}

function collectType(root, type, predicate) {
    return collect(root, node => node.type === type && (!predicate || predicate(node)));
}

function collectTypes(root, types) {
    return collect(root, node => _.indexOf(types, node.type) !== -1);
}

function isBlock(node) {
    return node.type === Js.BlockStatement;
}

function wrapInBlock(node) {
    return {
        type: Js.BlockStatement,
        body: [node]
    };
}

function addBraces(root) {
    function handleIf() {
        _.forEach(collectType(root, Js.IfStatement), x => {
            let n = x.node;

            // Wrap if branch
            let c = n.consequent;
            if (!isBlock(c))
                n.consequent = wrapInBlock(c);

            // Wrap else branch, keep "else if"
            let a = n.alternate;
            if (a && !isBlock(a) && a.type !== Js.IfStatement)
                n.alternate = wrapInBlock(a);
        });
    }

    function handleLoops() {
        let loops = [
            Js.ForStatement,
            Js.ForInStatement,
            Js.ForOfStatement,
            Js.WhileStatement,
            Js.DoWhileStatement
        ];

        _.forEach(collectTypes(ast, loops), x => {
            let n = x.node;

            // Wrap body
            let b = n.body;
            if (!isBlock(b))
                n.body = wrapInBlock(b);
        });
    }

    handleIf();
    handleLoops();
}

function expandBooleans(root) {
    _.forEach(collectType(root, Js.UnaryExpression), x => {
        let n = x.node;

        if (n.operator === "!") {
            let a = n.argument;
            if (a.type === Js.Literal) {
                if (a.value === 0)
                    replace(x, {
                        type: Js.Literal,
                        value: true
                    });
                else if (a.value === 1) {
                    replace(x, {
                        type: Js.Literal,
                        value: false
                    });
                }
            }
        }
    });
}

function splitCommas(root) {
    _.forEach(collectType(root, Js.ExpressionStatement, x => x.expression.type == Js.SequenceExpression), x => {
        let statements = _.map(x.node.expression.expressions, x => ({
            type: Js.ExpressionStatement,
            expression: x
        }));
        replace(x, statements);
    });
}

addBraces(ast);
expandBooleans(ast);
splitCommas(ast);

let out = generate(ast);
p(out);
fs.writeFileSync("out.js", out, "utf-8");
