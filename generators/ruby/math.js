'use strict';

Blockly.Ruby['math_number'] = function(block) {
  var code = Number(block.getFieldValue('NUM'));
  var order = code < 0 ? Blockly.Ruby.ORDER_UNARY :
              Blockly.Ruby.ORDER_ATOMIC;
  return [code, order];
};

Blockly.Ruby['math_arithmetic'] = function(block) {
  var OPERATORS = {
    ADD: [' + ', Blockly.Ruby.ORDER_ADDITIVE],
    MINUS: [' - ', Blockly.Ruby.ORDER_ADDITIVE],
    MULTIPLY: [' * ', Blockly.Ruby.ORDER_MULTIPLICATIVE],
    DIVIDE: [' / ', Blockly.Ruby.ORDER_MULTIPLICATIVE],
    POWER: [' ** ', Blockly.Ruby.ORDER_EXPONENTIATION]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Ruby.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Ruby.valueToCode(block, 'B', order) || '0';
  var code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.Ruby['math_single'] = function(block) {
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    arg = Blockly.Ruby.valueToCode(block, 'NUM',
        Blockly.Ruby.ORDER_UNARY) || '0';
    return ['-' + arg, Blockly.Ruby.ORDER_UNARY];
  }
  if (operator == 'POW10') {
    arg = Blockly.Ruby.valueToCode(block, 'NUM',
        Blockly.Ruby.ORDER_EXPONENTIATION) || '0';
    return ['10 ** ' + arg, Blockly.Ruby.ORDER_EXPONENTIATION];
  }
  if (operator == 'ROUND') {
    arg = Blockly.Ruby.valueToCode(block, 'NUM',
        Blockly.Ruby.ORDER_ADDITIVE) || '0';
  } else {
    arg = Blockly.Ruby.valueToCode(block, 'NUM',
        Blockly.Ruby.ORDER_NONE) || '0';
  }
  switch (operator) {
    case 'ABS':
      code = '(' + arg + ').abs';
      break;
    case 'ROOT':
      code = 'Math.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'Math.log(' + arg + ')';
      break;
    case 'LOG10':
      code = 'Math.log10(' + arg + ')';
      break;
    case 'EXP':
      code = 'Math.exp(' + arg + ')';
      break;
    case 'ROUND':
      code = '(' + arg + ' + 0.5).floor';
      break;
    case 'ROUNDUP':
      code = '(' + arg + ').ceil';
      break;
    case 'ROUNDDOWN':
      code = '(' + arg + ').floor';
      break;
    case 'SIN':
      code = 'Math.sin((' + arg + ') * 180 / Math::PI)';
      break;
    case 'COS':
      code = 'Math.cos((' + arg + ') * 180 / Math::PI)';
      break;
    case 'TAN':
      code = 'Math.tan((' + arg + ') * 180 / Math::PI)';
      break;
    case 'ASIN':
      code = 'Math.asin(' + arg + ')) * 180 / Math::PI';
      break;
    case 'ACOS':
      code = 'Math.acos(' + arg + ')) * 180 / Math::PI';
      break;
    case 'ATAN':
      code = 'Math.atan(' + arg + ')) * 180 / Math::PI';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['math_constant'] = function(block) {
  var CONSTANTS = {
    PI: ['Math::PI', Blockly.Ruby.ORDER_HIGH],
    E: ['Math.exp(1)', Blockly.Ruby.ORDER_HIGH],
    GOLDEN_RATIO: ['(1 + Math.sqrt(5)) / 2', Blockly.Ruby.ORDER_MULTIPLICATIVE],
    SQRT2: ['Math.sqrt(2)', Blockly.Ruby.ORDER_HIGH],
    SQRT1_2: ['Math.sqrt(1 / 2)', Blockly.Ruby.ORDER_HIGH],
    INFINITY: ['Float::INFINITY', Blockly.Ruby.ORDER_HIGH]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.Ruby['math_number_property'] = function(block) {
  var number_to_check = Blockly.Ruby.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.Ruby.ORDER_MULTIPLICATIVE) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    var functionName = Blockly.Ruby.provideFunction_(
        'math_isPrime',
        ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(num)',
         '  (2..(num - 1)).each do |n|',
         '    return false if num % n == 0',
         '  end',
         '  return true',
         'end']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.Ruby.ORDER_HIGH];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = number_to_check + ' % 1 == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.Ruby.valueToCode(block, 'DIVISOR',
          Blockly.Ruby.ORDER_MULTIPLICATIVE);
      if (!divisor || divisor == '0') {
        return ['nil', Blockly.Ruby.ORDER_ATOMIC];
      }
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.Ruby.ORDER_RELATIONAL];
};

Blockly.Ruby['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.Ruby.valueToCode(block, 'DELTA',
      Blockly.Ruby.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Ruby.nameDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' += ' + argument0 + '\n';
};

Blockly.Ruby['math_round'] = Blockly.Ruby['math_single'];
Blockly.Ruby['math_trig'] = Blockly.Ruby['math_single'];

Blockly.Ruby['math_on_list'] = function(block) {
  var func = block.getFieldValue('OP');
  var list = Blockly.Ruby.valueToCode(block, 'LIST',
      Blockly.Ruby.ORDER_NONE) || '[]';
  var functionName;

  switch (func) {
    case 'SUM':
      return ['(' + list + ').inject(:+)', Blockly.Ruby.ORDER_HIGH];
      break;

    case 'MIN':
      return ['(' + list + ').min', Blockly.Ruby.ORDER_HIGH];
      break;

    case 'AVERAGE':
      functionName = Blockly.Ruby.provideFunction_(
          'math_average',
          ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(arr)',
           '  return ' + '(arr).inject(:+) / arr.length',
           'end']);
      break;

    case 'MAX':
      return ['(' + list + ').max', Blockly.Ruby.ORDER_HIGH];
      break;

    case 'MEDIAN':
      functionName = Blockly.Ruby.provideFunction_(
          'math_median',
          ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(arr)',
           '  # Source: https://stackoverflow.com/a/14859546/10896648',
           '  return nil if array.empty?',
           '  sorted = array.sort',
           '  len = sorted.length',
           '  (sorted[(len - 1) / 2] + sorted[len / 2]) / 2.0',
           'end']);
      break;

    case 'MODE':
      functionName = Blockly.Ruby.provideFunction_(
          'math_modes',
          ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(arr)',
           '  # Source: https://stackoverflow.com/a/26250044/10896648',
           '  hash = Hash.new(0)',
           '  arr.each do |i|',
           '    hash[i] += 1',
           '  end',
           '  return hash',
           'end']);
      break;

    case 'STD_DEV':
      functionName = Blockly.Ruby.provideFunction_(
          'math_standard_deviation',
          ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(arr)',
           '  # Source: https://stackoverflow.com/a/7749613/10896648',
           '  m = arr.inject(0) { |accum, i| accum + i } / arr.length.to_f',
           '  sum = arr.inject(0) { |accum, i| accum + (i - m) ** 2 }',
           '  return Math.sqrt(sum /= (arr.length - 1).to_f)',
           'end']);
      break;

    case 'RANDOM':
      return ['(' + list + ').sample', Blockly.Ruby.ORDER_HIGH];
      break;

    default:
      throw Error('Unknown operator: ' + func);
  }
  return [functionName + '(' + list + ')', Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['math_modulo'] = function(block) {
  var argument0 = Blockly.Ruby.valueToCode(block, 'DIVIDEND',
      Blockly.Ruby.ORDER_MULTIPLICATIVE) || '0';
  var argument1 = Blockly.Ruby.valueToCode(block, 'DIVISOR',
      Blockly.Ruby.ORDER_MULTIPLICATIVE) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.Ruby.ORDER_MULTIPLICATIVE];
};

