/**
 * @fileoverview Helper functions for generating Ruby for blocks.
 * @author Rabia Alhaffar (steria773@gmail.com)
 */
'use strict';

Blockly.Ruby = new Blockly.Generator('Ruby');

Blockly.Ruby.addReservedWords(
  "alias,and,BEGIN,begin,break,case,class,def,defined?,do,else,elsif,END,end,ensure," +
  "false,for,if,module,next,nil,not,or,redo,rescue,retry,return,self,super,then,true,undef,unless," +
  "until,when,while,yield,__FILE__,__LINE__,__ENCODING__"
);

Blockly.Ruby.ORDER_ATOMIC = 0;          // literals
Blockly.Ruby.ORDER_HIGH = 1;            // Function calls, Arrays
Blockly.Ruby.ORDER_EXPONENTIATION = 2;  // **
Blockly.Ruby.ORDER_UNARY = 3;           // ! - ~
Blockly.Ruby.ORDER_MULTIPLICATIVE = 4;  // * / %
Blockly.Ruby.ORDER_ADDITIVE = 5;        // + -
Blockly.Ruby.ORDER_CONCATENATION = 6;   // #{}
Blockly.Ruby.ORDER_RELATIONAL = 7;      // < > <=  >= != ==
Blockly.Ruby.ORDER_AND = 8;             // &&
Blockly.Ruby.ORDER_OR = 9;              // ||
Blockly.Ruby.ORDER_NONE = 99;

Blockly.Ruby.isInitialized = false;

Blockly.Ruby.init = function(workspace) {
  Object.getPrototypeOf(this).init.call(this);

  if (!this.nameDB_) {
    this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
  } else {
    this.nameDB_.reset();
  }
  this.nameDB_.setVariableMap(workspace.getVariableMap());
  this.nameDB_.populateVariables(workspace);
  this.nameDB_.populateProcedures(workspace);

  this.isInitialized = true;
};

Blockly.Ruby.finish = function(code) {
  var definitions = Blockly.utils.object.values(this.definitions_);
  code = Object.getPrototypeOf(this).finish.call(this, code);
  this.isInitialized = false;

  this.nameDB_.reset();
  return definitions.join('\n\n') + '\n\n\n' + code;
};

Blockly.Ruby.scrubNakedValue = function(line) {};

Blockly.Ruby.quote_ = function(string) {
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/'/g, '\\\'');
  return "\"" + string + "\"";
};

Blockly.Ruby.multiline_quote_ = function(string) {
  var lines = string.split(/\n/g).map(this.quote_);
  return lines.join('#{\'\\n\'}\n');
};

Blockly.Ruby.scrub_ = function(block, code, opt_thisOnly) {
  var commentCode = '';
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    var comment = block.getCommentText();
    if (comment) {
      comment = Blockly.utils.string.wrap(comment, this.COMMENT_WRAP - 3);
      commentCode += this.prefixLines(comment, '# ') + '\n';
    }
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.inputTypes.VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = this.allNestedComments(childBlock);
          if (comment) {
            commentCode += this.prefixLines(comment, '# ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = opt_thisOnly ? '' : this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};
