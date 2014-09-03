/*
Copyright (C) 2014 by Lotech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
(function (w) {
    if (w.jT4) return; /* already exists */

    function jT4Block(type, text) { this.type = type; this.text = text; };
    jT4Block.prototype.type = 0;
    jT4Block.prototype.text = '';

    /* Block types */
    jT4Block.Text = 'Text';
    jT4Block.Expression = 'Expression';
    jT4Block.Statement = 'Statement';
    jT4Block.Extension = 'Extension';

    function jT4Lexer() { };

    jT4Lexer.prototype.regex = /\<\#([\+=]?)([\w\W]*?)\#\>/igm;

    jT4Lexer.prototype.parse = function (template) {
        var match = this.regex.exec(template);
        var blocks = [], index = 0, trimStart = false;
        while (match) {
            var block = new jT4Block();
            block.text = match[2].replace(/ +$/mg, '');
            if (index < match.index) {
                blocks.push(new jT4Block(jT4Block.Text, template.substr(index, match.index - index)));
            }
            trimStart = true;
            switch (match[1]) {
                case "+":
                    block.type = jT4Block.Extension;
                    break;
                case "=":
                    trimStart = false;
                    block.type = jT4Block.Expression;
                    break;
                default:
                    block.type = jT4Block.Statement;
            }
            
            if(trimStart && blocks.length){
                var t = blocks[blocks.length - 1];
                if(!(t.text = t.text.replace(/^\s*$/, ''))){
                    blocks.pop(); // remove empty text block
                }
            }
            
            blocks.push(block);
            index = match.index + match[0].length;
            match = this.regex.exec(template);
        }
        if (index < template.length) {
            blocks.push(new jT4Block(jT4Block.Text, template.substr(index, template.length - index)));
        }

        return blocks;
    }

    function jT4Compiler() { }

    jT4Compiler.prototype.encodeString = function (str) {
        return str == undefined || str == null ? str
            : str.replace(/\r/ig, '\\r').replace(/\n/ig, '\\n').replace(/"/ig, '\\"');
    };

    jT4Compiler.prototype.varIndex = 0;

    jT4Compiler.prototype.compile = function (blocks) {
        var statements = [];
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i].type == jT4Block.Extension) {
                statements.push(blocks[i].text);
            }
        }
        
        var resultVarName = '$' + (new Date().toString()).replace(/\D/ig, '_') + '_' + this.varIndex++;
        statements.push('var ' + resultVarName + ' = "";');
        
        
        statements.push('function write(s){ ' + resultVarName + ' += s; };');
        statements.push('function writeLine(s){ ' + resultVarName + ' += s + "\\r\\n"; };');

        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i].type == jT4Block.Expression) {
                statements.push(resultVarName + ' += ' + blocks[i].text + ';\n');
            } else if (blocks[i].type == jT4Block.Text) {
                statements.push(resultVarName + ' += "' + this.encodeString(blocks[i].text) + '";\n');
            } else if (blocks[i].type == jT4Block.Statement) {
                statements.push(blocks[i].text + '\n');
            }
        }
        
        statements.push('return ' + resultVarName + ';');
        if (w.console && console.log) {
            console.log('function(){\n  with(this){\n' + statements.join('\n') + '\n  }\n}');
        }
        return new Function('with(this){' + statements.join('\n') + '}');
    }

    function jT4() { };

    jT4.prototype.lexer = new jT4Lexer();
    jT4.prototype.compiler = new jT4Compiler();
    jT4.prototype.compiledTemplates = {};
    jT4.prototype.compile = function (template) {
        var callback = this.compiledTemplates[template];
        if (!callback) {
            var blocks = this.lexer.parse(template);
            callback = this.compiledTemplates[template] = this.compiler.compile(blocks);
        }
        return function (_) { return callback.call(_); }
    }

    w.jT4 = new jT4();
})(window);
