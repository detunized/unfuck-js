let _ = require("lodash");
let fs = require("fs");
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

function collectType(root, type) {
    return collect(root, node => node.type === type);
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
                    x.container[x.key] = {
                        type: Js.Literal,
                        value: true
                    };
                else if (a.value === 1) {
                    x.container[x.key] = {
                        type: Js.Literal,
                        value: false
                    }
                }
            }
        }
    });
}

addBraces(ast);
expandBooleans(ast);

let out = generate(ast);
p(out);
fs.writeFileSync("out.js", out, "utf-8");
