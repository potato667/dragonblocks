'use strict';

Blockly.Ruby['text'] = function(block) {
  var code = Blockly.Ruby.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Ruby.ORDER_ATOMIC];
};

Blockly.Ruby['text_multiline'] = function(block) {
  var code = Blockly.Ruby.multiline_quote_(block.getFieldValue('TEXT'));
  var order = code.indexOf('+') != -1 ? Blockly.Ruby.ORDER_CONCATENATION :
      Blockly.Ruby.ORDER_ATOMIC;
  return [code, order];
};

Blockly.Ruby['text_join'] = function(block) {
  if (block.itemCount_ == 0) {
    return ['\'\'', Blockly.Ruby.ORDER_ATOMIC];
  } else if (block.itemCount_ == 1) {
    var element = Blockly.Ruby.valueToCode(block, 'ADD0',
        Blockly.Ruby.ORDER_NONE) || '\'\'';
    var code = '(' + element + ').to_str';
    return [code, Blockly.Ruby.ORDER_HIGH];
  } else if (block.itemCount_ == 2) {
    var element0 = Blockly.Ruby.valueToCode(block, 'ADD0',
        Blockly.Ruby.ORDER_CONCATENATION) || '\'\'';
    var element1 = Blockly.Ruby.valueToCode(block, 'ADD1',
        Blockly.Ruby.ORDER_CONCATENATION) || '\'\'';
    var code = element0 + ' + ' + element1;
    return [code, Blockly.Ruby.ORDER_CONCATENATION];
  } else {
    var elements = [];
    for (var i = 0; i < block.itemCount_; i++) {
      elements[i] = Blockly.Ruby.valueToCode(block, 'ADD' + i,
          Blockly.Ruby.ORDER_NONE) || '\'\'';
    }
    var code = '[' + elements.join(', ') + '].join(\", \")';
    return [code, Blockly.Ruby.ORDER_HIGH];
  }
};

Blockly.Ruby['text_append'] = function(block) {
  var varName = Blockly.Ruby.nameDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  var value = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_CONCATENATION) || '\'\'';
  return varName + ' += ' + value + '\n';
};

Blockly.Ruby['text_length'] = function(block) {
  var text = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_UNARY) || '\'\'';
  return [ text + ".length", Blockly.Ruby.ORDER_UNARY];
};

Blockly.Ruby['text_isEmpty'] = function(block) {
  var text = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_UNARY) || '\'\'';
  return [ text + '.empty?', Blockly.Ruby.ORDER_RELATIONAL];
};

