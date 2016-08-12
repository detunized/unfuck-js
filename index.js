// Copyright (C) 2016 Dmitry Yakimenko (detunized@gmail.com).
// Licensed under the terms of the MIT license. See LICENCE for details.

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

function applyReplacements(replacements) {
    let byContainer = new Map();
    replacements.forEach(x => {
        let c = x.what.container;
        if (byContainer.has(c))
            byContainer.get(c).push(x);
        else
            byContainer.set(c, [x]);
    });

    byContainer.forEach((r, c) => {
        if (_.isArray(c)) {
            r = _.sortBy(r, x => x.what.key);

            let offset = 0;
            for (let i of r) {
                replaceRange(c, i.what.key + offset, 1, i.with);
                offset += i.with.length - 1;
            }
        } else {
            assert(!_.isArray(r.with));
            c[r.what.key] = r.with;
        }
    });
}

function collectType(root, type, predicate) {
    return collect(root, node => node.type === type && (!predicate || predicate(node)));
}

function collectTypes(root, types, predicate) {
    return collect(root, node => _.indexOf(types, node.type) !== -1 && (!predicate || predicate(node)));
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
        collectType(root, Js.IfStatement).forEach(x => {
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

        collectTypes(ast, loops).forEach(x => {
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
    collectType(root, Js.UnaryExpression).forEach(x => {
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
    let commas = collectType(
        root,
        Js.ExpressionStatement,
        x => x.expression.type == Js.SequenceExpression
    );

    let replacements = [];
    commas.forEach(x => {
        let statements = x.node.expression.expressions.map(x => ({
            type: Js.ExpressionStatement,
            expression: x
        }));

        replacements.push({
            what: x,
            with: statements
        });
    });

    applyReplacements(replacements);
}

function splitCommasInReturnsAndThrows(root) {
    let returns = collectTypes(
        root, [Js.ReturnStatement, Js.ThrowStatement],
        x => x.argument && x.argument.type === Js.SequenceExpression
    );

    let replacements = [];
    returns.forEach(x => {
        let statements = x.node.argument.expressions.map(x => ({
            type: Js.ExpressionStatement,
            expression: x
        }));

        let last = statements.pop();
        statements.push({
            type: x.node.type,
            argument: last.expression
        });

        replacements.push({
            what: x,
            with: statements
        });
    });

    applyReplacements(replacements);
}

//
// main
//

let src = fs.readFileSync("test.js", "utf-8");
let ast = parse(src, { ecmaVersion: 6 });

addBraces(ast);
expandBooleans(ast);
splitCommas(ast);
splitCommasInReturnsAndThrows(ast);

let out = generate(ast);
fs.writeFileSync("out.js", out, "utf-8");