Blockly.Ruby['math_constrain'] = function(block) {
  var argument0 = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_NONE) || '0';
  var argument1 = Blockly.Ruby.valueToCode(block, 'LOW',
      Blockly.Ruby.ORDER_NONE) || '-Float::INFINITY';
  var argument2 = Blockly.Ruby.valueToCode(block, 'HIGH',
      Blockly.Ruby.ORDER_NONE) || 'Float::INFINITY';
  var code = '[[' + argument0 + ', ' + argument1 + '].max, ' +
      argument2 + '].min';
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['math_random_int'] = function(block) {
  var argument0 = Blockly.Ruby.valueToCode(block, 'FROM',
      Blockly.Ruby.ORDER_NONE) || '0';
  var argument1 = Blockly.Ruby.valueToCode(block, 'TO',
      Blockly.Ruby.ORDER_NONE) || '0';
  var code = '(rand(' + argument1 + "-1" + ')+' + argument0 + ')';
  return [code, Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['rand()', Blockly.Ruby.ORDER_HIGH];
};

Blockly.Ruby['math_atan2'] = function(block) {
  var argument0 = Blockly.Ruby.valueToCode(block, 'X',
      Blockly.Ruby.ORDER_NONE) || '0';
  var argument1 = Blockly.Ruby.valueToCode(block, 'Y',
      Blockly.Ruby.ORDER_NONE) || '0';
  return ['Math.atan2(' + argument1 + ', ' + argument0 + ') * 180 / Math::PI',
      Blockly.Ruby.ORDER_HIGH];
};
