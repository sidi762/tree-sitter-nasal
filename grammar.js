// grammar.js

module.exports = grammar({
  name: 'nasal',

  /*
   * This tells Tree-sitter how to treat whitespace & comments.
   * Here we allow any whitespace plus line-based comments (# ...).
   */
  extras: $ => [
    /\s+/,
    $.comment
  ],

  /*
   * By default, Tree-sitter uses the 'word' rule to detect boundaries
   * for certain editor features. Setting word = $.identifier helps
   * with e.g. cursor movement, code selection, etc.
   */
  word: $ => $.identifier,

  /*
   * If you see parse conflicts, you can declare them here.
   * For instance, expression statements can conflict with function calls,
   * multi-assign can conflict with “(var a,b,c) call” syntax, etc.
   * Add lines if Tree-sitter complains about unresolved conflicts.
   */
   conflicts: $ => [
     [$.expression_statement, $.call_expression],
     [$.expression_statement, $.binary_expression],
     [$.expression_statement, $.call_expression, $.subscript_expression],
     [$.block, $.hash_literal],
     [$.function_definition, $.function_expression],
     [$.multi_assignment, $.call_expression],
     [$.multi_assignment, $.binary_expression],
     [$.multi_assignment, $.call_expression, $.subscript_expression],
     [$.hash_call, $.member_expression],
     [$.slice, $.subscript_expression],
     [$.variable_declaration, $.call_expression],
     [$.variable_declaration, $.binary_expression],
     [$.variable_declaration, $.call_expression, $.subscript_expression],
     [$.tuple_expr, $.parenthesized_expression],
     [$.variable_declaration],
   ],


  /*
   * Precedence tiers roughly reflecting your parse::calc() chain:
   * 1) unary
   * 2) multiplicative (*, /)
   * 3) additive (+, -)
   * 4) bitwise ops (&, ^, |)
   * 5) logical and/or
   * 6) null_coalescing (??)
   * 7) ternary (? :)
   * 8) assignment operators (=, +=, etc.)
   * 9) tuple
   *
   * Also "member" and "call" for member access / calls, used by many Tree-sitter grammars.
   */
  precedences: $ => [
    [
      'member',
      'call',
      'unary',
      'binary_mult',
      'binary_add',
      'binary_bitwise',
      'binary_logical',
      'null_chain',
      'ternary',
      'assignment',
      'tuple'
    ]
  ],

  /*
   * The top-level structure: a source file is just zero or more statements.
   */
  rules: {
    source_file: $ => repeat($._statement),

    //
    // ───────────────────────────── STATEMENTS ─────────────────────────────
    //
    _statement: $ => choice(
      $.expression_statement,
      $.use_statement,
      $.variable_declaration,
      $.function_definition,
      $.if_statement,
      $.for_statement,
      $.foreach_statement,
      $.forindex_statement,
      $.while_statement,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.multi_assignment,
      $.block
    ),

    expression_statement: $ => seq(
      $._expression,
      optional(';')
    ),

    // "block" is recognized only in _statement or other statement constructs
    block: $ => seq(
      '{',
      repeat($._statement),
      '}'
    ),

    // "hash_literal" is recognized in expressions as { key: value, ... }
    hash_literal: $ => seq(
      '{',
      optional(commaSep1($.hash_pair)),
      '}'
    ),

    use_statement: $ => seq(
      'use',
      field('path', seq($.identifier, repeat(seq('.', $.identifier)))),
      optional(';')
    ),

    //
    // ───────────────────────── VARIABLE DECLARATION ───────────────────────
    //
    variable_declaration: $ => seq(
      'var',
      choice(
        // single identifier or (multiple)
        $.identifier,
        $.multi_identifier
      ),
      '=',
      choice($._expression, $.tuple_expr),
      optional(';')
    ),

    // multi_identifier => ( a, b, c )
    multi_identifier: $ => seq(
      '(',
      commaSep1($.identifier),
      ')'
    ),

    //
    // ────────────────────────── TUPLES & MULTI-ASSIGN ─────────────────────
    //
    // e.g. (1, 2, 3)
    tuple_expr: $ => prec.right('tuple', seq(
      '(',
      commaSep($._expression),
      ')'
    )),

    // e.g. (a, b, c) = (1, 2, 3);
    multi_assignment: $ => seq(
      field('left', $.tuple_expr),
      '=',
      field('right', choice($._expression, $.tuple_expr)),
      optional(';')
    ),

    //
    // ─────────────────────── FUNCTION DEFINITION ──────────────────────────
    //
    function_definition: $ => seq(
      'func',
      optional(field('name', $.identifier)), // e.g. func foo( ... ) { ... }
      field('parameters', $.parameter_list),
      field('body', $.block)
    ),

    parameter_list: $ => seq(
      '(',
      optional(commaSep($.parameter)),
      ')'
    ),

    parameter: $ => seq(
      field('name', $.identifier),
      optional(seq(
        '=',
        field('default_value', $._expression)
      )),
      optional('...')
    ),

    //
    // ────────────────────────── CONTROL STRUCTURES ────────────────────────
    //
    if_statement: $ => seq(
      'if',
      '(',
      field('condition', $._expression),
      ')',
      field('consequence', $.block),
      repeat($.elsif_clause),
      optional($.else_clause)
    ),

    elsif_clause: $ => seq(
      'elsif',
      '(',
      field('condition', $._expression),
      ')',
      field('consequence', $.block)
    ),

    else_clause: $ => seq(
      'else',
      field('consequence', $.block)
    ),

    while_statement: $ => seq(
      'while',
      '(',
      field('condition', $._expression),
      ')',
      field('body', $.block)
    ),

    for_statement: $ => seq(
      'for',
      '(',
      field('initializer', optional(choice($.variable_declaration, $._expression))),
      ';',
      field('condition', optional($._expression)),
      ';',
      field('increment', optional($._expression)),
      ')',
      field('body', $.block)
    ),

    foreach_statement: $ => seq(
      'foreach',
      '(',
      field('variable', choice(
        // var a, or just a, or possibly a call
        seq('var', $.identifier),
        $.identifier,
        $.call_expression
      )),
      ';',
      field('collection', $._expression),
      ')',
      field('body', $.block)
    ),

    forindex_statement: $ => seq(
      'forindex',
      '(',
      field('variable', choice(
        seq('var', $.identifier),
        $.identifier,
        $.call_expression
      )),
      ';',
      field('collection', $._expression),
      ')',
      field('body', $.block)
    ),

    return_statement: $ => seq(
      'return',
      optional($._expression),
      ';'
    ),

    break_statement: $ => seq('break', optional(';')),
    continue_statement: $ => seq('continue', optional(';')),

    //
    // ───────────────────────────── EXPRESSIONS ────────────────────────────
    //
    _expression: $ => choice(
      $.nil_literal,
      $.boolean_literal,
      $.number_literal,
      $.string_literal,
      $.identifier,
      $.array_literal,
      $.hash_literal,
      $.function_expression, // an inline func
      $.call_expression,
      $.binary_expression,
      $.unary_expression,
      $.ternary_expression,
      $.assignment_expression,
      $.member_expression,
      $.subscript_expression,
      $.null_coalescing_expression,
      $.parenthesized_expression
    ),

    nil_literal: $ => 'nil',
    boolean_literal: $ => choice('true', 'false'),

    number_literal: $ => choice(
      // decimal with optional fraction/exponent
      /\d+(\.\d+)?([eE][+-]?\d+)?/,
      // hex
      /0[xX][0-9A-Fa-f]+/
    ),

    string_literal: $ => choice(
      seq(
        '"',
        repeat(choice(token.immediate(/[^"\\]+/), $.escaped_character)),
        '"'
      ),
      seq(
        "'",
        repeat(choice(token.immediate(/[^'\\]+/), $.escaped_character)),
        "'"
      )
    ),

    escaped_character: $ => token.immediate(seq(
      '\\',
      // Matches e.g. octal, hex, or single-char escape
      choice(
        /[0-7]{1,3}/,
        /x[0-9A-Fa-f]{2}/,
        /['"\\abfnrtv]/,
        /./
      )
    )),

    // `identifier` roughly matches [a-zA-Z_][a-zA-Z0-9_]*
    identifier: $ => /[a-zA-Z_]\w*/,

    array_literal: $ => seq(
      '[',
      commaSep($._expression),
      ']'
    ),

    hash_literal: $ => choice(
      // empty
      seq('{', '}'),
      // non-empty
      seq('{', commaSep1($.hash_pair), '}')
    ),

    hash_pair: $ => seq(
      field('key', choice($.identifier, $.string_literal)),
      ':',
      field('value', $._expression)
    ),

    function_expression: $ => seq(
      'func',
      field('parameters', $.parameter_list),
      field('body', $.block)
    ),

    // ─────────────────────────────── CALL CHAINS ─────────────────────────
    // e.g. f(...) or x[1] or x?.prop etc. with repeated calls

    // call_expression => left-expression "call-chains"
    call_expression: $ => prec.left('call', seq(
      field('function', $._expression),
      repeat1(choice(
        $.function_call,
        $.vector_call,
        $.hash_call,
        $.null_access_call
      ))
    )),

    // a normal function call: e.g. (expr1, expr2) or maybe named args (a:1, b:2) – see below
    function_call: $ => seq(
      '(',
      // We optionally support “special call” if your grammar allows colons in argument
      // pairs. That is, a: 1, b: 2. If that’s a separate rule, adapt it here.
      commaSep(choice($.hash_pair, $._expression)),
      ')'
    ),

    // Indexing: e.g. [ index or slice ]
    vector_call: $ => seq(
      '[',
      commaSep1($.slice),
      ']'
    ),

    slice: $ => choice(
      // Single index, e.g. arr[expr]
      $._expression,

      // Colon-based slices with optional start/end, e.g. arr[start:end], arr[:end], arr[start:]
      seq(
        optional($._expression),
        ':',
        optional($._expression)
      )
    ),


    // For property access: .property
    hash_call: $ => seq(
      '.',
      field('property', $.identifier)
    ),

    // For null-access property: ?.property
    null_access_call: $ => seq(
      '?.',
      field('property', $.identifier)
    ),

    //
    // ────────────────────── BINARY / TERNARY / UNARY OPS ─────────────────
    //
    // We define them by precedence. This grammar lumps some together, but you can
    // subdivide them for more refined precedence if needed.

    binary_expression: $ => choice(
      // Range operator / concat operator ".."?
      // If your parser uses e.g. “..” for string concatenation, handle it here:
      // prel('binary_add', etc.)

      // Multiplicative
      prec.left('binary_mult', seq($._expression, choice('*', '/'), $._expression)),

      // Additive
      prec.left('binary_add', seq($._expression, choice('+', '-', '~'), $._expression)),

      // Bitwise operators: & ^ |
      prec.left('binary_bitwise', seq($._expression, choice('&', '^', '|'), $._expression)),

      // Logical AND/OR
      prec.left('binary_logical', seq($._expression, choice('and', 'or'), $._expression)),

      // Comparisons: == != < <= > >=
      prec.left(seq(
        $._expression,
        choice('==', '!=', '<', '<=', '>', '>='),
        $._expression
      ))
    ),

    // e.g. left ?? right
    null_coalescing_expression: $ => prec.left('null_chain', seq(
      $._expression,
      '??',
      $._expression
    )),

    // e.g. condition ? consequence : alternative
    ternary_expression: $ => prec.right('ternary', seq(
      $._expression,
      '?',
      $._expression,
      ':',
      $._expression
    )),

    // e.g. !x, -x, ~x
    unary_expression: $ => prec.right('unary', seq(
      choice('!', '-', '~'),
      $._expression
    )),

    // e.g. ( expr )
    parenthesized_expression: $ => seq(
      '(',
      $._expression,
      ')'
    ),

    // e.g. obj.member
    member_expression: $ => prec.left('member', seq(
      $._expression,
      '.',
      $.identifier
    )),

    // e.g. arr[expr]
    subscript_expression: $ => prec.left('member', seq(
      $._expression,
      '[',
      $._expression,
      ']'
    )),

    // e.g. x = y, x += y, x -= y, etc.
    assignment_expression: $ => prec.right('assignment', seq(
      field('left', choice($.identifier, $.member_expression, $.subscript_expression)),
      field('operator', choice('=', '+=', '-=', '*=', '/=', '~=', '&=', '|=', '^=')),
      field('right', $._expression)
    )),

    //
    // ─────────────────────────── COMMENTS ────────────────────────────────
    //
    comment: $ => token(seq('#', /[^\n]*/)),
  }
});

/*
 * ───────────────────────────── HELPERS ─────────────────────────────
 *
 * Comma-separated sequences are often repeated in grammar definitions.
 * This is a convenient utility function to keep rules tidy.
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','));
}
