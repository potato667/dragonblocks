'use strict';

Blockly.Ruby['lists_create_empty'] = function(block) {
  return ['[]', Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['lists_create_with'] = function(block) {
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.Ruby.valueToCode(block, 'ADD' + i,
        Blockly.Ruby.ORDER_NONE) || 'None';
  }
  var code = '[' + elements.join(', ') + ']';
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['lists_repeat'] = function(block) {
  var element = Blockly.Ruby.valueToCode(block, 'ITEM',
      Blockly.Ruby.ORDER_NONE) || 'None';
  var repeatCount = Blockly.Ruby.valueToCode(block, 'NUM',
      Blockly.Ruby.ORDER_NONE) || '0';
  return ["(" + repeatCount + ").map {" + element + "}", Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['lists_length'] = function(block) {
  var list = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_UNARY) || '[]';
  return [list + ".length", Blockly.Ruby.ORDER_UNARY];
};

Blockly.Ruby['lists_isEmpty'] = function(block) {
  var list = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_UNARY) || '[]';
  var code = list + '.empty?';
  return [code, Blockly.Ruby.ORDER_RELATIONAL];
};

Blockly.Ruby['lists_indexOf'] = function(block) {
  var item = Blockly.Ruby.valueToCode(block, 'FIND',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var list = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_NONE) || '[]';
  if (block.getFieldValue('END') == 'FIRST') {
    return [list + ".index(" + item + ").to_i", Blockly.Ruby.ORDER_HIGH];
  } else {
    return [list + ".rindex(" + item + ").to_i", Blockly.Ruby.ORDER_HIGH];
  }
};

Blockly.Ruby.lists = {};
Blockly.Ruby.lists.getIndex_ = function(listName, where, opt_at) {
  if (where == 'FIRST') {
    return '0';
  } else if (where == 'FROM_END') {
    return '-' + opt_at;
  } else if (where == 'LAST') {
    return "-1";
  } else if (where == 'RANDOM') {
    return 'rand(' + listName + '.length)';
  } else {
    return opt_at;
  }
};

Blockly.Ruby['lists_getIndex'] = function(block) {
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var list = Blockly.Ruby.valueToCode(block, 'VALUE', Blockly.Ruby.ORDER_HIGH) ||
      '[]';
  var getIndex_ = Blockly.Ruby.lists.getIndex_;

  if ((where == 'LAST' || where == 'FROM_END' || where == 'RANDOM') &&
      !list.match(/^\w+$/)) {
    if (mode == 'REMOVE') {
      var atOrder = (where == 'FROM_END') ? Blockly.Ruby.ORDER_ADDITIVE :
          Blockly.Ruby.ORDER_NONE;
      var at = Blockly.Ruby.valueToCode(block, 'AT', atOrder) || '0';
      var listVar = Blockly.Ruby.nameDB_.getDistinctName(
          'tmp_list', Blockly.VARIABLE_CATEGORY_NAME);
      at = getIndex_(listVar, where, at);
      var code = listVar + ' = ' + list + '\n' +
          listVar + '.delete_at(' + at + ')\n';
      return code;
    } else {
      var at = Blockly.Ruby.valueToCode(block, 'AT', Blockly.Ruby.ORDER_NONE) ||
          '1';
      if (mode == 'GET') {
        var functionName = Blockly.Ruby.provideFunction_(
            'list_get_' + where.toLowerCase(),
            ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(t' +
                ((where == 'FROM_END' || where == 'FROM_START') ?
                    ', at)' : ')'),
             '  return t[' + getIndex_('t', where, 'at') + ']',
             'end']);
      } else {
        var functionName = Blockly.Ruby.provideFunction_(
            'list_remove_' + where.toLowerCase(),
            ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(t' +
                ((where == 'FROM_END' || where == 'FROM_START') ?
                    ', at)' : ')'),
             '  return t.delete_at(' + getIndex_('t', where, 'at') + ')',
             'end']);
      }
      var code = functionName + '(' + list +
          ((where == 'FROM_END' || where == 'FROM_START') ? ', ' + at : '') +
          ')';
      return [code, Blockly.Ruby.ORDER_HIGH];
    }
  } else {
    var atOrder = (mode == 'GET' && where == 'FROM_END') ?
        Blockly.Ruby.ORDER_ADDITIVE : Blockly.Ruby.ORDER_NONE;
    var at = Blockly.Ruby.valueToCode(block, 'AT', atOrder) || '0';
    at = getIndex_(list, where, at);
    if (mode == 'GET') {
      var code = list + '[' + at + ']';
      return [code, Blockly.Ruby.ORDER_HIGH];
    } else {
      var code = list + '.delete_at(' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Ruby.ORDER_HIGH];
      } else {
        return code + '\n';
      }
    }
  }
};

