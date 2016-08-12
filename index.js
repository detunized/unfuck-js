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
let ast = parse(src);

function collect(root, predicate) {
    let nodes = [];
    let controller = new estraverse.Controller();

    // Using replace since traverse doesn't populate `ref`
    controller.replace(root, {
        enter: (node, parent) => {
            if (predicate(node, parent))
                nodes.push({ node, parent, ref: controller.__current.ref.key });
        }
    });

    return nodes;
}

function collectType(root, type) {
    return collect(root, node => node.type === type);
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

// Add curly braces to if/else's
_.forEach(collectType(ast, Js.IfStatement), x => {
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

let out = generate(ast);

p(out);
fs.writeFileSync("out.js", out, "utf-8");
