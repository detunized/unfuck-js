let fs = require("fs");
let parse = require("espree").parse;
let generate = require("escodegen").generate;

function p(x) {
    console.log(x);
    return x;
}

let src = fs.readFileSync("test.js", "utf-8");
let ast = p(parse(src));
p(generate(ast));