Blockly.Ruby['text_indexOf'] = function(block) {
  var substring = Blockly.Ruby.valueToCode(block, 'FIND',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var text = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  if (block.getFieldValue('END') == 'FIRST') {
    return ["(" + text + ").index(" + substring + ").to_i", Blockly.Ruby.ORDER_HIGH];
  } else {
    return ["(" + text + ").rindex(" + substring + ").to_i", Blockly.Ruby.ORDER_HIGH];
  }
};

Blockly.Ruby['text_charAt'] = function(block) {
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var atOrder = (where == 'FROM_END') ? Blockly.Ruby.ORDER_UNARY :
      Blockly.Ruby.ORDER_NONE;
  var at = Blockly.Ruby.valueToCode(block, 'AT', atOrder) || '1';
  var text = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var code;
  if (where == 'RANDOM') {
    code = '(' + text + ').chars.sample';
  } else {
    if (where == 'FIRST') {
      var start = '0';
    } else if (where == 'LAST') {
      var start = '-1';
    } else {
      if (where == 'FROM_START') {
        var start = at;
      } else if (where == 'FROM_END') {
        var start = '-' + at;
      } else {
        throw Error('Unhandled option (text_charAt).');
      }
    }
    if (start.match(/^-?\w*$/)) {
      code = text + '[' + start + ']';
    } else {
      code = '(' + text + ')[' + start + ']';
    }
  }
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['text_getSubstring'] = function(block) {
  var text = Blockly.Ruby.valueToCode(block, 'STRING',
      Blockly.Ruby.ORDER_NONE) || '\'\'';

  var where1 = block.getFieldValue('WHERE1');
  var at1Order = (where1 == 'FROM_END') ? Blockly.Ruby.ORDER_UNARY :
      Blockly.Ruby.ORDER_NONE;
  var at1 = Blockly.Ruby.valueToCode(block, 'AT1', at1Order) || '0';
  if (where1 == 'FIRST') {
    var start = 0;
  } else if (where1 == 'FROM_START') {
    var start = at1;
  } else if (where1 == 'FROM_END') {
    var start = '-' + at1;
  } else {
    throw Error('Unhandled option (text_getSubstring)');
  }

  var where2 = block.getFieldValue('WHERE2');
  var at2Order = (where2 == 'FROM_END') ? Blockly.Ruby.ORDER_UNARY :
      Blockly.Ruby.ORDER_NONE;
  var at2 = Blockly.Ruby.valueToCode(block, 'AT2', at2Order) || '0';
  if (where2 == 'LAST') {
    var end = -1;
  } else if (where2 == 'FROM_START') {
    var end = at2;
  } else if (where2 == 'FROM_END') {
    var end = '-' + at2;
  } else {
    throw Error('Unhandled option (text_getSubstring)');
  }
  var code = text + '[' + start + '..' + end + ']';
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['text_changeCase'] = function(block) {
  var operator = block.getFieldValue('CASE');
  var text = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  if (operator == 'UPPERCASE') {
    var functionName = '.upcase';
  } else if (operator == 'LOWERCASE') {
    var functionName = '.downcase';
  } else if (operator == 'TITLECASE') {
    var functionName = Blockly.Ruby.provideFunction_(
        'text_titlecase',
        ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(str)',
         '  buf = []',
         '  inWord = false',
         '  str.length.times.map do |i|',
         '    c = str[i]',
         '    if inWord',
         '      buf.push(c.downcase)',
         '      if c.include?(" ") then',
         '        inWord = false',
         '      end',
         '    else',
         '      buf.push(c.upcase)',
         '      inWord = true',
         '    end',
         '  end',
         '  return buf.join',
         'end']);
  }
  var code = '(' + text + ')' + functionName;
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['text_trim'] = function(block) {
  var OPERATORS = {
    LEFT: '^%s*(,-)',
    RIGHT: '(.-)%s*$',
    BOTH: '^%s*(.-)%s*$'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var text = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var code = text + '.gsub("' + operator + '", "%1")';
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['text_print'] = function(block) {
  var msg = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  return 'puts(' + msg + ')\n';
};

Blockly.Ruby['text_prompt_ext'] = function(block) {
  if (block.getField('TEXT')) {
    var msg = Blockly.Ruby.quote_(block.getFieldValue('TEXT'));
  } else {
    var msg = Blockly.Ruby.valueToCode(block, 'TEXT',
        Blockly.Ruby.ORDER_NONE) || '\'\'';
  }

  var functionName = Blockly.Ruby.provideFunction_(
      'text_prompt',
      ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(msg)',
       '  STDOUT.write(msg)',
       '  STDOUT.flush',
       '  return gets.chomps',
       'end']);
  var code = functionName + '(' + msg + ')';

  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = '(' + code + ').to_i(10)';
  }
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['text_prompt'] = Blockly.Ruby['text_prompt_ext'];

Blockly.Ruby['text_count'] = function(block) {
  var text = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var sub = Blockly.Ruby.valueToCode(block, 'SUB',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var functionName = Blockly.Ruby.provideFunction_(
      'text_count',
      ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_
        + '(haystack, needle)',
        '  # Source: https://stackoverflow.com/a/25938828/10896648',
        '  return haystack.each_char.each_cons(needle.length).map(&:join).count(needle)',
        'end',
      ]);
  var code = functionName + '(' + text + ', ' + sub + ')';
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['text_replace'] = function(block) {
  var text = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var from = Blockly.Ruby.valueToCode(block, 'FROM',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var to = Blockly.Ruby.valueToCode(block, 'TO',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var code = '(' + text + ').gsub(' + from + ', ' + to + ')';
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['text_reverse'] = function(block) {
  var text = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var code = text + '.reverse';
  return [code, Blockly.Ruby.ORDER_HIGH];
};
