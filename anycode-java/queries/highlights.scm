[
  "abstract"
  "assert"
  "break"
  "case"
  "catch"
  "class"
  "continue"
  "default"
  "do"
  "else"
  "enum"
  "extends"
  "final"
  "finally"
  "for"
  "if"
  "implements"
  "import"
  "instanceof"
  "interface"
  "native"
  "new"
  "package"
  "private"
  "protected"
  "public"
  "return"
  "static"
  "strictfp"
  "super"
  "switch"
  "synchronized"
  "this"
  "throw"
  "throws"
  "transient"
  "try"
  "volatile"
  "while"
  "record"
  "permits"
  "sealed"
  "non-sealed"
  "yield"
] @keyword

(line_comment) @comment
(block_comment) @comment

(string_literal) @string

(decimal_integer_literal) @number
(hex_integer_literal) @number
(octal_integer_literal) @number
(binary_integer_literal) @number
(decimal_floating_point_literal) @number
(hex_floating_point_literal) @number

(class_declaration
  name: (identifier) @class)

(interface_declaration
  name: (identifier) @interface)

(enum_declaration
  name: (identifier) @enum)

(method_declaration
  name: (identifier) @method)

(constructor_declaration
  name: (identifier) @constructor)

(field_declaration
  declarator: (variable_declarator
    name: (identifier) @property))

(formal_parameter
  name: (identifier) @parameter)

(method_invocation
  name: (identifier) @function)

(type_identifier) @type