Blockly.Ruby['lists_setIndex'] = function(block) {
  var list = Blockly.Ruby.valueToCode(block, 'LIST',
      Blockly.Ruby.ORDER_HIGH) || '[]';
  var mode = block.getFieldValue('MODE') || 'SET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Ruby.valueToCode(block, 'AT',
      Blockly.Ruby.ORDER_ADDITIVE) || '0';
  var value = Blockly.Ruby.valueToCode(block, 'TO',
      Blockly.Ruby.ORDER_NONE) || 'None';
  var getIndex_ = Blockly.Ruby.lists.getIndex_;

  var code = '';
  if ((where == 'LAST' || where == 'FROM_END' || where == 'RANDOM') &&
      !list.match(/^\w+$/)) {
    var listVar = Blockly.Ruby.nameDB_.getDistinctName(
        'tmp_list', Blockly.VARIABLE_CATEGORY_NAME);
    code = listVar + ' = ' + list + '\n';
    list = listVar;
  }
  if (mode == 'SET') {
    code += list + '[' + getIndex_(list, where, at) + '] = ' + value;
  } else {
    code += list + '[' +
        (getIndex_(list, where, at) + (where == 'LAST' ? ' + 1' : '')) +
        '] = ' + value;
  }
  return code + '\n';
};

Blockly.Ruby['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.Ruby.valueToCode(block, 'LIST',
      Blockly.Ruby.ORDER_NONE) || '[]';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.Ruby.valueToCode(block, 'AT1',
      Blockly.Ruby.ORDER_NONE) || '0';
  var at2 = Blockly.Ruby.valueToCode(block, 'AT2',
      Blockly.Ruby.ORDER_NONE) || '0';
  var getIndex_ = Blockly.Ruby.lists.getIndex_;

  var functionName = Blockly.Ruby.provideFunction_(
      'list_sublist_' + where1.toLowerCase() + '_' + where2.toLowerCase(),
      ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(source' +
          ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', at1' : '') +
          ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', at2' : '') +
          ')',
       '  start = ' + getIndex_('source', where1, 'at1'),
       '  finish = ' + getIndex_('source', where2, 'at2'),
       '  return source[start..finish]',
       'end']);
  var code = functionName + '(' + list +
      ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', ' + at1 : '') +
      ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', ' + at2 : '') +
      ')';
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['lists_sort'] = function(block) {
  var list = Blockly.Ruby.valueToCode(
      block, 'LIST', Blockly.Ruby.ORDER_NONE) || '[]';
  var direction = block.getFieldValue('DIRECTION') === '0' ? 1 : -1;
  var type = block.getFieldValue('TYPE');

  var functionName = Blockly.Ruby.provideFunction_(
      'list_sort',
      ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ +
          '(list, typev, direction)',
       '  arr = list',
       '  compareFuncs = {',
       '    NUMERIC: ->(a, b) do',
       '      ((a.to_s).to_f or 0)',
       '          < ((b.to_s).to_f or 0) end,',
       '    TEXT: ->(a, b) do',
       '      a.to_s < b.to_s end,',
       '    IGNORE_CASE: ->(a, b) do',
       '      a.to_s.downcase < b.to_s.downcase end',
       '  }',
       '  compareTemp = compareFuncs[typev.to_sym]',
       '  compare = compareTemp',
       '  if direction == -1',
       '    compare = ->(a, b) do return compareTemp(b, a) end',
       '  end',
       '  arr.sort { |a, b| compare.call(a, b) }',
       '  return arr',
       'end']);

  var code = functionName +
      '(' + list + ',"' + type + '", ' + direction + ')';
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['lists_split'] = function(block) {
  var input = Blockly.Ruby.valueToCode(block, 'INPUT',
      Blockly.Ruby.ORDER_NONE);
  var delimiter = Blockly.Ruby.valueToCode(block, 'DELIM',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var mode = block.getFieldValue('MODE');
  var functionName;
  if (mode == 'SPLIT') {
    if (!input) {
      input = '\'\'';
    }
    return [input + '.split(' + delimiter + ')', Blockly.Ruby.ORDER_HIGH];
  } else if (mode == 'JOIN') {
    if (!input) {
      input = '[]';
    }
  } else {
    throw Error('Unknown mode: ' + mode);
  }
  var code = input + '.join(' + delimiter + ')';
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['lists_reverse'] = function(block) {
  var list = Blockly.Ruby.valueToCode(block, 'LIST',
      Blockly.Ruby.ORDER_NONE) || '[]';
  var code = '(' + list + ').reverse';
  return [code, Blockly.Ruby.ORDER_HIGH];
};
